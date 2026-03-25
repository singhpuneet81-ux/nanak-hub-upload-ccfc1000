import { useQuery } from "@tanstack/react-query";
import strFallback from "../../docs/seeders/sole-trader-pricing-seeder.json";

const API_URL = "https://api.connect.cavaluer.com/api/admin/sole-trader-pricing";

export interface STRIncomeStream {
  id: string;
  label: string;
  desc: string;
  basePrice: number;
  pricePrefix?: string;
  priceSuffix?: string;
  icon: string;
  type: "checkbox" | "expandable" | "counter" | "sharecounter";
}

export interface STRPlan {
  title: string;
  features: string[];
}

export interface STRPricingConfig {
  serviceKey: string;
  label: string;
  incomeStreams: STRIncomeStream[];
  abnIncomeTiers: Record<string, number>;
  abnGstSurcharge: number;
  basPrice: number;
  discountThreshold: number;
  discountPercent: number;
  premiumSurchargePerStream: number;
  plans: {
    essential: STRPlan;
    premium: STRPlan;
  };
  declarations: string[];
  whatHappensNext: { title: string; desc: string }[];
  pageTitle: string;
  pageSubtitle: string;
}

const isValidSoleTraderPricing = (data: any): data is STRPricingConfig => {
  return (
    data?.serviceKey === "sole_trader_tax_return" &&
    Array.isArray(data?.incomeStreams) &&
    typeof data?.abnGstSurcharge === "number" &&
    data?.abnIncomeTiers &&
    typeof data?.basPrice === "number" &&
    typeof data?.discountThreshold === "number" &&
    typeof data?.discountPercent === "number" &&
    typeof data?.premiumSurchargePerStream === "number" &&
    typeof data?.plans?.essential?.title === "string" &&
    Array.isArray(data?.plans?.essential?.features) &&
    typeof data?.plans?.premium?.title === "string" &&
    Array.isArray(data?.plans?.premium?.features) &&
    Array.isArray(data?.declarations) &&
    Array.isArray(data?.whatHappensNext)
  );
};

const fetchSTRPricing = async (): Promise<STRPricingConfig> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch sole trader pricing");
  const json = await res.json();
  if (json?.success && isValidSoleTraderPricing(json?.data)) return json.data;
  throw new Error("Invalid sole trader pricing payload");
};

export const useSoleTraderPricing = () => {
  const { data, isLoading, error } = useQuery<STRPricingConfig>({
    queryKey: ["sole-trader-pricing"],
    queryFn: fetchSTRPricing,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const cfg = data || (strFallback as STRPricingConfig);
  return { cfg, isLoading, error };
};
