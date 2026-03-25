import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Shield, CheckCircle, Award } from "lucide-react";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { TPBBadge } from "../shared/TPBBadge";
import { useBookkeepingPricing } from "@/hooks/useBookkeepingPricing";

const PREMIUM_CATCH_UP_FEE = 599;
const REGISTERED_OFFICE_FEE = 300;
const TAX_PLANNING_FEE = 299;

export const BKOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { pricing, annualDiscount } = useBookkeepingPricing();

  const tiers = pricing.tiers;
  const addonPrices = pricing.addonPrices;

  const selectedTierIdx = (customer.bkTierIdx as number) ?? 1;
  const billing = (customer.bkBilling as "monthly" | "annual") || "annual";
  const employees = (customer.bkEmployees as number) || 0;
  const extraFeeds = !!customer.bkExtraFeeds;
  const catchUp = !!customer.bkCatchUp;
  const ias = !!customer.bkIas;
  const jobTracking = !!customer.bkJobTracking;

  // Premium add-ons (Step 2)
  const premiumCatchUp = (customer.bkPremiumCatchUp as string) || "up_to_date";
  const registeredOffice = !!customer.bkRegisteredOffice;
  const taxPlanning = !!customer.bkTaxPlanning;

  const tier = tiers[selectedTierIdx] ?? tiers[1] ?? tiers[0];
  const isAnnual = billing === "annual";
  const suffix = isAnnual ? "/yr" : "/mo";

  // Calculate prices dynamically
  const baseMo = tier.rate;
  const empMo = employees * addonPrices.payroll;
  const recMo =
    (extraFeeds ? addonPrices.feeds : 0) +
    (ias ? addonPrices.ias : 0) +
    (jobTracking ? addonPrices.jobtrack : 0);
  const oneTime = catchUp ? addonPrices.catchup : 0;

  let planBase: number, payroll: number, addonsRecurring: number, discountAmount: number, total: number;

  if (isAnnual) {
    const totalYrFull = (baseMo + empMo + recMo) * 12;
    discountAmount = Math.round(totalYrFull * annualDiscount);
    planBase = Math.round(baseMo * 12 * (1 - annualDiscount));
    payroll = Math.round(empMo * 12 * (1 - annualDiscount));
    addonsRecurring = Math.round(recMo * 12 * (1 - annualDiscount));
    total = totalYrFull - discountAmount + oneTime;
  } else {
    planBase = baseMo;
    payroll = empMo;
    addonsRecurring = recMo;
    discountAmount = 0;
    total = baseMo + empMo + recMo + oneTime;
  }

  // Premium addon totals
  const premiumCatchUpFee = premiumCatchUp === "need_support" ? PREMIUM_CATCH_UP_FEE : 0;
  const officeFee = registeredOffice ? REGISTERED_OFFICE_FEE : 0;
  const taxPlanningFee = taxPlanning ? TAX_PLANNING_FEE : 0;
  const premiumTotal = premiumCatchUpFee + officeFee + taxPlanningFee;

  const grandTotal = total + premiumTotal;

  const hasStep1Addons = employees > 0 || extraFeeds || catchUp || ias || jobTracking;
  const hasPremiumAddons = premiumCatchUpFee > 0 || officeFee > 0 || taxPlanningFee > 0;

  // For old price display on annual
  const totalFullYr = (baseMo + empMo + recMo) * 12;

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
          <p className="text-xs text-muted-foreground">{tier.txn} transactions/mo</p>
        </div>

        {/* Always included */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">Always Included</p>
          {[
            "Monthly bookkeeping & reconciliation",
            "BAS preparation & lodgement",
            pricing.software ? `${pricing.software} subscription` : "Accounting software included",
            "ATO correspondence support",
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

          {hasStep1Addons ? (
            <>
              {employees > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{employees} employee{employees > 1 ? "s" : ""} · payroll</span>
                  <span className="font-semibold text-[hsl(var(--cta))]">${payroll.toLocaleString()}{suffix}</span>
                </div>
              )}
              {extraFeeds && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra bank / card feeds</span>
                  <span className="font-semibold text-[hsl(var(--cta))]">
                    ${isAnnual ? Math.round(addonPrices.feeds * 12 * (1 - annualDiscount)).toLocaleString() : addonPrices.feeds}{suffix}
                  </span>
                </div>
              )}
              {ias && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly IAS lodgement</span>
                  <span className="font-semibold text-[hsl(var(--cta))]">
                    ${isAnnual ? Math.round(addonPrices.ias * 12 * (1 - annualDiscount)).toLocaleString() : addonPrices.ias}{suffix}
                  </span>
                </div>
              )}
              {jobTracking && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job / project tracking</span>
                  <span className="font-semibold text-[hsl(var(--cta))]">
                    ${isAnnual ? Math.round(addonPrices.jobtrack * 12 * (1 - annualDiscount)).toLocaleString() : addonPrices.jobtrack}{suffix}
                  </span>
                </div>
              )}
              {catchUp && (
                <div className="flex justify-between">
                  <div>
                    <span className="text-muted-foreground">Catch-up bookkeeping</span>
                    <p className="text-[10px] text-muted-foreground">one-time · quoted separately</p>
                  </div>
                  <span className="font-semibold text-[hsl(var(--cta))]">from ${addonPrices.catchup}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center">No add-ons selected</p>
          )}
        </div>

        {/* Premium Add-ons */}
        {hasPremiumAddons && (
          <div className="border-t border-border pt-3 space-y-3 text-sm">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Premium Add-ons</p>
            {premiumCatchUpFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Financial Review & Clean-Up</span>
                <span className="font-semibold text-foreground">${premiumCatchUpFee.toLocaleString()}</span>
              </div>
            )}
            {officeFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registered Office</span>
                <span className="font-semibold text-foreground">${officeFee.toLocaleString()}/yr</span>
              </div>
            )}
            {taxPlanningFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Planning Session</span>
                <span className="font-semibold text-foreground">${taxPlanningFee.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Discount */}
        {isAnnual && discountAmount > 0 && (
          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--success))] font-medium">Annual discount ({Math.round(annualDiscount * 100)}%)</span>
              <span className="text-[hsl(var(--success))] font-medium">-${discountAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total due today</p>
          {isAnnual && discountAmount > 0 && pricing.enableStrikePricing && (
            <p className="text-sm text-muted-foreground/60 line-through mt-0.5">${(totalFullYr + premiumTotal).toLocaleString()}/yr</p>
          )}
          <p className="text-3xl font-bold text-foreground mt-1">${grandTotal.toLocaleString()}{suffix}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isAnnual ? `Annual · ${Math.round(annualDiscount * 100)}% discount · cancel with 30 days notice` : `Monthly · cancel with 30 days notice · no discount`}
          </p>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.15)] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-[hsl(var(--success))] shrink-0" size={16} />
              <p className="text-sm font-medium text-[hsl(var(--success))]">Registered BAS Agent</p>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Award className="text-primary shrink-0" size={16} />
              <p className="text-sm font-medium text-primary">{pricing.software || "QuickBooks"} ProAdvisor</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.15)] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-[hsl(var(--success))] shrink-0" size={16} />
              <p className="text-sm font-medium text-[hsl(var(--success))]">IPA Member</p>
            </div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Shield className="text-[hsl(var(--cta))] shrink-0" size={16} />
              <div>
                <p className="text-sm font-medium text-foreground">Secure Payments</p>
                <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
              </div>
            </div>
          </div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
