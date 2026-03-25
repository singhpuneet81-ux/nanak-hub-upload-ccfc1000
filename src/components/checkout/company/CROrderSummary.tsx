import React, { useMemo } from "react";
import { Shield, Zap, Users, Award, Star, CheckCircle } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

const ASIC_FEE = 611;

const PAYROLL_PRICE_PER_STAFF = 20;

const BN_ASIC_FEES: Record<string, number> = {
  "1yr": 44,
  "3yr": 102,
};

export const CROrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { packages, serviceMeta } = usePricingPackages();
  const SERVICE_FEE = packages.company.foundation.price;
  const bnServiceFee = packages.business_name.foundation.price;
  const BASE_TOTAL = SERVICE_FEE + ASIC_FEE;

  // Extract API packagePlans for tier pricing
  const companyMeta = serviceMeta?.company as { packagePlans?: { revenueBrackets?: { id: string; label: string }[]; plans?: { id: string; tierPricing: Record<string, { standard: number; bundle: number }> }[] } } | undefined;
  const apiPackagePlans = companyMeta?.packagePlans;

  // Add-ons
  const bnEnabled = !!customer.crAddonBusinessName;
  const bnTerm = (customer.crBusinessNameTerm as string) || "1yr";
  const bnAsicFee = BN_ASIC_FEES[bnTerm] ?? 44;
  const bnPrice = bnEnabled ? (bnServiceFee + bnAsicFee) : 0;
  const gstEnabled = !!customer.crAddonGST;
  const gstPrice = gstEnabled ? 49 : 0;
  const officeEnabled = !!customer.crAddonRegisteredOffice;
  const officePrice = officeEnabled ? 220 : 0;

  // Package
  const crPackage = (customer.crPackage as string) || "";
  const turnover = (customer.crTurnover as string) || "";
  const billingCycle = (customer.crBillingCycle as "monthly" | "annual") || "monthly";
  const defaultApiPlanId = apiPackagePlans?.plans?.[0]?.id ?? "";
  const packageLevel = (customer.crPackageLevel as string) || defaultApiPlanId;
  const payrollEnabled = !!customer.crPayrollEnabled;
  const staffCount = (customer.crStaffCount as number) || 1;

  // Accounting - use API tier pricing only
  const { accountingDisplay, turnoverLabel } = useMemo(() => {
    let display = 0;
    let label = turnover;

    if (crPackage === "registration_plus_accounting" && turnover) {
      if (apiPackagePlans?.plans?.length) {
        const plan = apiPackagePlans.plans.find(p => p.id === packageLevel);
        if (plan?.tierPricing?.[turnover]) {
          const tp = plan.tierPricing[turnover];
          display = billingCycle === "annual" ? tp.bundle : tp.standard;
        }
        const bracket = apiPackagePlans.revenueBrackets?.find(b => b.id === turnover);
        if (bracket) label = bracket.label;
      }
    }

    return { accountingDisplay: display, turnoverLabel: label };
  }, [crPackage, turnover, billingCycle, packageLevel, apiPackagePlans]);

  const hasAccounting = crPackage === "registration_plus_accounting" && turnover;

  // Payroll
  const payrollFee = payrollEnabled ? staffCount * PAYROLL_PRICE_PER_STAFF : 0;

  // Totals
  const subtotal = BASE_TOTAL + bnPrice + gstPrice + officePrice + (hasAccounting ? accountingDisplay : 0) + payrollFee;
  const taxableAmount = subtotal - ASIC_FEE;
  const gst = Math.round(taxableAmount * 0.1);
  const total = subtotal + gst;

  const hasAddons = bnPrice > 0 || gstPrice > 0 || officePrice > 0;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-2xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-6 space-y-4">

      <div className="space-y-3 text-sm">
        {/* Base Company Registration */}
        <p className="font-medium text-foreground mb-2">Company Registration</p>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Our service fee</span>
          <span className="font-medium text-foreground">${SERVICE_FEE}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ASIC fee <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span></span>
          <span className="font-medium text-foreground">${ASIC_FEE}</span>
        </div>

        {/* Add-ons */}
        {hasAddons && (
          <>
            <p className="text-xs text-muted-foreground uppercase tracking-wide pt-2">ADD-ONS</p>

            {bnPrice > 0 && (
              <div className="flex justify-between">
                <div>
                  <p className="text-foreground">Business Name Registration</p>
                  <p className="text-xs text-muted-foreground">
                    Service fee: ${bnServiceFee}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ASIC fee ({bnTerm === "3yr" ? "3-year" : "1-year"}): ${bnAsicFee} <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span>
                  </p>
                </div>
                <span className="font-medium text-foreground">${bnPrice}</span>
              </div>
            )}

            {gstPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-foreground">GST Registration</span>
                <span className="font-medium text-foreground">${gstPrice}</span>
              </div>
            )}

            {officePrice > 0 && (
              <div className="flex justify-between">
                <div>
                  <p className="text-foreground">Registered Office Address</p>
                  <p className="text-xs text-muted-foreground">Annual service</p>
                </div>
                <span className="font-medium text-foreground">${officePrice}</span>
              </div>
            )}
          </>
        )}

        {/* Accounting */}
        {hasAccounting && (
          <div className="flex justify-between pt-2">
            <div>
              <p className="text-foreground">Accounting Services</p>
              <p className="text-xs text-muted-foreground">
                {turnoverLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                Billed {billingCycle}
              </p>
              {payrollFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  + Payroll for {staffCount} staff
                </p>
              )}
            </div>
            <span className="font-medium text-foreground">
              ${(accountingDisplay + payrollFee).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">${subtotal.toLocaleString()}.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (10%)</span>
          <span className="font-medium text-foreground">${gst.toLocaleString()}.00</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-border mt-4 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-foreground font-medium">Total</span>
          <span className="text-2xl font-bold text-[hsl(var(--cta))]">
            ${total.toLocaleString()}.{(total % 1 === 0) ? "00" : (total * 100 % 100).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Trust markers */}
      <div className="mt-5 space-y-2">
        <div className="bg-[hsl(var(--success)/0.1)] rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Shield className="text-[hsl(var(--success))] shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--success))]">100% Satisfaction Guarantee</p>
              <p className="text-xs text-[hsl(var(--success)/0.8)]">If you're not satisfied with our service, we'll refund your money. No questions asked.</p>
            </div>
          </div>
        </div>
        <div className="bg-[hsl(var(--success)/0.1)] rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Zap className="text-[hsl(var(--success))]" size={16} />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--success))]">Fast Processing</p>
              <p className="text-xs text-[hsl(var(--success)/0.8)]">Setup completed in 2-3 business days</p>
            </div>
          </div>
        </div>
        <div className="bg-[hsl(var(--success)/0.1)] rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Users className="text-[hsl(var(--success))]" size={16} />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--success))]">Expert Support</p>
              <p className="text-xs text-[hsl(var(--success)/0.8)]">Dedicated ASIC specialists</p>
            </div>
          </div>
        </div>
        <div className="bg-[hsl(var(--success)/0.1)] rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Award className="text-[hsl(var(--success))]" size={16} />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--success))]">Trusted Service</p>
              <p className="text-xs text-[hsl(var(--success)/0.8)]">5,000+ companies registered</p>
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
