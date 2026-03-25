import React, { useState } from "react";
import { ArrowRight, Zap, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayrollPricing } from "@/hooks/usePayrollPricing";
import { PR_TIERS } from "./prPricing";

export const PRPricingLanding: React.FC = () => {
  const { pricing, annualDiscount } = usePayrollPricing();
  const tiers = pricing.tiers;
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const isAnnual = billing === "annual";
  const discountPct = Math.round(annualDiscount * 100);

  const handleGetStarted = (tierIdx: number) => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/payroll-services?checkout=1&tier=${tierIdx}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">


      {/* Billing Toggle */}
      <div className="py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[hsl(var(--cta))] mb-3">Billing Period</p>
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 bg-card border-2 border-border rounded-full p-1.5 shadow-sm">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all",
                  billing === "monthly" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5",
                  billing === "annual" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annual
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  billing === "annual" ? "bg-white/20 text-white" : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                )}>
                  SAVE {discountPct}%
                </span>
              </button>
            </div>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {tiers.slice(0, 3).map((t, idx) => {
              const displayPrice = isAnnual ? Math.round(t.rate * 12 * (1 - annualDiscount)) : t.rate;
              const suffix = isAnnual ? "/yr" : "/mo";
              const altPrice = isAnnual ? `or $${t.rate}/mo` : `$${Math.round(t.rate * 12 * (1 - annualDiscount)).toLocaleString()}/yr`;
              const isPopular = idx === 1;
              const staticTier = PR_TIERS[idx];

              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-2xl flex flex-col overflow-hidden",
                    isPopular
                      ? "border-2 border-[hsl(var(--cta))] shadow-md bg-[hsl(var(--cta)/0.03)]"
                      : "border border-border shadow-sm bg-card"
                  )}
                >
                  {isPopular && (
                    <div className="bg-[hsl(var(--cta))] text-white text-xs font-bold text-center py-1.5 tracking-wider uppercase disabled:opacity-50">
                      <Zap className="inline w-3 h-3 mr-1" />MOST POPULAR
                    </div>
                  )}

                  <div className={cn("p-6", isPopular && "pt-4")}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {staticTier?.empLabel || `${t.band} EMPLOYEES`}
                    </p>
                    <h3 className="text-xl font-bold text-foreground mb-0.5">{t.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{staticTier?.subtitle || ""}</p>

                    <div className="mb-1">
                      <span className="text-3xl font-bold text-foreground">${displayPrice.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">{suffix}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-5">{altPrice}</p>

                    {/* Features */}
                    {staticTier && staticTier.features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {staticTier.features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2 text-sm">
                            <div className={cn(
                              "w-[7px] h-[7px] rounded-full mt-1.5 shrink-0",
                              idx === 0 ? "bg-[hsl(var(--success))]" : (fi === 0 ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--cta))] disabled:opacity-50")
                            )} />
                            <span className="text-muted-foreground text-xs">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="px-6 pb-6 mt-auto">
                    <button
                      onClick={() => handleGetStarted(idx)}
                      className={cn(
                        "w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm",
                        isPopular
                          ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {isPopular && <Zap size={16} />}
                      Get Started Now
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            All prices exclude GST · {isAnnual ? `${discountPct}% annual discount applied` : "Switch to annual to save"} · Fortnightly or monthly pay runs included
          </p>
        </div>
      </div>
    </div>
  );
};
