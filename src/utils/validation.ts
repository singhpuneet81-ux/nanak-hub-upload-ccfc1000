/**
 * Centralized form validation utilities for all checkout flows.
 */

/** Name: letters, spaces, hyphens, apostrophes, min 2 chars */
export const validateName = (value: string): string | null => {
  if (!value.trim()) return "Name is required";
  if (value.trim().length < 2) return "Name must be at least 2 characters";
  if (!/^[a-zA-Z\s\-''.]+$/.test(value.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return null;
};

/** Australian postcode: exactly 4 digits */
export const validatePostcode = (value: string): string | null => {
  const cleaned = value.replace(/\s/g, "");
  if (!cleaned) return "Postcode is required";
  if (!/^\d{4}$/.test(cleaned)) return "Postcode must be 4 digits";
  return null;
};

/** Remove spaces, hyphens, and check length/digits only */
export const validateABN = (value: string): string | null => {
  const cleaned = value.replace(/[\s\-]/g, "");
  if (!cleaned) return "ABN is required";
  if (!/^\d+$/.test(cleaned)) return "ABN must be digits only";
  if (cleaned.length !== 11) return "ABN must be 11 digits";
  return null;
};

export const validateACN = (value: string): string | null => {
  const cleaned = value.replace(/[\s\-]/g, "");
  if (!cleaned) return "ACN is required";
  if (!/^\d+$/.test(cleaned)) return "ACN must be digits only";
  if (cleaned.length !== 9) return "ACN must be 9 digits";
  return null;
};

export const validateTFN = (value: string): string | null => {
  const cleaned = value.replace(/[\s\-]/g, "");
  if (!cleaned) return "TFN is required";
  if (!/^\d+$/.test(cleaned)) return "TFN must be digits only";
  if (cleaned.length !== 9) return "TFN must be 9 digits";
  return null;
};

export const validateEmail = (value: string): string | null => {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Please enter a valid email";
  }
  return null;
};

/**
 * Phone: allow leading +, remove spaces/hyphens, min 8 digits, max 15 digits.
 */
export const validatePhone = (value: string): string | null => {
  if (!value.trim()) return "Phone number is required";
  const cleaned = value.trim().replace(/[\s\-]/g, "");
  // Must be digits (optionally prefixed with +)
  if (!/^\+?\d+$/.test(cleaned)) return "Please enter a valid phone number";
  const digitCount = cleaned.replace(/^\+/, "").length;
  if (digitCount < 8 || digitCount > 15) return "Please enter a valid phone number";
  return null;
};

/** Validates an optional ABN — only if value is non-empty */
export const validateABNOptional = (value: string): string | null => {
  if (!value || !value.trim()) return null;
  return validateABN(value);
};

/** Validates an optional TFN — only if value is non-empty */
export const validateTFNOptional = (value: string): string | null => {
  if (!value || !value.trim()) return null;
  return validateTFN(value);
};

/** Validates an optional name — only if value is non-empty */
export const validateNameOptional = (value: string): string | null => {
  if (!value || !value.trim()) return null;
  return validateName(value);
};
