/**
 * Payroll Services pricing data — employee-based tiers.
 * Mirrors the payroll-pricing-widget HTML reference.
 */

export interface PRTier {
  id: string;
  name: string;
  empLabel: string;
  subtitle: string;
  monthlyPrice: number;
  features: string[];
  popular?: boolean;
}

export const PR_TIERS: PRTier[] = [
  {
    id: "essentials",
    name: "Micro",
    empLabel: "1–4 EMPLOYEES",
    subtitle: "Small business · sole traders & micro teams",
    monthlyPrice: 110,
    features: [
      "STP Phase 2 lodgement every pay run",
      "Super processing at 12% SG",
      "PAYG withholding calculation",
      "Payslips & leave tracking",
      "Year-end finalisation (EOFY)",
      "Payday Super ready (July 2026)",
    ],
  },
  {
    id: "growth",
    name: "Small",
    empLabel: "5–10 EMPLOYEES",
    subtitle: "Growing business · award & EBA employees",
    monthlyPrice: 198,
    popular: true,
    features: [
      "Everything in Micro",
      "Award interpretation & penalty rates",
      "Overtime & shift loading calculations",
      "Allowances & reimbursements",
      "Super clearing house management",
      "Payday Super ready (July 2026)",
    ],
  },
  {
    id: "enterprise",
    name: "Medium",
    empLabel: "11–20 EMPLOYEES",
    subtitle: "Established business · complex awards & EBAs",
    monthlyPrice: 330,
    features: [
      "Everything in Small",
      "Multiple awards / EBAs",
      "Director & closely held payees",
      "Workers comp reconciliation",
      "Dedicated payroll specialist",
      "Payday Super ready (July 2026)",
    ],
  },
];

export const PR_ANNUAL_DISCOUNT = 0.1;
export const PR_EXTRA_EMPLOYEE_PRICE = 11; // per month per extra employee
export const PR_WEEKLY_ADDON = 55; // per month

export const PR_ONETIME_PRICES = {
  paydaySuper: 27.5,
  termination: 82.5,
  backPay: 55,
  healthCheck: 165,
};

export const PR_ALWAYS_INCLUDED = [
  "STP Phase 2 lodgement every pay run",
  "12% super guarantee processing",
  "PAYG withholding & payslips",
  "EOFY finalisation & ATO compliance",
  "Payday Super ready (July 2026)",
];

export interface PRPriceResult {
  planBase: number;
  weeklyAddon: number;
  extraEmployees: number;
  onetimeTotal: number;
  discountAmount: number;
  total: number;
  isAnnual: boolean;
}

export function calculatePRPrice(opts: {
  tierId: string;
  billing: "monthly" | "annual";
  weeklyPayRuns: boolean;
  extraEmployees: number;
  paydaySuper: boolean;
  termination: boolean;
  backPay: boolean;
  healthCheck: boolean;
}): PRPriceResult {
  const tier = PR_TIERS.find((t) => t.id === opts.tierId) ?? PR_TIERS[1];
  const isAnnual = opts.billing === "annual";
  const baseMo = tier.monthlyPrice;
  const weeklyMo = opts.weeklyPayRuns ? PR_WEEKLY_ADDON : 0;
  const extraEmpMo = opts.extraEmployees * PR_EXTRA_EMPLOYEE_PRICE;
  const recurMo = baseMo + weeklyMo + extraEmpMo;

  const onetimeTotal =
    (opts.paydaySuper ? PR_ONETIME_PRICES.paydaySuper : 0) +
    (opts.termination ? PR_ONETIME_PRICES.termination : 0) +
    (opts.backPay ? PR_ONETIME_PRICES.backPay : 0) +
    (opts.healthCheck ? PR_ONETIME_PRICES.healthCheck : 0);

  if (isAnnual) {
    const recurYrFull = recurMo * 12;
    const discountAmount = Math.round(recurYrFull * PR_ANNUAL_DISCOUNT);
    const recurYrDisc = recurYrFull - discountAmount;
    return {
      planBase: Math.round(baseMo * 12 * (1 - PR_ANNUAL_DISCOUNT)),
      weeklyAddon: Math.round(weeklyMo * 12 * (1 - PR_ANNUAL_DISCOUNT)),
      extraEmployees: Math.round(extraEmpMo * 12 * (1 - PR_ANNUAL_DISCOUNT)),
      onetimeTotal,
      discountAmount,
      total: recurYrDisc + onetimeTotal,
      isAnnual: true,
    };
  }

  return {
    planBase: baseMo,
    weeklyAddon: weeklyMo,
    extraEmployees: extraEmpMo,
    onetimeTotal,
    discountAmount: 0,
    total: recurMo + onetimeTotal,
    isAnnual: false,
  };
}
