// Central pricing + helpers for ABN checkout.
// Keep ALL numbers here so steps + OrderSummary always stay in sync.

export type BillingFrequency = "monthly" | "annual";
export type AccountingPlanId = "essential" | "professional" | "premium";
export type AddOnId = "gst" | "registered_office" | "business_name";

export const ABN_BASE_PRICE = 149; // static fallback
export const ANNUAL_DISCOUNT_MULTIPLIER = 0.85; // 15% off

export const ADDON_PRICES: Record<Exclude<AddOnId, "business_name">, number> = {
  gst: 49,
  registered_office: 149,
};

export const BUSINESS_NAME_TERMS = {
  "1yr": { label: "1 Year", price: 194, serviceFee: 149, asicFee: 45 },
  "3yr": { label: "3 Years", price: 253, serviceFee: 149, asicFee: 104 },
} as const;

export type BusinessNameTerm = keyof typeof BUSINESS_NAME_TERMS;

export const PLAN_ID_MAP: Record<string, AccountingPlanId> = {
  essential: "essential",
  founder_pro: "professional",
  premium: "premium",
};


export const ACCOUNTING_PLANS: Record<
  AccountingPlanId,
  { name: string; monthlyPrice: number }
> = {
  essential: { name: "Essential", monthlyPrice: 99 },
 professional: { name: "Founder Pro", monthlyPrice: 149 }, 
  premium: { name: "Premium", monthlyPrice: 249 },
};

export function getAccountingPlanPrice(
  plan: AccountingPlanId,
  billingFrequency: BillingFrequency
): number {
  const base = ACCOUNTING_PLANS[plan]?.monthlyPrice ?? 0;
  if (billingFrequency === "annual") return Math.round(base * 12 * ANNUAL_DISCOUNT_MULTIPLIER);
  return base;
}

export function getBusinessNamePrice(term: BusinessNameTerm): number {
  return BUSINESS_NAME_TERMS[term]?.price ?? BUSINESS_NAME_TERMS["1yr"].price;
}

export interface LineItem {
  name: string;
  price: number;
  isAddOn?: boolean;
  subText?: string;
}

// NOTE: We keep this helper tolerant of partially-filled state.
export function buildABNLineItems(params: {
  selections: {
    package?: string;
    billingFrequency?: BillingFrequency;
    accountingPlan?: string;
  };
  customer: {
    selectedAddons?: string[];
    businessNameTerm?: string;
  };
  basePrice?: number;
}): LineItem[] {
  const { selections, customer, basePrice } = params;
  const items: LineItem[] = [];

  // Base ABN Registration is always included in this flow.
  items.push({ name: "ABN Registration", price: basePrice ?? ABN_BASE_PRICE });

  const selectedAddons = customer.selectedAddons || [];

  if (selectedAddons.includes("gst")) {
    items.push({ name: "GST Registration", price: ADDON_PRICES.gst, isAddOn: true });
  }

  if (selectedAddons.includes("registered_office")) {
    items.push({
      name: "Registered Office Address",
      price: ADDON_PRICES.registered_office,
      isAddOn: true,
    });
  }

  if (selectedAddons.includes("business_name")) {
    const termRaw = (customer.businessNameTerm || "1yr") as BusinessNameTerm;
    const term = (termRaw in BUSINESS_NAME_TERMS ? termRaw : "1yr") as BusinessNameTerm;
    const termLabel = BUSINESS_NAME_TERMS[term].label;
    items.push({
      name: `Business Name Registration (${termLabel})`,
      price: getBusinessNamePrice(term),
      isAddOn: true,
    });
  }

  // Accounting package
  if (
    selections.package === "registration_plus_accounting" &&
    selections.accountingPlan
  ) {
    const frequency = selections.billingFrequency || "monthly";
    const plan = selections.accountingPlan;
    const planName = ACCOUNTING_PLANS[plan]?.name ?? "Essential";
  const planConfig = ACCOUNTING_PLANS[plan];

if (!planConfig) {
  return items; // or just skip adding accounting line
}

const baseMonthly = planConfig.monthlyPrice;

const finalPrice =
  frequency === "annual"
    ? Math.round(baseMonthly * 12 * ANNUAL_DISCOUNT_MULTIPLIER)
    : baseMonthly;

    items.push({
      name: `${planName} Accounting Plan`,
      price: finalPrice,
      subText: `${frequency === "annual" ? "Annual" : "Monthly"} billing`,
    });
  }

  return items;
}
