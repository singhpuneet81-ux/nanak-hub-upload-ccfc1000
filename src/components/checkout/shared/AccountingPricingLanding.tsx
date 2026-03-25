import React, { useState } from "react";
import { Check, ArrowRight, Zap, Target } from "lucide-react";
import { useServicePricing } from "@/hooks/useAccountingPricing";
import { getAccountingFallback } from "@/config/accountingPricingFallback";
import { StrikePriceDisplay } from "./StrikePriceDisplay";

interface Props {
  serviceKey: string;
  checkoutUrl: string;
}

const SERVICE_LABELS: Record<string, { heading: string; subtitle: string }> = {
  company_accounting: {
    heading: "Company Accounting & Tax Services",
    subtitle: "Professional accounting tailored to your company's revenue. Choose Essential or Premium, with prorated pricing for mid-year starts.",
  },
  trust_accounting: {
    heading: "Trust Accounting & Tax Services",
    subtitle: "Comprehensive trust accounting and compliance tailored to your trust's revenue. Choose Essential or Premium.",
  },
  nfp_accounting: {
    heading: "NFP Accounting & Compliance",
    subtitle: "Specialized not-for-profit accounting and reporting services. Choose Essential or Premium to suit your organisation.",
  },
  partnership_tax: {
    heading: "Partnership Tax & Accounting",
    subtitle: "Partnership tax return preparation and ongoing accounting services. Choose Essential or Premium.",
  },
};

export const AccountingPricingLanding: React.FC<Props> = ({ serviceKey, checkoutUrl }) => {
  const { pricing: apiPricing } = useServicePricing(serviceKey);
  const cfg = apiPricing ?? getAccountingFallback(serviceKey)!;

  const handleGetStarted = () => {
    const url = `${checkoutUrl}?checkout=1`;
    window.open(url, '_blank');
  };
  const labels = SERVICE_LABELS[serviceKey] ?? { heading: cfg.label, subtitle: "Choose your plan" };

  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const lowestTierId = cfg.revenueTiers[0]?.id ?? "under75k";
  const tier = cfg.tiers[lowestTierId];
  if (!tier) return null;

  const discountPct = Math.round(cfg.annualDiscount * 100);

  // Essential = compliance only price; Premium = compliance + monthly*12 + taxPlanning
  const essCompliance = tier.compliance;
  const essMonthly = tier.monthly;
  const premCompliance = tier.compliance;
  const premMonthly = tier.monthly;
  const premExtra = cfg.addons?.taxPlanningFee ?? 0;

  // Annual: compliance + monthly*12 with discount
  const essAnnualTotal = Math.round((essCompliance + essMonthly * 12) * (1 - cfg.annualDiscount));
  const premAnnualTotal = Math.round((premCompliance + premMonthly * 12 + premExtra) * (1 - cfg.annualDiscount));

  // Monthly display
  const essMonthlyDisplay = essMonthly;
  const premMonthlyDisplay = premMonthly;

  // Annual monthly equiv
  const essAnnualMonthly = Math.round(essAnnualTotal / 12);
  const premAnnualMonthly = Math.round(premAnnualTotal / 12);

  const essentialPlan = cfg.plans?.essential;
  const premiumPlan = cfg.plans?.premium;

  // Strike prices
  const essStrikeCompliance = tier.strikeCompliance;
  const premStrikeCompliance = tier.strikeCompliance;

  const showStrike = cfg.enableStrikePricing;

  const essPrice = billing === "annual"
    ? `$${essAnnualTotal.toLocaleString()}`
    : `$${essMonthlyDisplay.toLocaleString()}`;
  const premPrice = billing === "annual"
    ? `$${premAnnualTotal.toLocaleString()}`
    : `$${premMonthlyDisplay.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-center gap-1.5">
            <Target size={14} /> Flexible, Transparent Pricing
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">{labels.heading}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{labels.subtitle}</p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[hsl(var(--cta))] mb-3">
            Billing Period
          </p>
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 bg-card border-2 border-border rounded-full p-1.5 shadow-sm">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  billing === "monthly"
                    ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  billing === "annual"
                    ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  billing === "annual"
                    ? "bg-white/20 text-white"
                    : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                }`}>
                  SAVE {discountPct}%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {/* Essential Card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{essentialPlan?.title ?? "Essential"}</h3>
                    <p className="text-sm text-muted-foreground">{essentialPlan?.subtitle ?? "Compliance-focused accounting"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Starts from</p>
                    {showStrike && essStrikeCompliance && billing === "annual" && (
                      <p className="text-sm text-muted-foreground/60 line-through">
                        ${Math.round((essStrikeCompliance + essMonthly * 12) * (1 - cfg.annualDiscount)).toLocaleString()}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-foreground">{essPrice}</p>
                    <p className="text-xs text-muted-foreground">/{billing === "annual" ? "year" : "month"}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <p className="text-sm text-muted-foreground mb-4">
                  {billing === "annual" ? `$${essAnnualMonthly}/month if annual` : `$${essCompliance.toLocaleString()}/year compliance`}
                </p>
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {(essentialPlan?.features ?? []).map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-[hsl(var(--success))]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Get Started Now
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Premium Card */}
            <div className="bg-[hsl(var(--cta)/0.03)] border-2 border-[hsl(var(--cta))] rounded-2xl shadow-md flex flex-col overflow-hidden relative">
              {premiumPlan?.badge && (
                <div className="absolute -top-0 left-0 right-0">
                  <div className="bg-[hsl(var(--cta))] text-white text-xs font-bold text-center py-1 rounded-t-xl disabled:opacity-50">
                    {premiumPlan.badge}
                  </div>
                </div>
              )}

              <div className={`p-6 border-b border-[hsl(var(--cta)/0.2)] ${premiumPlan?.badge ? "pt-10" : ""}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--cta))] flex items-center justify-center mt-0.5 disabled:opacity-50">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{premiumPlan?.title ?? "Premium"}</h3>
                      <p className="text-sm text-[hsl(var(--cta))]">{premiumPlan?.subtitle ?? "Strategic growth"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Starts from</p>
                    {showStrike && premStrikeCompliance && billing === "annual" && (
                      <p className="text-sm text-muted-foreground/60 line-through">
                        ${Math.round((premStrikeCompliance + premMonthly * 12 + premExtra) * (1 - cfg.annualDiscount)).toLocaleString()}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-foreground">{premPrice}</p>
                    <p className="text-xs text-muted-foreground">/{billing === "annual" ? "year" : "month"}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <p className="text-sm text-muted-foreground mb-4">
                  {billing === "annual" ? `$${premAnnualMonthly}/month if annual` : `$${(premCompliance + premExtra).toLocaleString()}/year compliance`}
                </p>
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {(premiumPlan?.features ?? []).map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground font-medium">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-[hsl(var(--cta))]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className="w-full h-12 bg-[hsl(var(--cta))] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Zap size={16} />
                  Get Started Now
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            All prices exclude GST · Pricing based on lowest revenue tier · Prorated pricing available for mid-year starts
          </p>
        </div>
      </div>
    </div>
  );
};
