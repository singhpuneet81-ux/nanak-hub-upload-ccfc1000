/**
 * Accounting Pricing — Static fallback configuration
 * 
 * This is the frontend fallback used when the API at
 * GET /api/admin/accounting-pricing is unreachable.
 * 
 * Structure matches the backend seeder exactly so the
 * frontend can swap between API data and fallback seamlessly.
 */

export interface AccountingTierPricing {
  compliance: number;
  monthly: number;
  strikeCompliance?: number | null;
  strikeMonthly?: number | null;
}

export interface AccountingRevenueTier {
  id: string;
  label: string;
}

export interface AccountingStartDate {
  id: string;
  label: string;
  months: number;
  desc: string;
}

export interface AccountingAddons {
  catchUpFee: number;
  registeredOfficeFee: number;
  taxPlanningFee: number;
  payrollPerEmployee: number;
}

export interface AccountingPlan {
  title: string;
  subtitle: string;
  badge: string | null;
  features: string[];
  extraFeatures: string[];
}

export interface NFPAddon {
  id: string;
  label: string;
  key: string;
  value: number;
  note?: string;
}

export interface NFPPlan {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  features: string[];
}

export interface AccountingServicePricing {
  serviceKey: string;
  label: string;
  enableStrikePricing?: boolean;
  prorateCompliance?: boolean;
  tiers: Record<string, AccountingTierPricing>;
  revenueTiers: AccountingRevenueTier[];
  annualDiscount: number;
  transitionFee: number;
  startDates: AccountingStartDate[];
  addons: AccountingAddons;
  plans: {
    essential: AccountingPlan;
    premium: AccountingPlan;
  };
  nfpAddons?: NFPAddon[];
  nfpPlans?: NFPPlan[];
}

