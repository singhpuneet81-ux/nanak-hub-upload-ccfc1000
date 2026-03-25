/**
 * Company Accounting — Compliance + Operations pricing model
 *
 * Compliance = fixed annual deliverable (tax return, financials) — varies by revenue tier
 * Operations = monthly bookkeeping/BAS — prorated to remaining months, varies by revenue tier
 * Transition = one-off onboarding fee when starting after 1 July
 * Annual discount = 20% off total when billing = annual
 */

export type CARevenueKey =
  | "under75k"
  | "75to200k"
  | "200to500k"
  | "500to1m"
  | "1mto2m"
  | "2mto5m";

export interface CARevenueTierPricing {
  compliance: number;
  monthly: number;
}

export interface CAConfig {
  tiers: Record<CARevenueKey, CARevenueTierPricing>;
  annualDiscount: number;
  transitionFee: number;
}

export const CA_PRICING: CAConfig = {
  tiers: {
    under75k:  { compliance: 1200, monthly: 100 },
    "75to200k": { compliance: 1400, monthly: 120 },
    "200to500k": { compliance: 1600, monthly: 140 },
    "500to1m":  { compliance: 1800, monthly: 160 },
    "1mto2m":   { compliance: 2000, monthly: 180 },
    "2mto5m":   { compliance: 2500, monthly: 200 },
  },
  annualDiscount: 0.20,
  transitionFee: 600,
};

export const CA_REVENUE_TIERS: { id: CARevenueKey; label: string }[] = [
  { id: "under75k", label: "Under $75K" },
  { id: "75to200k", label: "$75K – $200K" },
  { id: "200to500k", label: "$200K – $500K" },
  { id: "500to1m", label: "$500K – $1M" },
  { id: "1mto2m", label: "$1M – $2M" },
  { id: "2mto5m", label: "$2M – $5M" },
];

export const CA_START_DATES = [
  { id: "jul", label: "1 July 2025", months: 12, desc: "Full Year" },
  { id: "oct", label: "1 October 2025", months: 9, desc: "9 months" },
  { id: "jan", label: "1 January 2026", months: 6, desc: "6 months" },
  { id: "apr", label: "1 April 2026", months: 3, desc: "3 months" },
];

/**
 * Core calculation function — single source of truth.
 *
 * @returns breakdown with compliance, operations, transition, discount and total
 */
export function calculateCAPrice(opts: {
  revenueTier: CARevenueKey;
  billing: "monthly" | "annual";
  startDateId: string;
  config?: CAConfig;
}) {
  const cfg = opts.config ?? CA_PRICING;
  const tierCfg = cfg.tiers[opts.revenueTier];
  const startInfo = CA_START_DATES.find((d) => d.id === opts.startDateId) ?? CA_START_DATES[0];
  const months = startInfo.months;
  const monthlyFee = tierCfg.monthly;

  const compliance = tierCfg.compliance;
  const operations = monthlyFee * months;
  const transition = opts.startDateId !== "jul" ? cfg.transitionFee : 0;

  const subtotal = compliance + operations + transition;
  const discount = opts.billing === "annual" ? Math.round(subtotal * cfg.annualDiscount) : 0;
  const total = subtotal - discount;

  // Monthly billing: pay monthly ops + spread compliance over 12
  const monthlyTotal = opts.billing === "monthly" ? monthlyFee + Math.round(compliance / 12) : 0;

  return {
    compliance,
    operations,
    transition,
    discount,
    total: opts.billing === "monthly" ? monthlyTotal : total,
    months,
    monthlyFee,
    monthlyTotal,
    isCustom: false,
  };
}
