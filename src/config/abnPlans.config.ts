export const packages = [
  {
    id: "foundation_setup",
    name: "Foundation Setup",
    subtitle: "One-time only",
    price: 149,
  },
  {
    id: "registration_plus_accounting",
    name: "Registration + Accounting",
    subtitle: "Annual Package",
    basePrice: 599,
    savings: 337,
  },
];

export const billingOptions = [
  { id: "monthly", label: "Monthly", multiplier: 1 },
  { id: "annual", label: "Annual", multiplier: 0.85, savings: 15 },
];

export const accountingPlans = [
  {
    id: "essential",
    name: "Essential",
    monthlyPrice: 99,
    annualPrice: 1009, // 85% of monthly * 12
    features: ["Quarterly BAS", "Annual Tax Return", "Email Support"],
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 149,
    annualPrice: 1520,
    features: ["Monthly BAS", "Annual Tax Return", "Phone Support", "Bookkeeping"],
    isPopular: true,
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 249,
    annualPrice: 2539,
    features: ["Monthly BAS", "Tax Planning", "Dedicated Accountant", "Priority Support"],
  },
];

export const getPricing = (planId: string, frequency: "monthly" | "annual"): number => {
  const plan = accountingPlans.find(p => p.id === planId);
  if (!plan) return 0;
  return frequency === "annual" ? plan.annualPrice : plan.monthlyPrice;
};

export const getAnnualSavings = (planId: string): number => {
  const plan = accountingPlans.find(p => p.id === planId);
  if (!plan) return 0;
  return (plan.monthlyPrice * 12) - plan.annualPrice;
};