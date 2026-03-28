import React from "react";
import { Check, ArrowRight, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { SERVICE_ROUTE_MAP } from "@/config/serviceRouteMap";

export const StepPricing: React.FC = () => {
  const { updateSelections, serviceKey } = useCheckout();
  const navigate = useNavigate();
  const { packages, displayNames } = usePricingPackages();

  const pricing = packages[serviceKey];
  const serviceDisplayName = displayNames[serviceKey];
  const foundationTitle = pricing?.foundation?.title ?? "Foundation Setup";
  const foundationCtaLabel = `Get ${foundationTitle}`;

  if (!pricing) {
    return (
      <div className="p-6 text-center text-red-500">
        Invalid service selected
      </div>
    );
  }
  const handlePackageSelect = (
    packageType: "registration_only" | "registration_plus_accounting"
  ) => {
    const baseUrl = window.location.origin;
    const route = SERVICE_ROUTE_MAP[serviceKey];

    console.log("Selected package:", packageType);
    console.log("Service key:", serviceKey);
    console.log("Navigating to route:", route);

    if (!route) {
      console.error("No route found for service:", serviceKey);
      return;
    }

    // 🔥 OPEN CHECKOUT IN NEW TAB AT STEP 1
    window.open(
      `${baseUrl}${route}?package=${packageType}&step=0&service=${serviceKey}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

 return (
    <div className="py-6 sm:py-10 px-3 sm:px-4 bg-background">
      <div className="mx-auto max-w-[900px] grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ================= FOUNDATION ================= */}
        <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">{foundationTitle}</h3>
                <p className="text-xs text-muted-foreground">One-time only</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  ${pricing.foundation.price}
                </div>
                <div className="text-xs text-muted-foreground">one-time</div>
              </div>
            </div>
          </div>

          <div className="p-4 flex-grow flex flex-col">
            <ul className="space-y-1 mb-4 flex-grow">
              {pricing.foundation.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-xs text-foreground">
                  <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePackageSelect("registration_only")}
              className="w-full h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center gap-2 font-semibold"
            >
              {foundationCtaLabel}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Setup only • No ongoing services
            </p>
          </div>
        </div>

        {/* ================= ACCOUNTING ================= */}
        <div className="border-2 border-[hsl(var(--cta))] rounded-lg bg-[hsl(var(--cta)/0.05)] flex flex-col relative">

          <div className="p-4 border-b border-[hsl(var(--cta)/0.2)]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[hsl(var(--cta))] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Registration + Accounting
                </h3>
                <p className="text-xs text-[hsl(var(--cta))]">
                  Build your custom package
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 flex-grow flex flex-col">
            <p className="text-sm text-muted-foreground mb-4">
              Get everything in{" "}
              <strong className="text-foreground">{serviceDisplayName}</strong> plus complete ongoing
              accounting and compliance services tailored to your business.
            </p>

            <ul className="space-y-1 mb-4">
              <li className="flex gap-2 text-xs font-semibold text-foreground">
                <Check className="w-4 h-4 text-[hsl(var(--success))]" />
                Customized to your revenue tier
              </li>
              <li className="flex gap-2 text-xs font-semibold text-foreground">
                <Check className="w-4 h-4 text-[hsl(var(--success))]" />
                Monthly or annual billing options
              </li>
            </ul>

            <div className="mb-4">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                Includes:
              </p>
              <ul className="space-y-1">
                {pricing.accounting.includes.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground">
                    <Check className="w-4 h-4 text-[hsl(var(--cta))]" />
                    {item}
                  </li>
                ))}
                <li className="text-xs text-[hsl(var(--cta))] font-semibold ml-6">
                  + {pricing.accounting.extraCount} more services
                </li>
              </ul>
            </div>

            <button
              onClick={() =>
                handlePackageSelect("registration_plus_accounting")
              }
              className="w-full h-12 bg-[hsl(var(--cta))] text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-auto hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              Build Your Package
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Choose your business type, select revenue tier & get custom pricing
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
