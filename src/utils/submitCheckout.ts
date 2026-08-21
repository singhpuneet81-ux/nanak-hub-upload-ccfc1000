/**
 * Shared checkout submission utility.
 * Collects all customer & selection data and prepares the payload.
 * Files are sent as binary via FormData (multipart/form-data) so your
 * API can directly access them as uploaded files (e.g., req.files in Express/Multer).
 *
 * Usage:
 *   await submitCheckout({ serviceKey, customer, selections, pricing, meta });
 */

export interface SubmissionPayload {
  serviceKey: string;
  timestamp: string;
  customer: Record<string, any>;
  selections: Record<string, any>;
  pricing: Record<string, any> | null;
  meta?: Record<string, any>;
}

/**
 * Recursively extract all File objects from a nested object.
 * Returns a flat array of { path, file } entries where path is like "customer.idProof".
 */
function extractFiles(
  obj: Record<string, any>,
  prefix: string = ""
): { path: string; file: File }[] {
  const files: { path: string; file: File }[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (value instanceof File) {
      files.push({ path: fullPath, file: value });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          files.push({ path: `${fullPath}[${index}]`, file: item });
        } else if (item && typeof item === "object" && !(item instanceof Date)) {
          files.push(...extractFiles(item, `${fullPath}[${index}]`));
        }
      });
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      files.push(...extractFiles(value, fullPath));
    }
  }

  return files;
}

/**
 * Recursively strip File objects from a nested object,
 * replacing them with metadata references so the JSON payload stays clean.
 */
function stripFiles(obj: Record<string, any>, prefix: string = ""): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (value instanceof File) {
      // Replace file with a reference — the actual binary is in FormData
      result[key] = {
        _type: "file_reference",
        fieldPath: fullPath,
        fileName: value.name,
        fileSize: value.size,
        fileType: value.type,
      };
    } else if (Array.isArray(value)) {
      result[key] = value.map((item, index) => {
        if (item instanceof File) {
          return {
            _type: "file_reference",
            fieldPath: `${fullPath}[${index}]`,
            fileName: item.name,
            fileSize: item.size,
            fileType: item.type,
          };
        } else if (item && typeof item === "object" && !(item instanceof Date)) {
          return stripFiles(item, `${fullPath}[${index}]`);
        }
        return item;
      });
    } else if (value && typeof value === "object" && !(value instanceof Date)) {
      result[key] = stripFiles(value, fullPath);
    } else {
      result[key] = value;
    }
  }

  return result;
}

interface SubmitCheckoutArgs {
  serviceKey: string;
  customer: Record<string, any>;
  selections: Record<string, any>;
  pricing: Record<string, any> | null;
  /** Any extra service-specific data (line items, add-ons, etc.) */
  meta?: Record<string, any>;
}

/**
 * Build a FormData object containing:
 *   - "payload" field: JSON string with all non-file data + file references
 *   - One field per file: keyed by its dot-path (e.g., "customer.idProof")
 *
 * Your Express/Multer backend can then:
 *   1. Parse JSON from req.body.payload (or the "payload" field)
 *   2. Access binary files from req.files, keyed by their field paths
 */
export function buildFormData({
  serviceKey,
  customer,
  selections,
  pricing,
  meta,
}: SubmitCheckoutArgs): FormData {
  // 1. Extract all File objects from customer & meta
  const customerFiles = extractFiles(customer, "customer");
  const metaFiles = meta ? extractFiles(meta, "meta") : [];
  const allFiles = [...customerFiles, ...metaFiles];

  // 2. Build clean JSON payload (files replaced with references)
  const cleanCustomer = stripFiles(customer, "customer");
  const cleanMeta = meta ? stripFiles(meta, "meta") : undefined;

  const jsonPayload: SubmissionPayload = {
    serviceKey,
    timestamp: new Date().toISOString(),
    customer: cleanCustomer,
    selections,
    pricing,
    meta: cleanMeta,
  };

  // 3. Pack into FormData
  const formData = new FormData();
  formData.append("payload", JSON.stringify(jsonPayload));

  // Append each file using its dot-path as the field name
  for (const { path, file } of allFiles) {
    formData.append(path, file, file.name);
  }

  return formData;
}

/**
 * The base URL for your backend API.
 * Update this to your actual backend URL when deployed.
 */
const API_BASE_URL = "https://api.cavaluer.com";

/**
 * Call this from every Review & Pay step.
 * Builds a FormData with binary files + JSON payload,
 * sends it to the backend API, and shows a success/error popup.
 */
export async function submitCheckout(args: SubmitCheckoutArgs): Promise<void> {
  const formData = buildFormData(args);

  // Extract info for logging
  const payloadJson = formData.get("payload") as string;
  const parsedPayload = JSON.parse(payloadJson);

  // Count attached files
  const fileEntries: { field: string; name: string; size: number; type: string }[] = [];
  formData.forEach((value, key) => {
    if (key !== "payload" && value instanceof File) {
      fileEntries.push({
        field: key,
        name: value.name,
        size: value.size,
        type: value.type,
      });
    }
  });

  console.group(`🧾 ${args.serviceKey.toUpperCase()} – Checkout Submission`);
  console.log("📋 Payload (JSON):", parsedPayload);
  if (fileEntries.length > 0) {
    console.log(`📎 ${fileEntries.length} file(s) attached as binary:`, fileEntries);
  } else {
    console.log("📎 No files attached");
  }
  console.log("📦 Raw FormData object:", formData);
  console.groupEnd();

  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout/submit`, {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type — browser auto-sets multipart boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // If backend returns a Stripe checkout URL, redirect user to payment
    if (data.success && data.stripeCheckoutUrl) {
      const { toast } = await import("sonner");
      toast.info("Processing your payment…", {
        description: "Please don't refresh or close this page. You'll be redirected shortly.",
        duration: 5000,
      });

      // Save current page so we can return here if payment is cancelled
      sessionStorage.setItem("checkout_return_url", window.location.href);

      // Small delay so user sees the toast before redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = data.stripeCheckoutUrl;
      return;
    }

    // Fallback: no Stripe URL, just show success
    const { toast } = await import("sonner");
    toast.info("Processing your payment…", {
      description: "Please don't refresh or close this page. You'll be redirected shortly.",
      duration: 6000,
    });

    return;
  } catch (error) {
    console.error("❌ Submission failed:", error);

    const { toast } = await import("sonner");
    toast.error("Submission failed", {
      description: "Something went wrong. Please try again or contact our support team.",
      duration: 5000,
    });

    throw error;
  }
}
