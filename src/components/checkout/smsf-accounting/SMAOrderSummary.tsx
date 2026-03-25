import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, Shield, Clock, Tag } from "lucide-react";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { TPBBadge } from "../shared/TPBBadge";
import { useSMSFPricing } from "@/hooks/useSMSFPricing";

export const SMAOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { cfg } = useSMSFPricing();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const BASE = cfg.baseAnnual;
  const DISC = cfg.annualDiscount || 0.2;
  const RES_PRICE = cfg.propertyRates.residential;
  const COM_PRICE = cfg.propertyRates.commercial;
  const EXTRA_MEMBER_FEE = cfg.extraMemberFee;
  const PENSION_FEE = cfg.pensionFee;

  const billing = (customer.smaBilling as string) || "annual";
  const isAnnual = billing === "annual";
  const residentialCount = (customer.smaResidentialCount as number) || 0;
  const commercialCount = (customer.smaCommercialCount as number) || 0;
  const investmentAddons = (customer.smaInvestmentAddons as string[]) || [];
  const memberCount = (customer.smaMemberCount as number) || 2;
  const hasPension = !!customer.smaPension;
  const taxPlanning = !!customer.smaTaxPlanning;
  const catchUp = (customer.smaCatchUp as string) || "up_to_date";

  // Calculate add-on lines
  const lines: { lbl: string; val: number; isAddOn?: boolean }[] = [];
  if (residentialCount > 0) lines.push({ lbl: `${residentialCount} residential propert${residentialCount > 1 ? "ies" : "y"}`, val: residentialCount * RES_PRICE, isAddOn: true });
  if (commercialCount > 0) lines.push({ lbl: `${commercialCount} commercial propert${commercialCount > 1 ? "ies" : "y"}`, val: commercialCount * COM_PRICE, isAddOn: true });
  investmentAddons.forEach((id) => {
    const addon = cfg.investmentAddons.find((a) => a.id === id);
    if (addon) lines.push({ lbl: addon.label, val: addon.price, isAddOn: true });
  });
  const extraMem = Math.max(0, memberCount - 2);
  if (extraMem > 0) lines.push({ lbl: `${extraMem} extra member${extraMem > 1 ? "s" : ""}`, val: extraMem * EXTRA_MEMBER_FEE, isAddOn: true });
  if (hasPension) lines.push({ lbl: "Pension phase", val: PENSION_FEE, isAddOn: true });

  const addonTotal = lines.reduce((s, l) => s + l.val, 0);
  const fullYearly = BASE + addonTotal;
  const totalAfterDisc = isAnnual ? Math.round(fullYearly * (1 - DISC)) : fullYearly;
  const saving = fullYearly - totalAfterDisc;

  // One-time fees
  const catchUpFee = catchUp === "need_support" ? cfg.catchUpFee : 0;
  const strategyFee = taxPlanning ? cfg.strategySessionFee : 0;

  const displayTotal = isAnnual ? totalAfterDisc : Math.round(fullYearly / 12);
  const subtotal = displayTotal + catchUpFee + strategyFee;
  const gst = Math.round(subtotal * 0.1);
  const total = subtotal + gst;

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode.trim().toUpperCase());
    }
  };

  const formatCurrency = (v: number) => `$${v.toLocaleString()}`;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Line items */}
        <div className="space-y-3 text-sm">
          {/* Base package */}
          <div className="flex justify-between">
            <div className="flex-1">
              <span className="text-foreground">SMSF Annual Compliance</span>
              <p className="text-xs text-muted-foreground">{isAnnual ? "Annual billing · 20% off" : "Monthly billing"}</p>
            </div>
            <span className="font-medium text-foreground whitespace-nowrap">
              {formatCurrency(isAnnual ? Math.round(BASE * (1 - DISC)) : BASE)}
            </span>
          </div>

          {/* Add-on lines */}
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between">
              <div className="flex-1">
                <span className="text-foreground">
                  {l.lbl}
                  <span className="text-primary ml-1 text-xs">(Add-on)</span>
                </span>
              </div>
              <span className="font-medium text-foreground whitespace-nowrap">
                {formatCurrency(l.val)}
              </span>
            </div>
          ))}

          {/* One-time fees */}
          {catchUpFee > 0 && (
            <div className="flex justify-between">
              <div className="flex-1">
                <span className="text-foreground">Catch-up pack</span>
                <p className="text-xs text-muted-foreground">One-time fee</p>
              </div>
              <span className="font-medium text-foreground whitespace-nowrap">
                {formatCurrency(catchUpFee)}
              </span>
            </div>
          )}
          {strategyFee > 0 && (
            <div className="flex justify-between">
              <div className="flex-1">
                <span className="text-foreground">Strategy session</span>
                <p className="text-xs text-muted-foreground">One-time fee</p>
              </div>
              <span className="font-medium text-foreground whitespace-nowrap">
                {formatCurrency(strategyFee)}
              </span>
            </div>
          )}

          {lines.length === 0 && catchUpFee === 0 && strategyFee === 0 && (
            <p className="text-xs text-muted-foreground italic py-2">
              Add services to see them here
            </p>
          )}
        </div>

        {/* Promo code */}
        <div className="mt-4 pt-4 border-t border-border">
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{appliedPromo}</span>
              </div>
              <button
                onClick={() => { setAppliedPromo(null); setPromoCode(""); }}
                className="text-xs text-green-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                />
                <button
                  onClick={handleApplyPromo}
                  className="h-10 px-4 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Apply
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Enter promotional code if you have one
              </p>
            </>
          )}
        </div>

        {/* Annual Savings */}
        {isAnnual && saving > 0 && (
          <div className="mt-4 bg-[hsl(142_76%_94%)] rounded-lg px-4 py-2.5 flex justify-between items-center">
            <span className="text-sm font-medium text-[hsl(142_71%_35%)]">Annual Savings</span>
            <span className="text-sm font-semibold text-[hsl(142_71%_35%)]">-{formatCurrency(saving)}</span>
          </div>
        )}

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">{formatCurrency(gst)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between items-baseline">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-2xl font-bold text-[hsl(var(--cta))]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

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
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Fast Processing</p>
              <p className="text-xs text-[hsl(142_71%_45%)]">24-48 hours</p>
            </div>
          </div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
