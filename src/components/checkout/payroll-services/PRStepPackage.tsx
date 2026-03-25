import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowRight, Info, Zap, Calendar, Users, Minus, Plus, PlusCircle } from "lucide-react";
import { PR_TIERS } from "@/components/checkout/payroll-services/prPricing";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { usePayrollPricing } from "@/hooks/usePayrollPricing";

interface Props {
  onNext: () => void;
}

export const PRStepPackage: React.FC<Props> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();
  const { pricing, annualDiscount } = usePayrollPricing();

  const tiers = pricing.tiers;
  const addonPrices = pricing.addonPrices;

  const selectedTierIdx = (customer.prTierIdx as number) ?? 1;
  const billing = (customer.prBilling as "monthly" | "annual") || "annual";
  const isAnnual = billing === "annual";
  const weeklyPayRuns = !!customer.prWeeklyPayRuns;
  const extraEmployees = (customer.prExtraEmployees as number) || 0;

  const tier = tiers[selectedTierIdx] ?? tiers[1] ?? tiers[0];

  return (
    <div className="space-y-6">

      {/* Billing Toggle */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-1 bg-primary/10 border-2 border-primary/20 rounded-full p-1.5">
            <button
              onClick={() => updateCustomer({ prBilling: "monthly" })}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                billing === "monthly" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => updateCustomer({ prBilling: "annual" })}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5",
                billing === "annual" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                billing === "annual" ? "bg-white/20 text-white" : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
              )}>
                SAVE {Math.round(annualDiscount * 100)}%
              </span>
            </button>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {isAnnual ? `Pay annually · one invoice · ${Math.round(annualDiscount * 100)}% discount applied` : `Billed monthly · switch to annual to save ${Math.round(annualDiscount * 100)}%`}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Annual = <strong className="text-foreground">${Math.round(tier.rate * (1 - annualDiscount))}/mo</strong> equiv.
        </span>
      </div>

      {/* Tier Cards (3 cards with static features like bookkeeping) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.slice(0, 3).map((t, idx) => {
          const isSelected = selectedTierIdx === idx;
          const displayPrice = isAnnual ? Math.round(t.rate * 12 * (1 - annualDiscount)) : t.rate;
          const suffix = isAnnual ? "/yr" : "/mo";
          const altPrice = isAnnual ? `or $${t.rate}/mo` : `$${Math.round(t.rate * 12 * (1 - annualDiscount)).toLocaleString()}/yr`;
          const isPopular = idx === 1;
          const staticTier = PR_TIERS[idx];

          return (
            <div
              key={idx}
              onClick={() => updateCustomer({ prTierIdx: idx, prTier: t.name })}
              className={cn(
                "relative rounded-2xl border-2 cursor-pointer transition-all overflow-hidden",
                isSelected ? "border-[hsl(var(--cta))] bg-card" : "border-border hover:border-primary/40 bg-card"
              )}
            >
              {isPopular && (
                <div className="bg-[hsl(var(--cta))] text-white text-[10px] font-bold text-center py-1.5 tracking-wider uppercase disabled:opacity-50">
                  <Zap className="inline w-3 h-3 mr-1" />MOST POPULAR
                </div>
              )}

              <div className={cn("p-5", isPopular && "pt-3")}>
                <div className="absolute top-4 right-4" style={isPopular ? { top: "2.5rem" } : {}}>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isSelected ? "border-[hsl(var(--cta))]" : "border-muted-foreground/40")}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--cta))] disabled:opacity-50" />}
                  </div>
                </div>

                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{staticTier?.empLabel || `${t.band} EMPLOYEES`}</p>
                <h3 className="text-lg font-bold text-foreground mb-0.5">{t.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{staticTier?.subtitle || ""}</p>
                <p className="text-3xl font-bold text-foreground">
                  ${displayPrice.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{suffix}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{altPrice}</p>
              </div>

              {staticTier && staticTier.features.length > 0 && (
                <>
                  <div className="h-px bg-border mx-4" />
                  <div className="px-5 py-4 space-y-1.5">
                    {staticTier.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <div className={cn(
                          "w-[7px] h-[7px] rounded-full mt-1.5 shrink-0",
                          idx === 0 ? "bg-[hsl(var(--success))]" : (fi === 0 ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--cta))] disabled:opacity-50")
                        )} />
                        <span className="text-[11px] text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>


      {/* Pay Frequency */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Pay Frequency</h3>
            <p className="text-sm text-muted-foreground">Fortnightly or monthly included · weekly costs more</p>
          </div>
        </div>
        <div className="border-t border-border px-5 py-4">
          <div
            onClick={() => updateCustomer({ prWeeklyPayRuns: !weeklyPayRuns })}
            className="flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors rounded-lg -mx-2 px-2 py-1"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={weeklyPayRuns}
                onCheckedChange={(c) => updateCustomer({ prWeeklyPayRuns: !!c })}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <p className="font-medium text-foreground text-sm">Weekly Pay Runs</p>
                <p className="text-xs text-muted-foreground">4× the STP lodgements, reconciliation & super processing each month</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-semibold text-foreground text-sm">+${addonPrices.weekly}/mo</p>
              <p className="text-[10px] text-muted-foreground">upgrade from fortnightly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Employees */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Users size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Extra Employees</h3>
            <p className="text-sm text-muted-foreground">Above your plan limit · ${addonPrices.extraEmp}/employee/mo</p>
          </div>
        </div>
        <div className="border-t border-border px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground text-sm">Additional employees above plan</p>
            <p className="text-xs text-muted-foreground">Each extra employee beyond the tier limit</p>
          </div>
          <div className="flex items-center gap-3">
            {extraEmployees > 0 && (
              <span className="text-sm font-semibold text-[hsl(var(--cta))]">${extraEmployees * addonPrices.extraEmp}/mo</span>
            )}
            <button
              onClick={() => updateCustomer({ prExtraEmployees: Math.max(0, extraEmployees - 1) })}
              disabled={extraEmployees <= 0}
              className="w-8 h-8 rounded-full bg-[hsl(var(--cta))] text-white flex items-center justify-center disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold text-foreground min-w-[24px] text-center">{extraEmployees}</span>
            <button
              onClick={() => updateCustomer({ prExtraEmployees: Math.min(50, extraEmployees + 1) })}
              className="w-8 h-8 rounded-full bg-[hsl(var(--cta))] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        {extraEmployees > 0 && (
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>{extraEmployees} extra employee{extraEmployees > 1 ? "s" : ""} × ${addonPrices.extraEmp}/mo</span>
              <strong className="text-foreground">${extraEmployees * addonPrices.extraEmp}/mo</strong>
            </div>
            <div className="flex justify-between text-muted-foreground/70">
              <span>Annual equivalent</span>
              <span>{isAnnual
                ? `$${Math.round(extraEmployees * addonPrices.extraEmp * 12 * (1 - annualDiscount)).toLocaleString()}/yr (${Math.round(annualDiscount * 100)}% off)`
                : `$${(extraEmployees * addonPrices.extraEmp * 12).toLocaleString()}/yr`
              }</span>
            </div>
          </div>
        )}
      </div>

      {/* Continue */}
      <div className="checkout-nav flex justify-center pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};