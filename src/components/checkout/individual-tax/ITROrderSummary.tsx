import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, Calendar, ShieldCheck } from "lucide-react";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { TPBBadge } from "../shared/TPBBadge";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { calcIncomeStreamsTotal } from "./ITRIncomeStreams";

const PLAN_DETAILS: Record<string, { label: string; features: string[] }> = {
  essential: {
    label: "Essential Package",
    features: [
      "PAYG Income Assessment",
      "Standard Deductions",
      "Medicare Levy Calculation",
      "e-Tax Lodgement",
      "Tax Return Review",
    ],
  },
  premium: {
    label: "Premium Package",
    features: [
      "All Essential features",
      "ATO Correspondence Support",
      "Priority Processing (24-48hr)",
      "Dedicated Tax Specialist",
      "Tax Planning Advice",
    ],
  },
};

export const ITROrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { packages } = usePricingPackages();
  const apiBasePrice = packages.individual_tax_return.foundation.price;

  const PLAN_PRICES: Record<string, number> = {
    essential: apiBasePrice,
    premium: Math.round(apiBasePrice * 1.5),
  };

  const plan = customer.itrPlan || "premium";
  const returnCount = (customer.itrReturnCount as number) || 1;
  const details = PLAN_DETAILS[plan] || PLAN_DETAILS.premium;
  const unitPrice = PLAN_PRICES[plan] || PLAN_PRICES.premium;
  const basePrice = unitPrice * returnCount;

  const abnPrice = customer.itrAbnPrice || 0;
  const basTotal = customer.itrBasTotal || 0;
  const strategicTaxPrice = customer.strategicTaxPlanning ? 150 : 0;
  const streamsTotal = calcIncomeStreamsTotal(customer);
  const totalPrice = basePrice + abnPrice + basTotal + strategicTaxPrice + streamsTotal;
  const gst = Math.round(totalPrice / 11);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      {/* Blue Header */}
      <div className="bg-primary px-5 py-4 rounded-t-2xl">
        <h2 className="text-lg font-bold text-primary-foreground">Order Summary</h2>
      </div>

      <div className="px-5 pb-5 space-y-4 pt-4">
        {/* Service Period */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Service Period: FY 2024–2025</span>
        </div>

        {/* Package & Price */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-foreground">{details.label}</p>
            <p className="text-xs text-muted-foreground">
              {returnCount > 1
                ? `${returnCount} × $${unitPrice} per return`
                : "Individual Tax Return"}
            </p>
          </div>
          <span className="font-bold text-foreground">${basePrice}</span>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {details.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
              <span className="text-foreground">{f}</span>
            </li>
          ))}
        </ul>

        {/* ABN Add-on line items */}
        {abnPrice > 0 && (
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ABN Income (Sole Trader)</span>
              <span className="font-medium text-foreground">${abnPrice}</span>
            </div>
            {basTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">BAS Lodgement ({customer.itrAbnBasCount}×$50)</span>
                <span className="font-medium text-foreground">${basTotal}</span>
              </div>
            )}
          </div>
        )}

        {/* Income Streams line items */}
        {streamsTotal > 0 && (
          <div className="border-t border-border pt-3 space-y-2">
            {((customer.itrRentalProperties as number) || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rental Properties ({customer.itrRentalProperties}×$50)</span>
                <span className="font-medium text-foreground">${(customer.itrRentalProperties as number) * 50}</span>
              </div>
            )}
            {customer.itrCrypto && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Crypto Capital Gains</span>
                <span className="font-medium text-foreground">$75</span>
              </div>
            )}
            {((customer.itrShares as number) || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shares & Investments ({customer.itrShares}×$10)</span>
                <span className="font-medium text-foreground">${(customer.itrShares as number) * 10}</span>
              </div>
            )}
            {customer.itrCgtProperty && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGT Property Sale</span>
                <span className="font-medium text-foreground">$199</span>
              </div>
            )}
            {customer.itrCfds && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CFDs</span>
                <span className="font-medium text-foreground">$100</span>
              </div>
            )}
            {customer.itrForeignIncome && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Foreign Income / Overseas Assets</span>
                <span className="font-medium text-foreground">$100</span>
              </div>
            )}
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${totalPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Incl. GST (10%)</span>
            <span className="font-medium text-foreground">${gst}</span>
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Total Due Today</p>
          <p className="text-3xl font-bold text-foreground">${totalPrice}</p>
          <p className="text-xs text-muted-foreground mt-1">One-time payment • GST inclusive</p>
        </div>

        {/* Trust Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2.5">
            <ShieldCheck className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Registered Tax Agent</p>
              <p className="text-xs text-[hsl(var(--cta))]">26019887</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2.5">
            <ShieldCheck className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">IPA Member</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2.5">
            <ShieldCheck className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Secure Payments</p>
              <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
            </div>
          </div>
        </div>

        <NeedHelpCall />

        {/* TPB Badge */}
        <TPBBadge />
      </div>
    </div>
  );
};
