export type PricingServiceKey =
  | "abn"
  | "business_name"
  | "family_trust"
  | "gst"
  | "charity"
  | "company"
  | "smsf";

export interface ServicePackage {
  name: string;
  price: number;
  features: string[];
}

export interface AccountingPackage {
  id: string;
  name: string;
  monthlyPrice: number;
  features: string[];
  popular?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  recurring?: boolean;
}

export interface ServiceConfig {
  serviceKey: PricingServiceKey;
  displayName: string;
  description: string;
  foundationPrice: number;
  govtFee?: number;
  accountingPackages: AccountingPackage[];
  addOns: AddOn[];
  formFields: FormFieldConfig[];
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "date" | "number";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  conditionalOn?: {
    field: string;
    value: string | string[];
  };
  halfWidth?: boolean;
}

export interface CheckoutState {
  currentStep: number;
  serviceKey: PricingServiceKey;
  formData: Record<string, string>;
  selectedPackageType: "registration_only" | "registration_and_accounting";
  selectedAccountingPackage: string | null;
  selectedAddOns: string[];
}

export interface PricingSummary {
  registrationFee: number;
  govtFee: number;
  accountingMonthly: number;
  addOnsTotal: number;
  total: number;
}
