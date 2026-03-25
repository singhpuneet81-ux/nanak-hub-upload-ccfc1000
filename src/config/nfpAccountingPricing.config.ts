/**
 * NFP Accounting — ACNC Charity Size pricing model
 * 3 tiers: Small, Medium, Large (by ACNC classification)
 * Pro-rates compliance by months. 20% annual discount.
 */

export type NFPCharitySizeKey = "small" | "medium" | "large";

export interface NFPCharityTierPricing {
  compliance: number;
  monthly: number;
}

export interface NFPConfig {
  tiers: Record<NFPCharitySizeKey, NFPCharityTierPricing>;
  annualDiscount: number;
  transitionFee: number;
}

export const NFP_PRICING: NFPConfig = {
  tiers: {
    small:  { compliance: 900,  monthly: 80 },
    medium: { compliance: 1400, monthly: 130 },
    large:  { compliance: 2200, monthly: 200 },
  },
  annualDiscount: 0.20,
  transitionFee: 600,
};

export const NFP_CHARITY_SIZES: { id: NFPCharitySizeKey; label: string }[] = [
  { id: "small",  label: "Small — Under $500K revenue" },
  { id: "medium", label: "Medium — $500K to $2.99M revenue" },
  { id: "large",  label: "Large — $3M+ revenue" },
];

export const NFP_START_DATES = [
  { id: "jul", label: "1 July 2025", months: 12, desc: "Full Year" },
  { id: "oct", label: "1 October 2025", months: 9, desc: "9 months" },
  { id: "jan", label: "1 January 2026", months: 6, desc: "6 months" },
  { id: "apr", label: "1 April 2026", months: 3, desc: "3 months" },
];

export function calculateNFPPrice(opts: {
  charitySize: NFPCharitySizeKey;
  billing: "monthly" | "annual";
  startDateId: string;
  config?: NFPConfig;
}) {
  const cfg = opts.config ?? NFP_PRICING;
  const tierCfg = cfg.tiers[opts.charitySize];
  const startInfo = NFP_START_DATES.find((d) => d.id === opts.startDateId) ?? NFP_START_DATES[0];
  const months = startInfo.months;
  const monthlyFee = tierCfg.monthly;

  // Pro-rate compliance by months
  const compliance = Math.round(tierCfg.compliance * months / 12);
  const operations = monthlyFee * months;
  const transition = opts.startDateId !== "jul" ? cfg.transitionFee : 0;

  const subtotal = compliance + operations + transition;
  const discount = opts.billing === "annual" ? Math.round(subtotal * cfg.annualDiscount) : 0;
  const total = subtotal - discount;

  const monthlyTotal = opts.billing === "monthly" ? monthlyFee + Math.round(tierCfg.compliance / 12) : 0;

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
