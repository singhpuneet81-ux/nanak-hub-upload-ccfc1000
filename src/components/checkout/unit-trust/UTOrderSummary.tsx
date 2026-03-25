import React from "react";
import { Shield, Zap, Users, Award } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

interface UTOrderSummaryProps {
  showAccountingDetails?: boolean;
}

export const UTOrderSummary: React.FC<UTOrderSummaryProps> = ({
  showAccountingDetails = false,
}) => {
  const { selections, customer } = useCheckout();
  const { packages, serviceMeta } = usePricingPackages();

  const baseSetupFee = packages.unit_trust.foundation.price;
  const ASIC_FEE = 611;

  // Add-ons
  const businessNameEnabled = customer?.businessNameAddon === true;
  const businessNameTerm = customer?.businessNameTerm || "1_year";
  const bnServiceFee = packages.business_name.foundation.price;
  const businessNameServiceFee = businessNameEnabled ? bnServiceFee : 0;
  const businessNameAsicFee = businessNameEnabled ? (businessNameTerm === "3_years" ? 104 : 47) : 0;
  const businessNameTotal = businessNameServiceFee + businessNameAsicFee;

  const gstEnabled = customer?.gstAddon === true;
  const gstFee = gstEnabled ? packages.gst.foundation.price : 0;

  const registeredOfficeEnabled = customer?.registeredOfficeAddon === true;
  const registeredOfficeFee = registeredOfficeEnabled ? 220 : 0;

  // Accounting from API tierPricing
  const hasAccounting = selections.package === "registration_plus_accounting";
  const billingFrequency = customer?.billingFrequency || "annual";
  const revenueBracket = customer?.revenueBracket || "";
  const selectedPlanId = customer?.accountingPlan || "";

  const packagePlans = (serviceMeta?.unit_trust as any)?.packagePlans;
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

  // Payroll
  const payrollEnabled = customer?.payrollEnabled === true;
  const staffCount = customer?.staffCount || 0;
  const payrollFee = payrollEnabled ? staffCount * 120 : 0;

  // State-based stamp duty (GST-free)
  const STATE_STAMP_DUTY: Record<string, { fee: number; label: string }> = {
    VIC: { fee: 200, label: "Victoria" },
    NSW: { fee: 750, label: "New South Wales" },
    NT: { fee: 20, label: "Northern Territory" },
  };
  const stampDutyEntry = STATE_STAMP_DUTY[customer?.trustState || ""];
  const stampDutyFee = stampDutyEntry?.fee || 0;

  // Totals
  const subtotal = baseSetupFee + ASIC_FEE + businessNameTotal + gstFee + registeredOfficeFee + accountingFee + payrollFee + stampDutyFee;
  const taxableAmount = subtotal - ASIC_FEE - businessNameAsicFee - stampDutyFee;
  const gst = Math.round(taxableAmount * 0.1);
  const total = subtotal + gst;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-4">
      <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground mb-2">Unit Trust Setup</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Our service fee</span>
            <span className="font-medium text-foreground">${baseSetupFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ASIC fee <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span></span>
            <span className="font-medium text-foreground">${ASIC_FEE}</span>
          </div>

          {/* Add-ons */}
          {(businessNameEnabled || gstEnabled || registeredOfficeEnabled) && (
            <>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">ADD-ONS</p>
              </div>
              {businessNameEnabled && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-foreground">Business Name Registration</p>
                    <p className="text-xs text-muted-foreground">Service fee: ${businessNameServiceFee}</p>
                    <p className="text-xs text-muted-foreground">
                      ASIC fee ({businessNameTerm === "3_years" ? "3-year" : "1-year"}): ${businessNameAsicFee} <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span>
                    </p>
                  </div>
                  <span className="font-medium">${businessNameTotal}</span>
                </div>
              )}
              {gstEnabled && (
                <div className="flex justify-between">
                  <p className="text-foreground">GST Registration</p>
                  <span className="font-medium">${gstFee}</span>
                </div>
              )}
              {registeredOfficeEnabled && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-foreground">Registered Office Address</p>
                    <p className="text-xs text-muted-foreground">Annual service</p>
                  </div>
                  <span className="font-medium">${registeredOfficeFee}</span>
                </div>
              )}
            </>
          )}

          {/* State stamp duty */}
          {stampDutyFee > 0 && (
            <div className="flex justify-between pt-2">
              <div>
                <p className="text-foreground">Stamp Duty</p>
                <p className="text-xs text-muted-foreground">{stampDutyEntry!.label} — GST free</p>
              </div>
              <span className="font-medium">${stampDutyFee}</span>
            </div>
          )}

          {/* Accounting from API */}
          {hasAccounting && accountingFee > 0 && (
            <div className="flex justify-between pt-2 border-t border-border">
              <div>
                <p className="text-foreground">Accounting Services{planName ? ` — ${planName}` : ""}</p>
                {bracketLabel && <p className="text-xs text-muted-foreground">{bracketLabel}</p>}
                <p className="text-xs text-muted-foreground">Billed {billingFrequency}</p>
                {payrollEnabled && staffCount > 0 && (
                  <p className="text-xs text-muted-foreground">+ Payroll for {staffCount} staff</p>
                )}
              </div>
              <span className="font-medium">${(accountingFee + payrollFee).toLocaleString()}</span>
            </div>
          )}

          {/* Annual savings */}
          {annualSavings > 0 && (
            <div className="flex items-center gap-2 p-2 bg-[hsl(var(--success)/0.1)] rounded-lg border border-[hsl(var(--success)/0.2)]">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--success))] flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--success))]">Annual Billing Savings</p>
                <p className="text-xs font-semibold text-[hsl(var(--success))]">${annualSavings.toLocaleString()} saved</p>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="pt-3 mt-3 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (10%)</span>
              <span>${gst.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2">
              <span>Total</span>
              <span className="text-[hsl(var(--cta))]">${total.toLocaleString()}.00</span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary">100% Satisfaction Guarantee</p>
              <p className="text-xs text-primary/80">If you're not satisfied with our service, we'll refund your money. No questions asked.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">Fast Processing</p>
              <p className="text-xs text-primary/80">Setup completed in 2-3 Business days</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">Expert Support</p>
              <p className="text-xs text-primary/80">Dedicated trust specialists</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <Award className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">Trusted Service</p>
              <p className="text-xs text-primary/80">500+ unit trusts established</p>
            </div>
          </div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
