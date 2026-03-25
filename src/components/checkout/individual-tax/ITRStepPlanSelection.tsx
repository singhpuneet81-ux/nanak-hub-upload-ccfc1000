import React, { useState } from "react";
import { Check, ArrowRight, Zap, Users } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { usePricingPackages, type ApiPlanMeta } from "@/hooks/usePricingPackages";
import { Counter } from "@/components/checkout/Counter";

const FALLBACK_PLAN_FEATURES: Record<string, { badge: { text: string; class: string }; title: string; priceLabel: string; features: string[]; btnClass: string; btnText: string; recommended: boolean }> = {
  essential: {
    badge: { text: "ESSENTIAL", class: "bg-primary text-primary-foreground" },
    title: "Core tax return service",
    priceLabel: "Per return",
    features: [
      "PAYG Income Assessment",
      "Standard Deductions",
      "Medicare Levy Calculation",
      "e-Tax Lodgement",
      "Tax Return Review",
    ],
    btnClass: "bg-[#1e3a5f] hover:bg-[#2a4a73] text-white",
    btnText: "Get Started",
    recommended: false,
  },
  premium: {
    badge: { text: "PREMIUM", class: "bg-[hsl(var(--cta))] text-white disabled:opacity-50" },
    title: "Full service with priority support",
    priceLabel: "Per return",
    features: [
      "PAYG Income Assessment",
      "Standard Deductions",
      "Medicare Levy Calculation",
      "e-Tax Lodgement",
      "Tax Return Review",
      "ATO Correspondence Support",
      "Same Day Processing (Priority)",
      "Priority Processing (24hr Turnaround)",
      "Dedicated Tax Specialist",
      "Free 15 mins Discovery Call",
    ],
    btnClass: "bg-[hsl(var(--cta))] hover:opacity-90 text-white disabled:opacity-50",
    btnText: "Get Started",
    recommended: true,
  },
};

const PLAN_PRICE_MULTIPLIERS: Record<string, number> = {
  essential: 1,
  premium: 1.5,
};

interface ITRStepPlanSelectionProps {
  onSelect?: (plan: string) => void;
}

export const ITRStepPlanSelection: React.FC<ITRStepPlanSelectionProps> = ({ onSelect }) => {
  const { updateCustomer, customer, nextStep, setStep } = useCheckout();
  const { packages, serviceMeta } = usePricingPackages();
  const basePrice = packages.individual_tax_return.foundation.price;
  const [returnCount, setReturnCount] = useState(() => (customer.itrReturnCount as number) || 1);

  // Build plans from API meta if available, otherwise use fallback
  const apiPlans = (serviceMeta.individual_tax_return as any)?.plans as Record<string, ApiPlanMeta> | undefined;
  const foundationFeatures = packages.individual_tax_return.foundation.features;
  const accountingIncludes = packages.individual_tax_return.accounting.includes;

  const PLANS = Object.entries(FALLBACK_PLAN_FEATURES).map(([id, fallback]) => {
    const apiPlan = apiPlans?.[id];
    // Essential: foundation.features → meta.plans → fallback
    // Premium: accounting.includes → meta.plans → fallback
    const resolvedFeatures =
      id === "essential"
        ? (foundationFeatures?.length ? foundationFeatures : (apiPlan?.features?.length ? apiPlan.features : fallback.features))
        : (accountingIncludes?.length ? accountingIncludes : (apiPlan?.features?.length ? apiPlan.features : fallback.features));
    return {
      id,
      ...fallback,
      features: resolvedFeatures,
      title: apiPlan?.subtitle || fallback.title,
      price: id === "essential" ? basePrice : Math.round(basePrice * 1.5),
    };
  });

  const handleCountChange = (count: number) => {
    setReturnCount(count);
    updateCustomer({ itrReturnCount: count });
  };

  const handleSelect = (planId: string) => {
    // Open checkout Step 1 in a new tab with plan pre-selected
    window.open(`/individual-tax-return?checkout=1&plan=${planId}&count=${returnCount}`, "_blank");
  };

  return (
    <div className="py-10 px-4 bg-background">
      {/* Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--cta)/0.1)] border border-[hsl(var(--cta)/0.2)]">
          <Zap size={14} className="text-[hsl(var(--cta))]" />
          <span className="text-sm font-medium text-[hsl(var(--cta))]">INDIVIDUAL TAX RETURNS</span>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Lodge Your Tax Return{" "}
          <span className="text-[hsl(var(--cta))]">Online</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
          Fast, compliant, and stress-free individual tax returns from ATO registered agents
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
        {[`From $${basePrice}`, "24-48hr Processing", "ATO Registered"].map((badge) => (
          <div key={badge} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-[hsl(var(--success))]" />
            <span>{badge}</span>
          </div>
        ))}
      </div>


      {/* Choose Service Level */}
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Choose Your Service Level</h2>
        <p className="text-muted-foreground mt-2">Select the plan that best suits your tax return needs</p>
      </div>

      {/* Plan Cards */}
      <div className="mx-auto max-w-[900px] grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl bg-card border flex flex-col overflow-hidden relative ${
              plan.recommended ? "border-2 border-[hsl(var(--cta))] shadow-lg" : "border-border shadow-sm"
            }`}
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className="absolute top-4 right-4">
                <span className="inline-block px-2.5 py-1 bg-[hsl(var(--cta))] text-white text-[10px] font-bold uppercase rounded tracking-wide disabled:opacity-50">
                  Recommended
                </span>
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
              {/* Badge */}
              <span className={`inline-block w-fit px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide mb-3 ${plan.badge.class}`}>
                {plan.badge.text}
              </span>

              <h3 className="text-base text-foreground mb-1">{plan.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{plan.priceLabel}</p>

              <div className="text-3xl font-bold text-foreground mb-1">
                ${plan.price * returnCount}
              </div>
              {returnCount > 1 && (
                <p className="text-xs text-muted-foreground mb-3">{returnCount} × ${plan.price} per return</p>
              )}
              {returnCount <= 1 && <div className="mb-3" />}

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-grow">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                      plan.recommended ? "text-[hsl(var(--cta))]" : "text-[hsl(var(--success))]"
                    }`} />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSelect(plan.id)}
                className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold transition-all ${plan.btnClass}`}
              >
                {plan.btnText}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compare link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        ⓘ Not sure which plan to choose? Compare side by side
      </p>
    </div>
  );
};
