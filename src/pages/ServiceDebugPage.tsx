import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { PricingServiceKey } from "@/config/pricing.config";
import { SLUG_TO_SERVICE_KEY } from "@/config/serviceSlugMap";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const ServiceDebugPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { packages } = usePricingPackages();

  const urlService = searchParams.get("service");
  const pathname = location.pathname;
  const slug = pathname.split("/").filter(Boolean).pop() || "";

  const resolvedFromQuery =
    urlService && urlService in packages
      ? (urlService as PricingServiceKey)
      : null;

  const resolvedFromSlug = SLUG_TO_SERVICE_KEY[slug] ?? null;

  const finalServiceKey =
    resolvedFromQuery ??
    (resolvedFromSlug && resolvedFromSlug in packages
      ? resolvedFromSlug
      : null);

  return (
    <div className="min-h-screen bg-background p-8 text-sm">
      <h1 className="text-xl font-bold mb-6">🔍 Service Resolution Debug</h1>

      <div className="space-y-4 max-w-3xl">
        <DebugRow label="Full URL" value={window.location.href} />
        <DebugRow label="Pathname" value={pathname} />
        <DebugRow label="Slug (last segment)" value={slug || "—"} />

        <hr />

        <DebugRow
          label="Query param ?service"
          value={urlService ?? "❌ not present"}
          status={!!urlService}
        />

        <DebugRow
          label="Resolved from query"
          value={resolvedFromQuery ?? "❌ invalid / not found"}
          status={!!resolvedFromQuery}
        />

        <DebugRow
          label="Resolved from slug map"
          value={resolvedFromSlug ?? "❌ not mapped"}
          status={!!resolvedFromSlug}
        />

        <hr />

        <DebugRow
          label="FINAL serviceKey"
          value={finalServiceKey ?? "❌ NOT RESOLVED"}
          status={!!finalServiceKey}
        />

        <DebugRow
          label="Pricing exists"
          value={
            finalServiceKey && packages[finalServiceKey]
              ? "✅ YES"
              : "❌ NO"
          }
          status={
            !!finalServiceKey && !!packages[finalServiceKey]
          }
        />
      </div>
    </div>
  );
};

const DebugRow = ({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: boolean;
}) => (
  <div className="flex gap-4 items-start">
    <div className="w-56 font-medium">{label}</div>
    <div
      className={`flex-1 ${
        status === false ? "text-red-600" : status ? "text-green-600" : ""
      }`}
    >
      {value}
    </div>
  </div>
);

export default ServiceDebugPage;
