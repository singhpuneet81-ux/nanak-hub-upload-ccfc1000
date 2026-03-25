import { useQuery } from "@tanstack/react-query";
import {
  TIERED_PRICING,
  type TieredServiceKey,
  type TieredServiceConfig,
} from "@/config/tieredPricing.config";

const API_BASE_URL = "https://api.connect.cavaluer.com";

interface ApiTieredPlan {
  id: string;
  label: string;
  subtitle: string;
  badge: string | null;
  price: number;
  delivery: string;
  recommended: boolean;
  features: string[];
}

interface ApiTieredAddon {
  id: string;
  label: string;
  price: number;
}

interface ApiServiceMeta {
  plans?: ApiTieredPlan[];
  addons?: ApiTieredAddon[];
}

interface ApiService {
  key: string;
  label: string;
  meta?: ApiServiceMeta;
  [k: string]: unknown;
}

interface ApiResponse {
  services: ApiService[];
}

async function fetchTieredPricing(): Promise<Record<TieredServiceKey, TieredServiceConfig>> {
  const res = await fetch(`${API_BASE_URL}/api/admin/pricing`);
  if (!res.ok) throw new Error(`Tiered pricing API error: ${res.status}`);
  const data: ApiResponse = await res.json();

  const result = { ...TIERED_PRICING };

  for (const svc of data.services) {
    const key = svc.key as TieredServiceKey;
    if (key in TIERED_PRICING && svc.meta?.plans?.length) {
      result[key] = {
        plans: svc.meta.plans,
        ...(svc.meta.addons?.length ? { addons: svc.meta.addons } : {}),
      };
    }
  }

  return result;
}

export function useTieredPricing(serviceKey: TieredServiceKey) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tiered-pricing"],
    queryFn: fetchTieredPricing,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const config = data?.[serviceKey] ?? TIERED_PRICING[serviceKey];

  return {
    plans: config.plans,
    addons: config.addons ?? [],
    isLoading,
    error,
  };
}
