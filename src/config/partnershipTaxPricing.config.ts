/**
 * Partnership Tax — Compliance + Operations pricing model
 * Same structure as Company Accounting
 */

export type PTRevenueKey =
  | "under75k"
  | "75to200k"
  | "200to500k"
  | "500to1m"
  | "1mto2m"
  | "2mto5m";

export interface PTRevenueTierPricing {
  compliance: number;
  monthly: number;
}

export interface PTConfig {
  tiers: Record<PTRevenueKey, PTRevenueTierPricing>;
  annualDiscount: number;
  transitionFee: number;
}

export const PT_PRICING: PTConfig = {
  tiers: {
    under75k:    { compliance: 1000, monthly: 85 },
    "75to200k":  { compliance: 1200, monthly: 105 },
    "200to500k": { compliance: 1400, monthly: 125 },
    "500to1m":   { compliance: 1600, monthly: 145 },
    "1mto2m":    { compliance: 1800, monthly: 165 },
    "2mto5m":    { compliance: 2200, monthly: 190 },
  },
  annualDiscount: 0.20,
  transitionFee: 600,
};

export const PT_REVENUE_TIERS: { id: PTRevenueKey; label: string }[] = [
  { id: "under75k", label: "Under $75K" },
  { id: "75to200k", label: "$75K – $200K" },
  { id: "200to500k", label: "$200K – $500K" },
  { id: "500to1m", label: "$500K – $1M" },
  { id: "1mto2m", label: "$1M – $2M" },
  { id: "2mto5m", label: "$2M – $5M" },
];

export const PT_START_DATES = [
  { id: "jul", label: "1 July 2025", months: 12, desc: "Full Year" },
  { id: "oct", label: "1 October 2025", months: 9, desc: "9 months" },
  { id: "jan", label: "1 January 2026", months: 6, desc: "6 months" },
  { id: "apr", label: "1 April 2026", months: 3, desc: "3 months" },
];

export function calculatePTPrice(opts: {
  revenueTier: PTRevenueKey;
  billing: "monthly" | "annual";
  startDateId: string;
  config?: PTConfig;
}) {
  const cfg = opts.config ?? PT_PRICING;
  const tierCfg = cfg.tiers[opts.revenueTier];
  const startInfo = PT_START_DATES.find((d) => d.id === opts.startDateId) ?? PT_START_DATES[0];
  const months = startInfo.months;
  const monthlyFee = tierCfg.monthly;

  const compliance = tierCfg.compliance;
  const operations = monthlyFee * months;
  const transition = opts.startDateId !== "jul" ? cfg.transitionFee : 0;

  const subtotal = compliance + operations + transition;
  const discount = opts.billing === "annual" ? Math.round(subtotal * cfg.annualDiscount) : 0;
  const total = subtotal - discount;

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
