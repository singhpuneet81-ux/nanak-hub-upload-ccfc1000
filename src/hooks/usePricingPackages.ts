import { useQuery } from "@tanstack/react-query";
import {
  PRICING_PACKAGES as STATIC_PACKAGES,
  SERVICE_DISPLAY_NAMES as STATIC_DISPLAY_NAMES,
  type PricingServiceKey,
  type PricingPackage,
} from "@/config/pricing.config";

const API_BASE_URL = "https://api.connect.cavaluer.com";

export type PricingCategory = "business_formation" | "accounting_tax" | "business_advisory";

export const CATEGORY_LABELS: Record<PricingCategory, string> = {
  business_formation: "Business Formation",
  accounting_tax: "Accounting & Tax",
  business_advisory: "Business Advisory",
};

interface ApiService {
  key?: string;
  serviceKey?: string;
  label: string;
  category?: PricingCategory;
  foundation: {
    title: string;
    price: number;
    features: string[];
  };
  accounting: {
    includes: string[];
    extraCount: number;
  };
  meta?: Record<string, unknown> | null;
}

export interface ApiPlanMeta {
  title?: string;
  subtitle?: string;
  badge?: string | null;
  features?: string[];
  [k: string]: unknown;
}

type ApiResponse = { services: ApiService[] } | ApiService[];

// Static fallback categories for when API doesn't return category field
const STATIC_CATEGORIES: Partial<Record<PricingServiceKey, PricingCategory>> = {
  abn: "business_formation",
  business_name: "business_formation",
  family_trust: "business_formation",
  gst: "business_formation",
  charity: "business_formation",
  charity_ia: "business_formation",
  charity_clg: "business_formation",
  company: "business_formation",
  smsf: "business_formation",
  partnership: "business_formation",
  unit_trust: "business_formation",
  bare_trust: "business_formation",
  individual_tax_return: "accounting_tax",
  sole_trader_tax_return: "accounting_tax",
  bundle_tax_return: "accounting_tax",
  tfn: "accounting_tax",
  rental_properties: "accounting_tax",
  asic_agent: "accounting_tax",
  company_accounting: "accounting_tax",
  trust_accounting: "accounting_tax",
  nfp_accounting: "accounting_tax",
  smsf_accounting: "accounting_tax",
  partnership_tax: "accounting_tax",
  bookkeeping: "accounting_tax",
  payroll_services: "accounting_tax",
  business_plan: "business_advisory",
  business_valuation: "business_advisory",
  business_due_diligence: "business_advisory",
  business_wealth_structuring: "business_advisory",
};

const SERVICE_KEY_ALIASES: Record<string, PricingServiceKey> = {
  payroll: "payroll_services",
  payroll_services: "payroll_services",
  bookkeeping: "bookkeeping",
};

function normalizeServices(payload: ApiResponse): ApiService[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.services)) return payload.services;
  return [];
}

function resolvePricingServiceKey(svc: ApiService): PricingServiceKey | null {
  const rawKey = svc.key ?? svc.serviceKey;
  if (!rawKey) return null;

  const normalized = (SERVICE_KEY_ALIASES[rawKey] ?? rawKey) as PricingServiceKey;
  return normalized;
}

async function fetchPricing(): Promise<{
  packages: Record<PricingServiceKey, PricingPackage>;
  displayNames: Record<PricingServiceKey, string>;
  categories: Record<PricingServiceKey, PricingCategory>;
  serviceMeta: Record<string, Record<string, unknown>>;
}> {
  console.log("[PricingAPI] Fetching from:", `${API_BASE_URL}/api/admin/pricing`);
  const res = await fetch(`${API_BASE_URL}/api/admin/pricing`);
  if (!res.ok) throw new Error(`Pricing API error: ${res.status}`);

  const payload: ApiResponse = await res.json();
  const services = normalizeServices(payload);
  if (services.length === 0) {
    throw new Error("Pricing API format error: no services array in response");
  }

  console.log("[PricingAPI] Fetched successfully, services count:", services.length);

  // Start with static shape, then override with API data
  const packages: Record<string, PricingPackage> = { ...STATIC_PACKAGES };
  const displayNames: Record<string, string> = { ...STATIC_DISPLAY_NAMES };
  const categories: Record<string, PricingCategory> = { ...STATIC_CATEGORIES };
  const serviceMeta: Record<string, Record<string, unknown>> = {};

  for (const svc of services) {
    const key = resolvePricingServiceKey(svc);
    if (!key || !svc.foundation || !svc.accounting) continue;

    const maybePlans = (svc.meta as { plans?: Array<{ features?: string[] }> } | null)?.plans;
    const foundationFeatures =
      svc.foundation.features && svc.foundation.features.length > 0
        ? svc.foundation.features
        : maybePlans?.[0]?.features ?? [];

    packages[key] = {
      foundation: {
        ...svc.foundation,
        features: foundationFeatures,
      },
      accounting: svc.accounting,
    };

    displayNames[key] = svc.label;
    if (svc.category) categories[key] = svc.category;
    if (svc.meta && typeof svc.meta === "object") {
      serviceMeta[key] = svc.meta as Record<string, unknown>;
    }
  }

  return {
    packages,
    displayNames,
    categories: categories as Record<PricingServiceKey, PricingCategory>,
    serviceMeta,
  };
}

export function usePricingPackages() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pricing-packages"],
    queryFn: fetchPricing,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    packages: data?.packages ?? STATIC_PACKAGES,
    displayNames: data?.displayNames ?? STATIC_DISPLAY_NAMES,
    categories: data?.categories ?? (STATIC_CATEGORIES as Record<PricingServiceKey, PricingCategory>),
    serviceMeta: data?.serviceMeta ?? ({} as Record<string, Record<string, unknown>>),
    isLoading,
    error,
  };
}

/** Filter services by category */
export function useServicesByCategory(category: PricingCategory) {
  const { packages, displayNames, categories, isLoading, error } = usePricingPackages();

  const filteredKeys = (Object.keys(categories) as PricingServiceKey[]).filter(
    (key) => categories[key] === category
  );

  return {
    serviceKeys: filteredKeys,
    packages,
    displayNames,
    isLoading,
    error,
  };
}
