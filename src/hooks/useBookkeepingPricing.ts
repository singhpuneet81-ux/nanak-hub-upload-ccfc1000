/**
 * Hook: useBookkeepingPricing
 *
 * Fetches dynamic bookkeeping pricing from the admin API.
 * Falls back to static bkPricing.ts defaults if API is unreachable.
 */

import { useQuery } from "@tanstack/react-query";
import {
  BK_TIERS,
  BK_ANNUAL_DISCOUNT,
  BK_PAYROLL_PER_EMPLOYEE,
  BK_ADDON_PRICES,
  BK_ALWAYS_INCLUDED,
} from "@/components/checkout/bookkeeping/bkPricing";

const API_URL = "https://api.cavaluer.com/api/admin/bookkeeping-pricing";

export interface BKApiTier {
  name: string;
  txn: string;
  rate: number;
  badge?: string;
}

export interface BKPlanFeature {
  name: string;
  badge?: string;
  features: string[];
}

export interface BKApiData {
  serviceKey: string;
  label: string;
  annualDiscount: number; // e.g. 10 means 10%
  software?: string;
  enableStrikePricing?: boolean;
  tiers: BKApiTier[];
  addonPrices: {
    payroll: number;
    feeds: number;
    ias: number;
    jobtrack: number;
    catchup: number;
  };
  planFeatures?: BKPlanFeature[];
}

async function fetchBKPricing(): Promise<BKApiData> {
  const res = await fetch(API_URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // API may return { success: true, data: [...] } or { data: [...] }
  const list = json.data ?? json;
  const item = Array.isArray(list)
    ? list.find((d: any) => d.serviceKey === "bookkeeping" || d._type === "bookkeeping")
    : list;
  if (!item || !item.tiers) throw new Error("Invalid bookkeeping pricing response");
  return item as BKApiData;
}

/** Build static fallback from hardcoded constants */
function buildFallback(): BKApiData {
  return {
    serviceKey: "bookkeeping",
    label: "Bookkeeping",
    annualDiscount: BK_ANNUAL_DISCOUNT * 100,
    tiers: BK_TIERS.map((t) => ({
      name: t.name,
      txn: t.txnLabel.replace(/UP TO /i, "").replace(/ TXNS\/MO/i, ""),
      rate: t.monthlyPrice,
      badge: t.popular ? "Popular" : "",
    })),
    addonPrices: {
      payroll: BK_PAYROLL_PER_EMPLOYEE,
      feeds: BK_ADDON_PRICES.extraFeeds,
      ias: BK_ADDON_PRICES.ias,
      jobtrack: BK_ADDON_PRICES.jobTracking,
      catchup: BK_ADDON_PRICES.catchUp,
    },
  };
}

export function useBookkeepingPricing() {
  const fallback = buildFallback();

  const { data, isLoading, error } = useQuery<BKApiData>({
    queryKey: ["bookkeeping-pricing"],
    queryFn: fetchBKPricing,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    placeholderData: fallback,
  });

  const pricing = data ?? fallback;
  const annualDiscountFraction = (pricing.annualDiscount ?? 20) / 100;

  return {
    pricing,
    annualDiscount: annualDiscountFraction,
    isLoading,
    error,
    isFallback: !data || !!error,
  };
}
