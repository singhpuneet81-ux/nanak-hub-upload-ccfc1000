import { useSearchParams, useLocation } from "react-router-dom";
import { PricingServiceKey } from "@/types/services";
import { SLUG_TO_SERVICE_KEY } from "@/config/services";

export function useServiceResolver(): PricingServiceKey {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Priority 1: query param ?service=xxx
  const queryService = searchParams.get("service") as PricingServiceKey | null;
  if (queryService && isValidServiceKey(queryService)) {
    return queryService;
  }

  // Priority 2: slug-based resolution from pathname
  const pathSegments = location.pathname.split("/").filter(Boolean);
  for (const segment of pathSegments) {
    if (SLUG_TO_SERVICE_KEY[segment]) {
      return SLUG_TO_SERVICE_KEY[segment];
    }
  }

  // Default
  return "abn";
}

function isValidServiceKey(key: string): key is PricingServiceKey {
  const validKeys: PricingServiceKey[] = ["abn", "business_name", "family_trust", "gst", "charity", "company", "smsf"];
  return validKeys.includes(key as PricingServiceKey);
}
