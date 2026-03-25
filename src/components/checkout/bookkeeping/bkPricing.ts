/**
 * Bookkeeping pricing data — transaction-based tiers.
 * Mirrors the HTML reference widget pricing.
 */

export interface BKTier {
  id: string;
  name: string;
  txnLabel: string;
  subtitle: string;
  monthlyPrice: number;
  features: string[];
  popular?: boolean;
}

export const BK_TIERS: BKTier[] = [
  {
    id: "starter",
    name: "Small",
    txnLabel: "UP TO 50 TXNS/MO",
    subtitle: "New or small business · freelancers & sole traders",
    monthlyPrice: 220,
    features: [
      "Monthly bookkeeping",
      "1 bank / card feed",
      "BAS preparation & lodgement",
      "Xero / MYOB included",
      "Monthly reconciliation",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Medium",
    txnLabel: "UP TO 150 TXNS/MO",
    subtitle: "Growing businesses · small teams & retailers",
    monthlyPrice: 385,
    popular: true,
    features: [
      "Everything in Small",
      "Up to 3 bank / card feeds",
      "Monthly P&L & balance sheet",
      "Accounts payable & receivable",
      "Fortnightly reconciliation",
      "Priority support",
    ],
  },
  {
    id: "scale",
    name: "Large",
    txnLabel: "UP TO 300 TXNS/MO",
    subtitle: "Established business · e-commerce & multi-entity",
    monthlyPrice: 550,
    features: [
      "Everything in Medium",
      "Unlimited bank feeds",
      "Weekly reconciliation",
      "Cash flow forecasting",
      "Dedicated bookkeeper",
      "Phone & video support",
    ],
  },
];

export const BK_ANNUAL_DISCOUNT = 0.1;
export const BK_PAYROLL_PER_EMPLOYEE = 55; // per month
export const BK_ADDON_PRICES = {
  extraFeeds: 27.5,   // per month
  catchUp: 165,       // one-time
  ias: 110,           // per month
  jobTracking: 82.5,  // per month
};

export const BK_ALWAYS_INCLUDED = [
  "Monthly bookkeeping & reconciliation",
  "BAS preparation & lodgement",
  "QuickBooks Online subscription",
  "ATO correspondence support",
];

export interface BKPriceResult {
  planBase: number;       // plan cost (annual or monthly display)
  payroll: number;        // payroll addon
  addonsRecurring: number; // recurring addons total
  catchUp: number;        // one-time
  discountAmount: number; // annual discount
  total: number;          // grand total
  isAnnual: boolean;
}

export function calculateBKPrice(opts: {
  tierId: string;
  billing: "monthly" | "annual";
  employees: number;
  extraFeeds: boolean;
  catchUp: boolean;
  ias: boolean;
  jobTracking: boolean;
}): BKPriceResult {
  const tier = BK_TIERS.find((t) => t.id === opts.tierId) ?? BK_TIERS[1];
  const isAnnual = opts.billing === "annual";
  const baseMo = tier.monthlyPrice;
  const empMo = opts.employees * BK_PAYROLL_PER_EMPLOYEE;
  const recMo =
    (opts.extraFeeds ? BK_ADDON_PRICES.extraFeeds : 0) +
    (opts.ias ? BK_ADDON_PRICES.ias : 0) +
    (opts.jobTracking ? BK_ADDON_PRICES.jobTracking : 0);
  const oneTime = opts.catchUp ? BK_ADDON_PRICES.catchUp : 0;

  if (isAnnual) {
    const totalYrFull = (baseMo + empMo + recMo) * 12;
    const discountAmount = Math.round(totalYrFull * BK_ANNUAL_DISCOUNT);
    const totalYrDisc = totalYrFull - discountAmount;
    return {
      planBase: Math.round(baseMo * 12 * (1 - BK_ANNUAL_DISCOUNT)),
      payroll: Math.round(empMo * 12 * (1 - BK_ANNUAL_DISCOUNT)),
      addonsRecurring: Math.round(recMo * 12 * (1 - BK_ANNUAL_DISCOUNT)),
      catchUp: oneTime,
      discountAmount,
      total: totalYrDisc + oneTime,
      isAnnual: true,
    };
  }

  const totalMo = baseMo + empMo + recMo;
  return {
    planBase: baseMo,
    payroll: empMo,
    addonsRecurring: recMo,
    catchUp: oneTime,
    discountAmount: 0,
    total: totalMo + oneTime,
    isAnnual: false,
  };
}
