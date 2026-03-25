import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { getTermById } from "@/config/terms.config";
import { getPlanById } from "@/config/plans.config";
import { HelpCircle, Shield, BadgeCheck, Users, Tag } from "lucide-react";
import { TPBBadge } from "./shared/TPBBadge";
import { NeedHelpCall } from "./shared/NeedHelpCall";

export const SummarySidebar: React.FC = () => {
  const {
    serviceFee,
    asicFee,
    accountingFee,
    payrollFee,
    annualSavings,
    totals,
    selections,
  } = useCheckout();

  const term = getTermById(selections.registrationTerm);
  const plan = getPlanById(selections.accountingPlan);

  return (
    <div className="summary-card sticky top-6 overflow-hidden">
      <div className="bg-primary text-primary-foreground px-5 py-4 -mx-0 -mt-0 rounded-t-xl mb-5">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>
      <div className="p-6 pt-0">

      {/* Line items */}
      <div className="space-y-3 text-sm">
        {/* Service Fee */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service Fee</span>
          <span className="font-medium text-foreground">{formatCurrency(serviceFee)}</span>
        </div>

        {/* ASIC Fee - only show when greater than 0 */}
        {asicFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ASIC Fee ({term?.label.replace(" Registration", "") || "3 Year"}) <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span>
            </span>
            <span className="font-medium text-foreground">{formatCurrency(asicFee)}</span>
          </div>
        )}

        {/* Accounting Plan */}
        {accountingFee > 0 && plan && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Accounting - {plan.name} ({selections.billingFrequency})
            </span>
            <span className="font-medium text-foreground">{formatCurrency(accountingFee)}</span>
          </div>
        )}

        {/* Payroll */}
        {payrollFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Payroll ({selections.staffCount} staff)
            </span>
            <span className="font-medium text-foreground">{formatCurrency(payrollFee)}</span>
          </div>
        )}

        {/* Annual Savings */}
        {annualSavings > 0 && (
          <div className="savings-strip mt-4">
            <span>↗</span>
            <span>Annual Savings</span>
            <span className="ml-auto font-semibold">-{formatCurrency(annualSavings)}</span>
          </div>
        )}
      </div>

      {/* Subtotal and GST */}
      <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal (ex GST)</span>
          <span className="font-medium text-foreground">{formatCurrency(totals.subtotalExGst)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (10%)</span>
          <span className="font-medium text-foreground">{formatCurrency(totals.gst)}</span>
        </div>
        <p className="text-xs text-muted-foreground italic">
          * ASIC government fees are GST-free
        </p>
      </div>

      {/* Discount code */}
      <div className="border-t border-border mt-4 pt-4">
        <button className="discount-link">
          <Tag size={14} />
          Have a discount code?
        </button>
      </div>

      {/* Total */}
      <div className="border-t border-border mt-4 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-foreground font-medium">Total (inc GST)</span>
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(totals.totalIncGst)}
          </span>
        </div>
      </div>

      <NeedHelpCall />

      {/* Trust markers - matching screenshot icons */}
      <div className="mt-5 space-y-2.5">
        <div className="trust-marker">
          <Shield className="text-[hsl(var(--success))] shrink-0" size={16} />
          <span>Secure checkout</span>
        </div>
        <div className="trust-marker">
          <BadgeCheck className="text-primary shrink-0" size={16} />
          <span>ASIC registered agents</span>
        </div>
        <div className="trust-marker">
          <Users className="text-[hsl(var(--cta))] shrink-0" size={16} />
          <span>5,000+ businesses registered</span>
        </div>
      </div>

      <NeedHelpCall />
      <TPBBadge />
      </div>
    </div>
  );
};

export const SummaryMobile: React.FC = () => {
  const { totals } = useCheckout();

  return (
    <div className="checkout-mobile-summary lg:hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <p className="text-sm text-muted-foreground">Total (inc GST)</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totals.totalIncGst)}
          </p>
        </div>
        <button className="btn-help px-4 w-auto">
          <HelpCircle size={16} />
          Help
        </button>
      </div>
    </div>
  );
};
