import { useQuery } from "@tanstack/react-query";
import smsfFallback from "../../docs/seeders/smsf-pricing-seeder.json";

const API_URL = "https://api.connect.cavaluer.com/api/admin/smsf-pricing";

export interface SMSFInvestmentAddon {
  id: string;
  label: string;
  sub: string;
  price: number;
}

export interface SMSFPricingConfig {
  serviceKey: string;
  label: string;
  baseAnnual: number;
  annualDiscount: number;
  propertyRates: {
    residential: number;
    commercial: number;
  };
  investmentAddons: SMSFInvestmentAddon[];
  extraMemberFee: number;
  pensionFee: number;
  strategySessionFee: number;
  catchUpFee: number;
  baseFeatures: string[];
  standardExtras: string[];
  customScenarios: string[];
  standardCardTitle: string;
  standardCardSubtitle: string;
  customCardTitle: string;
  customCardSubtitle: string;
  disclaimerText: string;
}

const isValidSMSFPricing = (data: any): data is SMSFPricingConfig => {
  return (
    data?.serviceKey === "smsf_accounting" &&
    typeof data?.baseAnnual === "number" &&
    typeof data?.propertyRates?.residential === "number" &&
    typeof data?.propertyRates?.commercial === "number" &&
    Array.isArray(data?.investmentAddons) &&
    Array.isArray(data?.baseFeatures)
  );
};

const fetchSMSFPricing = async (): Promise<SMSFPricingConfig> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch SMSF pricing");
  const json = await res.json();
  if (json?.success && isValidSMSFPricing(json?.data)) return json.data;
  throw new Error("Invalid SMSF pricing payload");
};

export const useSMSFPricing = () => {
  const { data, isLoading, error } = useQuery<SMSFPricingConfig>({
    queryKey: ["smsf-pricing"],
    queryFn: fetchSMSFPricing,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const cfg = data || (smsfFallback as SMSFPricingConfig);
  return { cfg, isLoading, error };
};
