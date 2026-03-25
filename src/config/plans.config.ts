export interface PackageOption {
  id: string;
  name: string;
  subtitle: string;
  features: string[];
  isRecommended: boolean;
  icon: string;
}

export interface RevenueBracket {
  id: string;
  label: string;
  minRevenue: number;
  maxRevenue: number | null;
}

export interface AccountingPlan {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  features: string[];
  isPopular: boolean;
  footnote?: string;
}

export const packages: PackageOption[] = [
  {
    id: "registration_only",
    name: "Registration Only",
    subtitle: "Just the essentials",
    features: [
      "Business name registration",
      "ASIC certificate",
      "Email support",
    ],
    isRecommended: false,
    icon: "FileText",
  },
  {
    id: "registration_plus_accounting",
    name: "Registration + Accounting",
    subtitle: "Complete solution",
    features: [
      "Everything in Registration Only",
      "Bookkeeping & BAS/IAS",
      "Annual tax returns",
      "Priority support",
    ],
    isRecommended: true,
    icon: "Calculator",
  },
];

export const revenueBrackets: RevenueBracket[] = [
  { id: "0-100k", label: "Up to $100,000", minRevenue: 0, maxRevenue: 100000 },
  { id: "100k-250k", label: "$100k - $250k", minRevenue: 100000, maxRevenue: 250000 },
  { id: "250k-500k", label: "$250k - $500k", minRevenue: 250000, maxRevenue: 500000 },
  { id: "500k-1.25m", label: "$500k - $1.25M", minRevenue: 500000, maxRevenue: 1250000 },
  { id: "1.25m-2m", label: "$1.25M - $2M", minRevenue: 1250000, maxRevenue: 2000000 },
];

// Pricing matrix: [revenueBracketId][planId] = { monthly, annual }
export const accountingPricing: Record<string, Record<string, { monthly: number; annual: number }>> = {
  "0-100k": {
    essential: { monthly: 199, annual: 2149 },
    founder_pro: { monthly: 299, annual: 3199 },
  },
  "100k-250k": {
    essential: { monthly: 249, annual: 2738 },
    founder_pro: { monthly: 349, annual: 3840 },
  },
  "250k-500k": {
    essential: { monthly: 249, annual: 2738 },
    founder_pro: { monthly: 349, annual: 3840 },
  },
  "500k-1.25m": {
    essential: { monthly: 299, annual: 3239 },
    founder_pro: { monthly: 449, annual: 4859 },
  },
  "1.25m-2m": {
    essential: { monthly: 399, annual: 4309 },
    founder_pro: { monthly: 599, annual: 6479 },
  },
};

export const accountingPlans: AccountingPlan[] = [
  {
    id: "essential",
    name: "Essential",
    subtitle: "For early-stage businesses",
    monthlyPrice: 249,
    annualPrice: 2738,
    annualSavings: 250,
    features: [
      "Annual company tax return",
      "Quarterly BAS/IAS lodgement",
      "Standard bookkeeping",
      "Email support",
    ],
    isPopular: false,
  },
  {
    id: "founder_pro",
    name: "Founder Pro",
    subtitle: "For growing founders",
    monthlyPrice: 349,
    annualPrice: 3840,
    annualSavings: 348,
    features: [
      "Everything in Essential, plus:",
      "Monthly bookkeeping",
      "Dedicated accountant",
      "Priority phone support",
      "Annual tax planning session",
    ],
    isPopular: true,
    footnote: "Most founders choose this for peace of mind",
  },
];

export const getPackageById = (id: string): PackageOption | undefined => {
  return packages.find((p) => p.id === id);
};

export const getPlanById = (id: string): AccountingPlan | undefined => {
  return accountingPlans.find((p) => p.id === id);
};

export const getBracketById = (id: string): RevenueBracket | undefined => {
  return revenueBrackets.find((b) => b.id === id);
};

export const getPricing = (
  bracketId: string,
  planId: string,
  frequency: "monthly" | "annual"
): number => {
  const bracketPricing = accountingPricing[bracketId];
  if (!bracketPricing) return 0;
  const planPricing = bracketPricing[planId];
  if (!planPricing) return 0;
  return frequency === "monthly" ? planPricing.monthly : planPricing.annual;
};

export const getAnnualSavings = (bracketId: string, planId: string): number => {
  const bracketPricing = accountingPricing[bracketId];
  if (!bracketPricing) return 0;
  const planPricing = bracketPricing[planId];
  if (!planPricing) return 0;
  return planPricing.monthly * 12 - planPricing.annual;
};
