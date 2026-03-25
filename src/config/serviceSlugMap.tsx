import { PricingServiceKey } from "@/config/pricing.config";

export const SLUG_TO_SERVICE_KEY: Record<string, PricingServiceKey> = {
  "abn-registration": "abn",
  "business-name-registration": "business_name",
  "family-trust-setup": "family_trust",
  "unit-trust-setup": "unit_trust",
  "gst-registration": "gst",
  "charity-setup": "charity",
  "register-a-company": "company",
  "smsf-setup": "smsf",
  "partnership-registration": "partnership",
  "bare-trust-setup": "bare_trust",
};
