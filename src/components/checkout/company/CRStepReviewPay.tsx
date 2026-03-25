import React, { useState, useCallback, useRef } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Building2, Users, Upload, Check, X, Shield, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { usePricingPackages } from "@/hooks/usePricingPackages";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const ASIC_FEE = 611;

interface CRStepReviewPayProps {
  onBack: () => void;
  onGoToStep: (step: number) => void;
}

export const CRStepReviewPay: React.FC<CRStepReviewPayProps> = ({ onBack, onGoToStep }) => {
  const { customer } = useCheckout();
  const { packages, serviceMeta } = usePricingPackages();
  const SERVICE_FEE = packages.company.foundation.price;

  // File upload state (binary files for FormData)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [signatoryName, setSignatoryName] = useState("");

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // (Payment handled by Stripe redirect)

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- File Upload Handlers ---
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  }, []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  }, []);
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Signature Handlers ---
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  React.useEffect(() => { initCanvas(); }, [initCanvas]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing && hasSignature && canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureData("");
  };

  // --- Validation ---
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (uploadedFiles.length === 0) newErrors.files = "Please upload at least one ID document";
    if (!signatoryName.trim()) newErrors.signatoryName = "Please enter the signatory's full name";
    if (!declarationAccepted) newErrors.declaration = "You must accept the declaration";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // Build file map for binary submission
      const fileMap: Record<string, File> = {};
      uploadedFiles.forEach((file, i) => {
        fileMap[`idDocument_${i}`] = file;
      });

      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "company_registration",
        customer: {
          ...customer,
          ...fileMap,
          signatoryName,
          declarationAccepted,
        },
        selections: {
          package: customer.crPackage,
          turnover: customer.crTurnover,
          billingCycle: customer.crBillingCycle,
          payrollEnabled: customer.crPayrollEnabled,
          staffCount: customer.crStaffCount,
          addons: {
            businessName: customer.crAddonBusinessName,
            gst: customer.crAddonGST,
            registeredOffice: customer.crAddonRegisteredOffice,
          },
        },
        pricing: (() => {
          const companyMeta = serviceMeta?.company as {
            packagePlans?: {
              plans?: { id: string; tierPricing: Record<string, { standard: number; bundle: number }> }[];
            };
          } | undefined;
          const apiPackagePlans = companyMeta?.packagePlans;

          const bnEnabled = !!customer.crAddonBusinessName;
          const bnTerm = (customer.crBusinessNameTerm as string) || "1yr";
          const bnPrice = bnEnabled ? (bnTerm === "3yr" ? 253 : 196) : 0;
          const gstPrice = customer.crAddonGST ? 49 : 0;
          const officePrice = customer.crAddonRegisteredOffice ? 220 : 0;
          const crPkg = (customer.crPackage as string) || "";
          const turnover = (customer.crTurnover as string) || "";
          const billing = (customer.crBillingCycle as "monthly" | "annual") || "monthly";
          const packageLevel = (customer.crPackageLevel as string) || apiPackagePlans?.plans?.[0]?.id || "";
          let acctFee = 0;
          if (crPkg === "registration_plus_accounting" && turnover && apiPackagePlans?.plans?.length) {
            const plan = apiPackagePlans.plans.find((p) => p.id === packageLevel);
            const tier = plan?.tierPricing?.[turnover];
            if (tier) {
              acctFee = billing === "annual" ? tier.bundle : tier.standard;
            }
          }
          const payrollFee = customer.crPayrollEnabled ? ((customer.crStaffCount as number) || 1) * 20 : 0;
          const sub = SERVICE_FEE + ASIC_FEE + bnPrice + gstPrice + officePrice + acctFee + payrollFee;
          const gstAmt = Math.round((sub - ASIC_FEE) * 0.1);
          return { serviceFee: SERVICE_FEE, asicFee: ASIC_FEE, businessNameFee: bnPrice, gstRegistrationFee: gstPrice, registeredOfficeFee: officePrice, accountingFee: acctFee, payrollFee, subtotal: sub, gst: gstAmt, total: sub + gstAmt };
        })(),
      });
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Data for review ---
  const directors = (customer.crDirectors as any[]) || [];
  const shareholders = (customer.crShareholders as any[]) || [];

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review & Complete Payment</h2>
        <p className="text-muted-foreground mt-1">Review your details, sign declaration, and complete payment</p>
      </div>

      {/* Company Details Review */}
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Company Details</h3>
          </div>
          <button
            onClick={() => onGoToStep(1)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>
        <div className="space-y-1.5 text-sm">
          <p><span className="text-muted-foreground">Company Name:</span> <span className="font-medium text-foreground">{customer.crCompanyName || "—"}</span></p>
          <p><span className="text-muted-foreground">Business Activity:</span> <span className="font-medium text-foreground">{customer.crBusinessActivity || "—"}</span></p>
        </div>
      </div>

      {/* Directors & Shareholders Review */}
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Directors & Shareholders</h3>
          </div>
          <button
            onClick={() => onGoToStep(2)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>
        <div className="space-y-1.5 text-sm">
          <p><span className="text-muted-foreground">Directors:</span> <span className="font-medium text-foreground">{directors.length}</span></p>
          {directors.map((d: any, i: number) => (
            <p key={i} className="pl-4 text-muted-foreground">• {d.fullName || `Director ${i + 1}`}</p>
          ))}
          <p className="mt-2"><span className="text-muted-foreground">Shareholders:</span> <span className="font-medium text-foreground">{shareholders.length}</span></p>
          {shareholders.map((s: any, i: number) => (
            <p key={i} className="pl-4 text-muted-foreground">• {s.fullName || `Shareholder ${i + 1}`} — {s.numberOfShares || 0} shares</p>
          ))}

          {/* Company Secretary & Public Officer */}
          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
            <p>
              <span className="text-muted-foreground">Company Secretary:</span>{" "}
              <span className="font-medium text-foreground">{(customer.crCompanySecretary as string) || "—"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Public Officer:</span>{" "}
              <span className="font-medium text-foreground">{(customer.crPublicOfficer as string) || "—"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Upload ID Documents */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Upload ID Documents <span className="text-destructive">*</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Please upload proof of identity for all directors (Driver's License, Passport, or Medicare Card)
        </p>

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 mb-3">
            {uploadedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 border border-border rounded-lg p-3 bg-[hsl(142_76%_98%)]">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--success))] flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => removeFile(i)} className="p-1.5 hover:bg-destructive/10 rounded-lg">
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Click to upload documents</p>
          <p className="text-xs text-muted-foreground mt-1">or drag and drop files here</p>
          <p className="text-xs text-muted-foreground mt-2">Supported formats: PDF, JPG, PNG</p>
        </div>
        {errors.files && <p className="text-destructive text-sm mt-1">{errors.files}</p>}
      </div>

      {/* Sign Declaration */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Sign Declaration <span className="text-destructive">*</span>
        </label>
        {/* <p className="text-sm text-muted-foreground mb-3">Sign using your mouse or touch screen</p>
        <div className="relative border border-border rounded-xl bg-card overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-36 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <button
          type="button"
          onClick={clearSignature}
          className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
        >
          🖊 Clear Signature
        </button>
        {errors.signature && <p className="text-destructive text-sm mt-1">{errors.signature}</p>} */}

        {/* Signatory Name Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Full Name of Signatory <span className="text-destructive">*</span>
          </label>
          <Input
            value={signatoryName}
            onChange={(e) => setSignatoryName(e.target.value)}
            placeholder="Enter your full legal name to verify signature"
            className={errors.signatoryName ? "border-destructive" : ""}
          />
          {errors.signatoryName && <p className="text-destructive text-sm mt-1">{errors.signatoryName}</p>}
        </div>
      </div>

      {/* Declaration */}
      <div className="border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3">Declaration</h3>
        <p className="text-sm text-muted-foreground mb-3">I declare that:</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside mb-4">
          <li>All information provided is true and accurate</li>
          <li>I am authorized to register this company</li>
          <li>I consent to being an office holder of this company</li>
          <li>I understand my duties and obligations under the Corporations Act 2001</li>
          <li>I have read and agree to the Terms & Conditions</li>
        </ul>
        <div className="flex items-start gap-3">
          <Checkbox
            id="cr-declaration"
            checked={declarationAccepted}
            onCheckedChange={(checked) => setDeclarationAccepted(!!checked)}
            className="mt-0.5"
          />
          <label htmlFor="cr-declaration" className="text-sm font-medium text-foreground cursor-pointer">
            I accept the declaration and agree to the{" "}
            <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span>{" "}
            <span className="text-destructive">*</span>
          </label>
        </div>
        {errors.declaration && <p className="text-destructive text-sm mt-2">{errors.declaration}</p>}
      </div>


      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Proceed to Payment →"}
        </button>
      </div>
    </div>
    </>
  );
};
