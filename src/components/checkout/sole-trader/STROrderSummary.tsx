import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, ShieldCheck, Lock, Clock } from "lucide-react";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { useSoleTraderPricing } from "@/hooks/useSoleTraderPricing";

export const STROrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { cfg } = useSoleTraderPricing();

  const plan = customer.strPlan || "premium";
  const dynamicPrice = plan === "essential" ? customer.strEssentialPrice : customer.strPremiumPrice;
  const price = dynamicPrice || 149;
  const gst = Math.round(price / 11);

  /* Collect selected income stream labels for itemised display */
  const streams: { label: string; amount: number }[] = [];
  const incomeStreams = (customer.incomeStreams as string[]) || [];
  const rentalCount = (customer.rentalCount as number) || 0;
  const sharesCount = (customer.sharesCount as number) || 0;

  cfg.incomeStreams.forEach((s) => {
    const isActive = s.id === "rental" ? rentalCount > 0 : s.id === "shares" ? sharesCount > 0 : incomeStreams.includes(s.id);
    if (!isActive) return;
    let amt = s.basePrice;
    if (s.id === "abn" && customer.abnGstRegistered) amt += cfg.abnGstSurcharge;
    if (s.id === "rental") amt = s.basePrice * rentalCount;
    if (s.id === "shares") amt = s.basePrice * sharesCount;
    let label = s.label;
    if (s.id === "rental" && rentalCount > 1) label += ` (×${rentalCount})`;
    if (s.id === "shares") label += ` (${sharesCount} sold)`;
    streams.push({ label, amount: amt });
  });

  if (incomeStreams.includes("abn") && (customer.abnBasCount as number) > 0) {
    const basCount = customer.abnBasCount as number;
    streams.push({ label: `BAS Lodgement (×${basCount})`, amount: basCount * cfg.basPrice });
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      {/* Header */}
      <div className="bg-primary px-5 py-4 rounded-t-2xl">
        <h2 className="text-lg font-bold text-primary-foreground">Order Summary</h2>
      </div>

      <div className="px-5 pb-5 pt-4 space-y-4">
        {/* Line items */}
        {streams.length > 0 ? (
          <div className="space-y-2.5">
            {streams.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="font-semibold text-foreground">${item.amount}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Tax Return Service</span>
            <span className="font-semibold text-foreground">${price}</span>
          </div>
        )}

        <p className="text-xs text-[hsl(var(--cta))] italic cursor-pointer hover:underline">
          Add services to see them here
        </p>

        {/* Promo code */}
        <div className="border-t border-border pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Apply
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">Enter promotional code if you have one</p>
        </div>

        {/* Subtotal / GST */}
        <div className="border-t border-border pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">${gst}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-2xl font-extrabold text-[hsl(var(--cta))]">${price}</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-3 bg-[hsl(var(--success)/0.07)] border border-[hsl(var(--success)/0.15)] rounded-xl px-4 py-3">
            <ShieldCheck className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--success))]">100% Money-Back Guarantee</p>
              <p className="text-xs text-muted-foreground">Risk-free service</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[hsl(var(--success)/0.07)] border border-[hsl(var(--success)/0.15)] rounded-xl px-4 py-3">
            <Lock className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--success))]">Secure Payment</p>
              <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[hsl(var(--success)/0.07)] border border-[hsl(var(--success)/0.15)] rounded-xl px-4 py-3">
            <Clock className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--success))]">Fast Processing</p>
              <p className="text-xs text-muted-foreground">24-48 hours</p>
            </div>
          </div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