export const ACCOUNTING_PRICING_FALLBACK: AccountingServicePricing[] = [
  {
    serviceKey: "company_accounting",
    label: "Company Accounting",
    enableStrikePricing: true,
    tiers: {
      under75k:    { compliance: 1200, monthly: 100, strikeCompliance: 1500, strikeMonthly: 130 },
      "75to200k":  { compliance: 1400, monthly: 120, strikeCompliance: 1750, strikeMonthly: 150 },
      "200to500k": { compliance: 1600, monthly: 140, strikeCompliance: 2000, strikeMonthly: 175 },
      "500to1m":   { compliance: 1800, monthly: 160, strikeCompliance: 2250, strikeMonthly: 200 },
      "1mto2m":    { compliance: 2000, monthly: 180, strikeCompliance: 2500, strikeMonthly: 225 },
      "2mto5m":    { compliance: 2500, monthly: 200, strikeCompliance: 3125, strikeMonthly: 250 },
    },
    revenueTiers: [
      { id: "under75k", label: "Under $75K" },
      { id: "75to200k", label: "$75K – $200K" },
      { id: "200to500k", label: "$200K – $500K" },
      { id: "500to1m", label: "$500K – $1M" },
      { id: "1mto2m", label: "$1M – $2M" },
      { id: "2mto5m", label: "$2M – $5M" },
    ],
    annualDiscount: 0.20,
    transitionFee: 600,
    startDates: [
      { id: "jul", label: "1 July 2025", months: 12, desc: "Full Year" },
      { id: "oct", label: "1 October 2025", months: 9, desc: "9 months" },
      { id: "jan", label: "1 January 2026", months: 6, desc: "6 months" },
      { id: "apr", label: "1 April 2026", months: 3, desc: "3 months" },
    ],
    addons: { catchUpFee: 750, registeredOfficeFee: 300, taxPlanningFee: 500, payrollPerEmployee: 120 },
    plans: {
      essential: {
        title: "Essential", subtitle: "Compliance-focused", badge: null,
        features: ["Monthly Bookkeeping", "Quarterly BAS Lodgement", "Annual Tax Return", "Annual Financial Statements", "ASIC Annual Review"],
        extraFeatures: ["Accounts Payable Management", "Accounts Receivable Management", "Payroll Processing", "Bank & Credit Card Reconciliation", "Company Tax Return Lodgement"],
      },
      premium: {
        title: "Premium", subtitle: "Strategic growth", badge: "MOST POPULAR",
        features: ["Everything in Essential", "Tax Planning Sessions", "Priority Phone Support", "Monthly Management Reports", "Quarterly Strategy Meetings", "Dedicated Accountant"],
        extraFeatures: ["ASIC Annual Review", "Accounts Payable Management", "Accounts Receivable Management", "Payroll Processing", "Annual Financial Statements", "Bank & Credit Card Reconciliation", "Company Tax Return Lodgement", "Cloud Accounting Software Setup", "Quarterly Review Meetings", "Strategic Tax Advisory"],
      },
    },
  },
  {
    serviceKey: "trust_accounting",
    label: "Trust Accounting",
    enableStrikePricing: true,
    tiers: {
      under75k:    { compliance: 1000, monthly: 77, strikeCompliance: 1250, strikeMonthly: 100 },
      "75to200k":  { compliance: 1200, monthly: 95, strikeCompliance: 1500, strikeMonthly: 120 },
      "200to500k": { compliance: 1400, monthly: 115, strikeCompliance: 1750, strikeMonthly: 145 },
      "500to1m":   { compliance: 1600, monthly: 135, strikeCompliance: 2000, strikeMonthly: 170 },
      "1mto2m":    { compliance: 1800, monthly: 155, strikeCompliance: 2250, strikeMonthly: 195 },
      "2mto5m":    { compliance: 2200, monthly: 180, strikeCompliance: 2750, strikeMonthly: 225 },
    },
    revenueTiers: [
      { id: "under75k", label: "Under $75K" },
      { id: "75to200k", label: "$75K – $200K" },
      { id: "200to500k", label: "$200K – $500K" },
      { id: "500to1m", label: "$500K – $1M" },
      { id: "1mto2m", label: "$1M – $2M" },
      { id: "2mto5m", label: "$2M – $5M" },
    ],
    annualDiscount: 0.20,
    transitionFee: 600,
    startDates: [
      { id: "jul", label: "1 July 2025", months: 12, desc: "Full Year" },
      { id: "oct", label: "1 October 2025", months: 9, desc: "9 months" },
      { id: "jan", label: "1 January 2026", months: 6, desc: "6 months" },
      { id: "apr", label: "1 April 2026", months: 3, desc: "3 months" },
    ],
    addons: { catchUpFee: 750, registeredOfficeFee: 300, taxPlanningFee: 500, payrollPerEmployee: 120 },
    plans: {
      essential: {
        title: "Essential", subtitle: "Compliance-focused", badge: null,
        features: ["Trust Transaction Recording", "Trust Distribution Calculations", "Beneficiary Statements", "Trust Tax Return Preparation", "Quarterly BAS Lodgement"],
        extraFeatures: ["Bank & Credit Card Reconciliation", "Accounts Payable Management", "Accounts Receivable Management", "Trust Distribution Minutes", "Annual Financial Statements", "Trust Compliance Review"],
      },
      premium: {
        title: "Premium", subtitle: "Strategic growth", badge: "MOST POPULAR",
        features: ["Everything in Essential", "Tax Planning Sessions", "Priority Phone Support", "Monthly Management Reports", "Quarterly Strategy Meetings", "Dedicated Accountant"],
        extraFeatures: ["Trust Distribution Minutes", "Annual Financial Statements", "Bank & Credit Card Reconciliation", "Accounts Payable Management", "Accounts Receivable Management", "Trust Compliance Review", "Cloud Accounting Software Setup", "Quarterly Review Meetings", "Strategic Tax Advisory", "Trust Restructuring Advice"],
      },
    },
  },
  {
    serviceKey: "nfp_accounting",
    label: "NFP Accounting",
    enableStrikePricing: false,
    tiers: {
      under75k:    { compliance: 1200, monthly: 100 },
      "75to200k":  { compliance: 1400, monthly: 120 },
      "200to500k": { compliance: 1600, monthly: 140 },
      "500to1m":   { compliance: 1800, monthly: 160 },
      "1mto2m":    { compliance: 2000, monthly: 180 },
      "2mto5m":    { compliance: 2500, monthly: 200 },
    },
    revenueTiers: [
      { id: "under75k", label: "Under $75K" },
      { id: "75to200k", label: "$75K – $200K" },
      { id: "200to500k", label: "$200K – $500K" },
      { id: "500to1m", label: "$500K – $1M" },
      { id: "1mto2m", label: "$1M – $2M" },
      { id: "2mto5m", label: "$2M – $5M" },
    ],
    annualDiscount: 0.20,
    transitionFee: 600,
    startDates: [
      { id: "jul", label: "1 July 2025", months: 12, desc: "Full Year" },
      { id: "oct", label: "1 October 2025", months: 9, desc: "9 months" },
      { id: "jan", label: "1 January 2026", months: 6, desc: "6 months" },
      { id: "apr", label: "1 April 2026", months: 3, desc: "3 months" },
    ],
    addons: { catchUpFee: 750, registeredOfficeFee: 300, taxPlanningFee: 500, payrollPerEmployee: 120 },
    plans: {
      essential: {
        title: "Essential", subtitle: "Compliance-focused", badge: null,
        features: ["Monthly Bookkeeping", "Quarterly BAS Lodgement", "Annual Tax Return", "Annual Financial Statements", "ASIC Annual Review"],
        extraFeatures: ["Accounts Payable Management", "Accounts Receivable Management", "Payroll Processing", "Bank & Credit Card Reconciliation", "Company Tax Return Lodgement"],
      },
      premium: {
        title: "Premium", subtitle: "Strategic growth", badge: "MOST POPULAR",
        features: ["Everything in Essential", "Tax Planning Sessions", "Priority Phone Support", "Monthly Management Reports", "Quarterly Strategy Meetings", "Dedicated Accountant"],
        extraFeatures: ["ASIC Annual Review", "Accounts Payable Management", "Accounts Receivable Management", "Payroll Processing", "Annual Financial Statements", "Bank & Credit Card Reconciliation", "Company Tax Return Lodgement", "Cloud Accounting Software Setup", "Quarterly Review Meetings", "Strategic Tax Advisory"],
      },
    },
  },
  {
    serviceKey: "partnership_tax",
    label: "Partnership Tax",
    enableStrikePricing: true,
    tiers: {
      under75k:    { compliance: 1000, monthly: 85, strikeCompliance: 1250, strikeMonthly: 110 },
      "75to200k":  { compliance: 1200, monthly: 105, strikeCompliance: 1500, strikeMonthly: 135 },
      "200to500k": { compliance: 1400, monthly: 125, strikeCompliance: 1750, strikeMonthly: 160 },
      "500to1m":   { compliance: 1600, monthly: 145, strikeCompliance: 2000, strikeMonthly: 185 },
      "1mto2m":    { compliance: 1800, monthly: 165, strikeCompliance: 2250, strikeMonthly: 210 },
      "2mto5m":    { compliance: 2200, monthly: 190, strikeCompliance: 2750, strikeMonthly: 240 },
    },
    revenueTiers: [
      { id: "under75k", label: "Under $75K" },
      { id: "75to200k", label: "$75K – $200K" },
      { id: "200to500k", label: "$200K – $500K" },
      { id: "500to1m", label: "$500K – $1M" },
      { id: "1mto2m", label: "$1M – $2M" },
      { id: "2mto5m", label: "$2M – $5M" },
    ],
    annualDiscount: 0.20,
    transitionFee: 600,
    startDates: [
      { id: "jul", label: "1 July 2025", months: 12, desc: "Full Year" },
      { id: "oct", label: "1 October 2025", months: 9, desc: "9 months" },
      { id: "jan", label: "1 January 2026", months: 6, desc: "6 months" },
      { id: "apr", label: "1 April 2026", months: 3, desc: "3 months" },
    ],
    addons: { catchUpFee: 750, registeredOfficeFee: 300, taxPlanningFee: 500, payrollPerEmployee: 120 },
    plans: {
      essential: {
        title: "Essential", subtitle: "Compliance-focused", badge: null,
        features: ["Partnership Tax Returns", "Profit Distribution", "Partner Capital Tracking", "Partnership BAS", "Quarterly BAS Lodgement"],
        extraFeatures: ["Bank & Credit Card Reconciliation", "Accounts Payable Management", "Accounts Receivable Management", "Partner Distribution Statements", "Annual Financial Statements", "Partnership Compliance Review"],
      },
      premium: {
        title: "Premium", subtitle: "Strategic growth", badge: "MOST POPULAR",
        features: ["Everything in Essential", "Tax Planning Sessions", "Priority Phone Support", "Monthly Management Reports", "Quarterly Strategy Meetings", "Dedicated Accountant"],
        extraFeatures: ["Partner Distribution Statements", "Annual Financial Statements", "Bank & Credit Card Reconciliation", "Accounts Payable Management", "Accounts Receivable Management", "Partnership Compliance Review", "Cloud Accounting Software Setup", "Quarterly Review Meetings", "Strategic Tax Advisory", "Partnership Restructuring Advice"],
      },
    },
  },
];

