/**
 * Hook: useAccountingPricing
 * 
 * Fetches dynamic pricing for accounting services from the API.
 * Falls back to static config if API is unreachable.
 */

import { useQuery } from "@tanstack/react-query";
import {
  ACCOUNTING_PRICING_FALLBACK,
  type AccountingServicePricing,
} from "@/config/accountingPricingFallback";

const API_URL = "https://api.connect.cavaluer.com/api/admin/accounting-pricing";

async function fetchAccountingPricing(): Promise<AccountingServicePricing[]> {
  const res = await fetch(API_URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response");
  return json.data;
}

export function useAccountingPricing() {
  return useQuery({
    queryKey: ["accounting-pricing"],
    queryFn: fetchAccountingPricing,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    placeholderData: ACCOUNTING_PRICING_FALLBACK,
    select: (data) => data,
  });
}

/**
 * Get pricing for a specific service key
 */
export function useServicePricing(serviceKey: string) {
  const { data, isLoading, error } = useAccountingPricing();

  const servicePricing = data?.find((s) => s.serviceKey === serviceKey)
    ?? ACCOUNTING_PRICING_FALLBACK.find((s) => s.serviceKey === serviceKey);

  return {
    pricing: servicePricing,
    isLoading,
    error,
    isFallback: !data || !!error,
  };
}
