import React, { useState, useMemo } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { getTermById } from "@/config/terms.config";
import { getPricing, getAnnualSavings, getPlanById } from "@/config/plans.config";
import { PAYROLL_PRICE_PER_STAFF } from "@/config/payroll.config";
import { Check, Shield, Award, Tag, TrendingUp } from "lucide-react";
import { ADDON_PRICES } from "../abn/pricing";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";


export const BNOrderSummary: React.FC = () => {
  const { selections, customer, currentStep, serviceFee } = useCheckout();
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  // Calculate all fees dynamically
  const { asicFee, accountingFee, payrollFee, annualSavings, subtotal, gst, total, asicLabel, accountingLabel, payrollLabel } = useMemo(() => {
    // ASIC Fee based on registration term
    const term = getTermById(selections.registrationTerm);
    const asicFeeAmount = term?.asicFee ?? 44;
    const asicLbl = term?.id === "3_year" ? "ASIC Fee (3 Years)" : "ASIC Fee (1 Year)";

    // Accounting fee
    let accountingFeeAmount = 0;
    let accountingLbl = "";
    if (selections.package === "registration_plus_accounting" && selections.revenueBracket && selections.accountingPlan && selections.billingFrequency) {
      accountingFeeAmount = getPricing(selections.revenueBracket, selections.accountingPlan, selections.billingFrequency);
      const plan = getPlanById(selections.accountingPlan);
      const freqLabel = selections.billingFrequency === "annual" ? "annual" : "monthly";
      accountingLbl = `Accounting - ${plan?.name || "Pro"} (${freqLabel})`;
    }

    // Payroll fee
    let payrollFeeAmount = 0;
    let payrollLbl = "";
    if (selections.payrollEnabled && selections.staffCount > 0) {
      payrollFeeAmount = selections.staffCount * PAYROLL_PRICE_PER_STAFF;
      payrollLbl = `Payroll (${selections.staffCount} staff)`;
    }

    // Add-on fees (GST & Registered Office)
let addonFee = 0;

if (customer?.selectedAddons?.includes("gst")) {
  addonFee += ADDON_PRICES.gst;
}

if (customer?.selectedAddons?.includes("registered_office")) {
  addonFee += ADDON_PRICES.registered_office;
}

    // Annual savings
    let savings = 0;
    if (selections.package === "registration_plus_accounting" && selections.billingFrequency === "annual" && selections.revenueBracket && selections.accountingPlan) {
      savings = getAnnualSavings(selections.revenueBracket, selections.accountingPlan);
    }

    // Subtotal (ex GST) - ASIC fees are GST-free, so we need to calculate properly
    // const taxableAmount = serviceFee + accountingFeeAmount + payrollFeeAmount;
    // const subtotalExGst = serviceFee + asicFeeAmount + accountingFeeAmount + payrollFeeAmount;
    const taxableAmount =
    serviceFee + accountingFeeAmount + payrollFeeAmount + addonFee;
    const gstAmount = Math.round(taxableAmount * 0.1);
    
    const subtotalExGst =
    serviceFee + asicFeeAmount + accountingFeeAmount + payrollFeeAmount + addonFee;
    const totalIncGst = subtotalExGst + gstAmount;

    return {
      asicFee: asicFeeAmount,
      accountingFee: accountingFeeAmount,
      payrollFee: payrollFeeAmount,
      annualSavings: savings,
      subtotal: subtotalExGst,
      gst: gstAmount,
      total: totalIncGst,
      asicLabel: asicLbl,
      accountingLabel: accountingLbl,
      payrollLabel: payrollLbl,
    };
  }, [serviceFee, selections]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">

      {/* Line items */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service Fee</span>
          <span className="font-medium text-foreground">{formatCurrency(serviceFee)}</span>
        </div>

        {asicFee > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{asicLabel} <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span></span>
          <span className="font-medium text-foreground">{formatCurrency(asicFee)}</span>
        </div>
        )}
{customer?.selectedAddons?.includes("gst") && (
  <div className="flex justify-between">
    <span className="text-muted-foreground">GST Registration</span>
    <span className="font-medium text-foreground">
      {formatCurrency(ADDON_PRICES.gst)}
    </span>
  </div>
)}

{customer?.selectedAddons?.includes("registered_office") && (
  <div className="flex justify-between">
    <span className="text-muted-foreground">Registered Office Address</span>
    <span className="font-medium text-foreground">
      {formatCurrency(ADDON_PRICES.registered_office)}
    </span>
  </div>
)}

        {accountingFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{accountingLabel}</span>
            <span className="font-medium text-foreground">{formatCurrency(accountingFee)}</span>
          </div>
        )}

        {payrollFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{payrollLabel}</span>
            <span className="font-medium text-foreground">{formatCurrency(payrollFee)}</span>
          </div>
        )}
      </div>

      {/* Annual Savings */}
      {annualSavings > 0 && (
        <div className="mt-4 bg-[hsl(142_76%_94%)] rounded-lg px-4 py-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(142_71%_35%)]" />
            <span className="text-sm font-medium text-[hsl(142_71%_35%)]">Annual Savings</span>
          </div>
          <span className="text-sm font-semibold text-[hsl(142_71%_35%)]">-{formatCurrency(annualSavings)}</span>
        </div>
      )}

      {/* Totals */}
      <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal (ex GST)</span>
          <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (10%)</span>
          <span className="font-medium text-foreground">{formatCurrency(gst)}</span>
        </div>
        <p className="text-xs text-muted-foreground italic">* ASIC government fees are GST-free</p>
      </div>

      {/* Promo code */}
      <div className="mt-4 pt-4 border-t border-border">
        {showPromoInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
            />
            <button className="h-9 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Apply
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPromoInput(true)}
            className="flex items-center gap-2 text-primary text-sm font-medium hover:underline"
          >
            <Tag className="w-4 h-4" />
            Have a discount code?
          </button>
        )}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-baseline">
          <span className="text-foreground font-semibold">Total (inc GST)</span>
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <NeedHelpCall />

      {/* Trust badges */}
      <div className="mt-5 space-y-2.5">
        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(142_71%_35%)]">100% Money-Back Guarantee</p>
            <p className="text-xs text-[hsl(142_71%_45%)]">Risk-free service</p>
          </div>
        </div>

        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Secure Payment</p>
            <p className="text-xs text-[hsl(142_71%_45%)]">256-bit SSL encryption</p>
          </div>
        </div>

        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(142_71%_35%)]">ASIC Registered Agents</p>
            <p className="text-xs text-[hsl(142_71%_45%)]">5,000+ businesses registered</p>
          </div>
        </div>
      </div>

      <TPBBadge />
      </div>
    </div>
  );
};
