import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Shield, CheckCircle, Award } from "lucide-react";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { TPBBadge } from "../shared/TPBBadge";
import { usePayrollPricing } from "@/hooks/usePayrollPricing";

export const PROrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { pricing, annualDiscount } = usePayrollPricing();

  const tiers = pricing.tiers;
  const addonPrices = pricing.addonPrices;

  const selectedTierIdx = (customer.prTierIdx as number) ?? 1;
  const billing = (customer.prBilling as "monthly" | "annual") || "annual";
  const weeklyPayRuns = !!customer.prWeeklyPayRuns;
  const extraEmployees = (customer.prExtraEmployees as number) || 0;
  const paydaySuper = !!customer.prPaydaySuper;
  const termination = !!customer.prTermination;
  const backPay = !!customer.prBackPay;
  const healthCheck = !!customer.prHealthCheck;

  const tier = tiers[selectedTierIdx] ?? tiers[1] ?? tiers[0];
  const isAnnual = billing === "annual";
  const suffix = isAnnual ? "/yr" : "/mo";

  // Calculate dynamically
  const baseMo = tier.rate;
  const weeklyMo = weeklyPayRuns ? addonPrices.weekly : 0;
  const extraEmpMo = extraEmployees * addonPrices.extraEmp;
  const recurMo = baseMo + weeklyMo + extraEmpMo;

  const onetimeTotal =
    (paydaySuper ? addonPrices.paydaysuper : 0) +
    (termination ? addonPrices.termination : 0) +
    (backPay ? addonPrices.backpay : 0) +
    (healthCheck ? addonPrices.healthcheck : 0);

  let planBase: number, weeklyAddon: number, extraEmpTotal: number, discountAmount: number, total: number;

  if (isAnnual) {
    const recurYrFull = recurMo * 12;
    discountAmount = Math.round(recurYrFull * annualDiscount);
    planBase = Math.round(baseMo * 12 * (1 - annualDiscount));
    weeklyAddon = Math.round(weeklyMo * 12 * (1 - annualDiscount));
    extraEmpTotal = Math.round(extraEmpMo * 12 * (1 - annualDiscount));
    total = recurYrFull - discountAmount + onetimeTotal;
  } else {
    planBase = baseMo;
    weeklyAddon = weeklyMo;
    extraEmpTotal = extraEmpMo;
    discountAmount = 0;
    total = recurMo + onetimeTotal;
  }

  const hasAddons = weeklyPayRuns || extraEmployees > 0;
  const hasOnetime = onetimeTotal > 0;
  const fullYr = recurMo * 12;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground p-5 rounded-t-2xl">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Selected Plan */}
        <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-3">
          <p className="text-[10px] font-semibold text-[hsl(var(--cta))] uppercase tracking-wider">Selected Plan</p>
          <p className="font-bold text-foreground">{tier.name}</p>
          <p className="text-xs text-muted-foreground">
            {tier.band} employees · fortnightly or monthly
          </p>
        </div>

        {/* Always included */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Always Included</p>
          {[
            "STP Phase 2 lodgement every pay run",
            "12% super guarantee processing",
            "PAYG withholding & payslips",
            "EOFY finalisation & ATO compliance",
            "Payday Super ready (July 2026)",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <CheckCircle size={12} className="text-primary shrink-0" />
              <span className="text-xs text-primary">{item}</span>
            </div>
          ))}
        </div>

        {/* Line items */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tier.name} plan</span>
            <span className="font-semibold text-foreground">${planBase.toLocaleString()}{suffix}</span>
          </div>

          {hasAddons ? (
            <>
              {weeklyPayRuns && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly pay frequency</span>
                  <span className="font-semibold text-[hsl(var(--cta))]">${weeklyAddon.toLocaleString()}{suffix}</span>
                </div>
              )}
              {extraEmployees > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{extraEmployees} extra employee{extraEmployees > 1 ? "s" : ""}</span>
                  <span className="font-semibold text-[hsl(var(--cta))]">${extraEmpTotal.toLocaleString()}{suffix}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center">No add-ons selected</p>
          )}
        </div>

        {/* One-time services */}
        {hasOnetime && (
          <div className="border-t border-border pt-3 space-y-3 text-sm">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">One-Time Services</p>
            {paydaySuper && (
              <div className="flex justify-between">
                <div>
                  <span className="text-muted-foreground">Payday Super setup</span>
                  <p className="text-[10px] text-muted-foreground">one-time</p>
                </div>
                <span className="font-semibold text-[hsl(var(--cta))]">${addonPrices.paydaysuper}</span>
              </div>
            )}
            {termination && (
              <div className="flex justify-between">
                <div>
                  <span className="text-muted-foreground">Termination calculation</span>
                  <p className="text-[10px] text-muted-foreground">one-time</p>
                </div>
                <span className="font-semibold text-[hsl(var(--cta))]">${addonPrices.termination}</span>
              </div>
            )}
            {backPay && (
              <div className="flex justify-between">
                <div>
                  <span className="text-muted-foreground">Back-pay / underpayment review</span>
                  <p className="text-[10px] text-muted-foreground">one-time</p>
                </div>
                <span className="font-semibold text-[hsl(var(--cta))]">${addonPrices.backpay}</span>
              </div>
            )}
            {healthCheck && (
              <div className="flex justify-between">
                <div>
                  <span className="text-muted-foreground">Payroll health check</span>
                  <p className="text-[10px] text-muted-foreground">one-time</p>
                </div>
                <span className="font-semibold text-[hsl(var(--cta))]">${addonPrices.healthcheck}</span>
              </div>
            )}
          </div>
        )}

        {/* Discount */}
        {isAnnual && discountAmount > 0 && (
          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--success))] font-medium">Annual discount ({Math.round(annualDiscount * 100)}%)</span>
              <span className="text-[hsl(var(--success))] font-medium">−${discountAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total due today</p>
          {isAnnual && discountAmount > 0 && pricing.enableStrikePricing && (
            <p className="text-sm text-muted-foreground/60 line-through mt-0.5">${(fullYr + onetimeTotal).toLocaleString()}/yr</p>
          )}
          <p className="text-3xl font-bold text-foreground mt-1">${total.toLocaleString()}{suffix}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isAnnual ? `Annual · ${Math.round(annualDiscount * 100)}% discount · ${pricing.noticePeriod || "1 month"} cancellation notice` : `Monthly · ${pricing.noticePeriod || "1 month"} cancellation notice · no discount`}
          </p>
        </div>


        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
