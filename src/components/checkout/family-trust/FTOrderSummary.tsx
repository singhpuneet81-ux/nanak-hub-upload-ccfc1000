import React, { useMemo } from "react";
import { Shield, Zap, Users, Award, CheckCircle } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

export const FTOrderSummary: React.FC = () => {
  const { customer, selections, pricing } = useCheckout();
  const { packages, serviceMeta } = usePricingPackages();

  if (!pricing) return null;

  const FT_BASE_PRICE = packages.family_trust.foundation.price;
  const ASIC_FEE = 611;

  const STATE_STAMP_DUTY: Record<string, number> = { VIC: 200, NSW: 750, NT: 20 };
  const stampDutyState = (customer.appointorState as string) || "";
  const stampDutyFee = STATE_STAMP_DUTY[stampDutyState] || 0;

  // Use packages API for addon prices (same as ReviewPay)
  const selectedAddons: string[] = customer.selectedAddons || [];
  const hasBN = selectedAddons.includes("business_name") || !!customer.businessNameAddon;
  const bnTerm = (customer.businessNameTerm || "1yr") as string;
  const bnServiceFee = packages.business_name.foundation.price;
  const businessNameTotal = hasBN ? bnServiceFee + (bnTerm === "3_years" || bnTerm === "3yr" ? 102 : 44) : 0;

  const hasGst = selectedAddons.includes("gst") || !!customer.gstAddon;
  const gstFee = hasGst ? packages.gst.foundation.price : 0;

  const hasOffice = selectedAddons.includes("registered_office") || !!customer.registeredOfficeAddon;
  const registeredOfficeFee = hasOffice ? 220 : 0;

  const payrollFee = customer.payrollEnabled ? ((selections.staffCount || 1) * 165) : 0;

  // Accounting from API tierPricing
  const hasAccounting = selections.package === "registration_plus_accounting";
  const billingFrequency = selections.billingFrequency || "annual";
  const revenueBracket = selections.revenueBracket || "";
  const selectedPlanId = (selections.accountingPlan as string) || "";

  const packagePlans = (serviceMeta?.family_trust as any)?.packagePlans;
  const apiPlan = packagePlans?.plans?.find((p: any) => p.id === selectedPlanId);
  const tierPrice = apiPlan?.tierPricing?.[revenueBracket];

  const accountingFee = hasAccounting && tierPrice
    ? (billingFrequency === "annual" ? tierPrice.bundle : tierPrice.standard)
    : 0;

  const annualSavings = hasAccounting && tierPrice && billingFrequency === "annual"
    ? tierPrice.standard - tierPrice.bundle
    : 0;

  const bracketLabel = packagePlans?.revenueBrackets?.find((b: any) => b.id === revenueBracket)?.label || revenueBracket;
  const planName = apiPlan?.name || "";

  // Calculate totals - exclude ASIC_FEE and stampDuty from GST (same as ReviewPay)
  const subtotal = FT_BASE_PRICE + ASIC_FEE + businessNameTotal + gstFee + registeredOfficeFee + accountingFee + payrollFee + stampDutyFee;
  const adjustedGst = Math.round((subtotal - ASIC_FEE - stampDutyFee) * 0.1);
  const total = subtotal + adjustedGst;

  const stampDutyLabel =
    stampDutyState === "VIC" ? "Victoria"
    : stampDutyState === "NSW" ? "New South Wales"
    : stampDutyState === "NT" ? "Northern Territory"
    : "";

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-2xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground mb-2">Family Trust Setup</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Our service fee</span>
            <span className="font-medium text-foreground">${baseFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ASIC fee <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span>
            </span>
            <span className="font-medium text-foreground">${ASIC_FEE}</span>
          </div>

          {/* Add-ons */}
          {(businessNameTotal > 0 || gstFee > 0 || registeredOfficeFee > 0) && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-wide pt-2">Add-ons</p>
              {businessNameTotal > 0 && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-foreground">Business Name Registration</p>
                    <p className="text-xs text-muted-foreground">Includes ASIC registration fee</p>
                  </div>
                  <span className="font-medium text-foreground">${businessNameTotal.toLocaleString()}</span>
                </div>
              )}
              {gstFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-foreground">GST Registration</span>
                  <span className="font-medium text-foreground">${gstFee}</span>
                </div>
              )}
              {registeredOfficeFee > 0 && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-foreground">Registered Office Address</p>
                    <p className="text-xs text-muted-foreground">Annual service</p>
                  </div>
                  <span className="font-medium text-foreground">${registeredOfficeFee}</span>
                </div>
              )}
            </>
          )}

          {/* Stamp duty */}
          {stampDutyFee > 0 && (
            <div className="flex justify-between pt-2">
              <div>
                <p className="text-foreground">Stamp Duty</p>
                <p className="text-xs text-muted-foreground">{stampDutyLabel} — GST free</p>
              </div>
              <span className="font-medium text-foreground">${stampDutyFee}</span>
            </div>
          )}

          {/* Accounting from API */}
          {hasAccounting && accountingFee > 0 && (
            <div className="flex justify-between pt-2">
              <div>
                <p className="text-foreground">Accounting Services{planName ? ` — ${planName}` : ""}</p>
                {bracketLabel && <p className="text-xs text-muted-foreground">{bracketLabel}</p>}
                <p className="text-xs text-muted-foreground">Billed {billingFrequency}</p>
                {payrollFee > 0 && <p className="text-xs text-muted-foreground">Includes payroll services</p>}
              </div>
              <span className="font-medium text-foreground">${(accountingFee + payrollFee).toLocaleString()}</span>
            </div>
          )}

          {/* Annual savings */}
          {annualSavings > 0 && (
            <div className="bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.3)] rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 text-[hsl(var(--success))]">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Annual Billing Savings</span>
              </div>
              <p className="text-[hsl(var(--success))] font-semibold mt-1">${annualSavings.toLocaleString()} saved</p>
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
            <span className="font-medium text-foreground">${adjustedGst.toLocaleString()}.00</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-border mt-4 pt-4">
          <div className="flex justify-between items-baseline">
            <span className="text-foreground font-medium">Total</span>
            <span className="text-2xl font-bold text-[hsl(var(--cta))]">${total.toLocaleString()}.00</span>
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
                <p className="text-xs text-[hsl(var(--success)/0.8)]">Setup completed in 1-2 Business days</p>
              </div>
            </div>
          </div>
          <div className="bg-[hsl(var(--success)/0.1)] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="text-[hsl(var(--success))]" size={16} />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--success))]">Expert Support</p>
                <p className="text-xs text-[hsl(var(--success)/0.8)]">Dedicated trust specialists</p>
              </div>
            </div>
          </div>
          <div className="bg-[hsl(var(--success)/0.1)] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Award className="text-[hsl(var(--success))]" size={16} />
              <div>
                <p className="text-sm font-medium text-[hsl(var(--success))]">Trusted Service</p>
                <p className="text-xs text-[hsl(var(--success)/0.8)]">1,000+ trusts established</p>
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
