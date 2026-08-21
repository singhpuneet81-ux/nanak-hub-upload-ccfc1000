/**
 * Hook: usePayrollPricing
 *
 * Fetches dynamic payroll pricing from the admin API.
 * Falls back to static prPricing.ts defaults if API is unreachable.
 */

import { useQuery } from "@tanstack/react-query";
import {
  PR_TIERS,
  PR_ANNUAL_DISCOUNT,
  PR_WEEKLY_ADDON,
  PR_EXTRA_EMPLOYEE_PRICE,
  PR_ONETIME_PRICES,
} from "@/components/checkout/payroll-services/prPricing";

const API_URL = "https://api.cavaluer.com/api/admin/payroll-pricing";

export interface PRApiTier {
  name: string;
  band: string;
  rate: number;
  badge?: string;
}

export interface PRPlanFeatureItem {
  text: string;
  type: string;
}

export interface PRPlanFeature {
  name: string;
  badge?: string;
  features: (string | PRPlanFeatureItem)[];
}

export interface PRApiData {
  serviceKey: string;
  label: string;
  annualDiscount: number; // e.g. 10 means 10%
  noticePeriod?: string;
  enableStrikePricing?: boolean;
  showSaveBadge?: boolean;
  tiers: PRApiTier[];
  addonPrices: {
    weekly: number;
    extraEmp: number;
    paydaysuper: number;
    termination: number;
    backpay: number;
    healthcheck: number;
  };
  planFeatures?: PRPlanFeature[];
}

async function fetchPRPricing(): Promise<PRApiData> {
  const res = await fetch(API_URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = json.data ?? json;
  const item = Array.isArray(list)
    ? list.find((d: any) => d.serviceKey === "payroll" || d._type === "payroll")
    : list;
  if (!item || !item.tiers) throw new Error("Invalid payroll pricing response");
  return item as PRApiData;
}

function buildFallback(): PRApiData {
  return {
    serviceKey: "payroll",
    label: "Payroll",
    annualDiscount: PR_ANNUAL_DISCOUNT * 100,
    tiers: PR_TIERS.map((t) => ({
      name: t.name,
      band: t.empLabel.replace(/ EMPLOYEES/i, ""),
      rate: t.monthlyPrice,
    })),
    addonPrices: {
      weekly: PR_WEEKLY_ADDON,
      extraEmp: PR_EXTRA_EMPLOYEE_PRICE,
      paydaysuper: PR_ONETIME_PRICES.paydaySuper,
      termination: PR_ONETIME_PRICES.termination,
      backpay: PR_ONETIME_PRICES.backPay,
      healthcheck: PR_ONETIME_PRICES.healthCheck,
    },
  };
}

export function usePayrollPricing() {
  const fallback = buildFallback();

  const { data, isLoading, error } = useQuery<PRApiData>({
    queryKey: ["payroll-pricing"],
    queryFn: fetchPRPricing,
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