/**
 * Universal price calculation function — works with any service's config
 */
export function calculateAccountingPrice(opts: {
  tiers: Record<string, AccountingTierPricing>;
  revenueTier: string;
  billing: "monthly" | "annual";
  startDateId: string;
  startDates: AccountingStartDate[];
  annualDiscount: number;
  transitionFee: number;
  enableStrikePricing?: boolean;
  packageLevel?: "essential" | "premium";
  taxPlanningFee?: number;
  prorateCompliance?: boolean;
}) {
  const tierCfg = opts.tiers[opts.revenueTier];
  if (!tierCfg) {
    return { compliance: 0, operations: 0, transition: 0, discount: 0, total: 0, months: 12, monthlyFee: 0, monthlyTotal: 0, isCustom: false, strikeCompliance: null as number | null, strikeOperations: null as number | null, strikeTotal: null as number | null, strikeMonthlyFee: null as number | null, premiumExtra: 0 };
  }

  const startInfo = opts.startDates.find((d) => d.id === opts.startDateId) ?? opts.startDates[0];
  const months = startInfo.months;
  const monthlyFee = tierCfg.monthly;
  const fullCompliance = tierCfg.compliance;
  const compliance = opts.prorateCompliance ? Math.round(fullCompliance * months / 12) : fullCompliance;
  const operations = monthlyFee * months;
  const transition = opts.startDateId !== "jul" ? opts.transitionFee : 0;
  const premiumExtra = opts.packageLevel === "premium" ? (opts.taxPlanningFee ?? 0) : 0;

  const subtotal = compliance + operations + transition + premiumExtra;
  const discount = opts.billing === "annual" ? Math.round(subtotal * opts.annualDiscount) : 0;
  const total = subtotal - discount;

  const monthlyTotal = opts.billing === "monthly" ? monthlyFee + Math.round(fullCompliance / 12) + Math.round(premiumExtra / 12) : 0;

  // Strike pricing (original/was prices)
  const showStrike = opts.enableStrikePricing && tierCfg.strikeCompliance && tierCfg.strikeMonthly;
  const strikeCompliance = showStrike ? (opts.prorateCompliance ? Math.round(tierCfg.strikeCompliance! * months / 12) : tierCfg.strikeCompliance!) : null;
  const strikeMonthlyFee = showStrike ? tierCfg.strikeMonthly! : null;
  const strikeOperations = showStrike ? tierCfg.strikeMonthly! * months : null;
  let strikeTotal: number | null = null;
  if (showStrike) {
    const strikeSub = strikeCompliance! + strikeOperations! + transition + premiumExtra;
    const strikeDsc = opts.billing === "annual" ? Math.round(strikeSub * opts.annualDiscount) : 0;
    strikeTotal = opts.billing === "monthly"
      ? strikeMonthlyFee! + Math.round(tierCfg.strikeCompliance! / 12) + Math.round(premiumExtra / 12)
      : strikeSub - strikeDsc;
  }

  return {
    compliance,
    operations,
    transition,
    premiumExtra,
    discount,
    total: opts.billing === "monthly" ? monthlyTotal : total,
    months,
    monthlyFee,
    monthlyTotal,
    isCustom: false,
    strikeCompliance,
    strikeOperations,
    strikeTotal,
    strikeMonthlyFee,
  };
}

/**
 * Helper: get fallback config for a specific service
 */
export function getAccountingFallback(serviceKey: string): AccountingServicePricing | undefined {
  return ACCOUNTING_PRICING_FALLBACK.find((s) => s.serviceKey === serviceKey);
}
