import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { User, Building2, Home, Bitcoin, TrendingUp, Sparkles, Lock } from "lucide-react";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { cn } from "@/lib/utils";

const STREAM_META: Record<string, { label: string; icon: React.ElementType; iconBg: string }> = {
  tfn: { label: "Individual Tax Return", icon: User, iconBg: "bg-primary" },
  abn: { label: "Sole Trader", icon: Building2, iconBg: "bg-[hsl(var(--cta))] disabled:opacity-50" },
  rental: { label: "Rental Property Income", icon: Home, iconBg: "bg-[hsl(var(--success))]" },
  shares: { label: "Shares & Investments", icon: TrendingUp, iconBg: "bg-[hsl(210,80%,55%)]" },
  crypto: { label: "Cryptocurrency", icon: Bitcoin, iconBg: "bg-[hsl(280,60%,55%)]" },
};

const STREAM_PRICES: Record<string, number> = {
  tfn: 120, abn: 40, rental: 50, shares: 199, crypto: 249,
};

const WHAT_HAPPENS_NEXT = [
  { title: "Accountant Assignment", desc: "One accountant for all income streams" },
  { title: "Data Collection", desc: "ATO prefill + document upload for all streams" },
  { title: "Cross-Optimization", desc: "Maximize deductions across all income types" },
  { title: "Review & Sign", desc: "Review all drafts and sign online" },
  { title: "Lodge to ATO", desc: "All returns lodged + confirmations sent" },
];

export const BDLOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const streams: string[] = customer.bdlStreams || [];
  const subtotal = customer.bdlSubtotal || 0;
  const discountPercent = customer.bdlDiscountPercent || 0;
  const discountAmount = customer.bdlDiscountAmount || 0;
  const total = customer.bdlTotal || 0;
  const gst = customer.bdlGst || Math.round(total / 11);
  const rentalCount = customer.bdlRentalCount || 0;

  return (
    <div className="summary-card sticky top-6 overflow-hidden">
      <div className="bg-primary text-primary-foreground px-5 py-4 -mx-0 -mt-0 rounded-t-xl mb-5">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {streams.map((id) => {
          const meta = STREAM_META[id];
          if (!meta) return null;
          const Icon = meta.icon;
          const price = id === "rental" ? STREAM_PRICES[id] * rentalCount : STREAM_PRICES[id];
          return (
            <div key={id} className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0", meta.iconBg)}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">
                {meta.label}{id === "rental" && rentalCount > 1 ? ` (×${rentalCount})` : ""}
              </span>
              <span className="text-sm font-semibold text-foreground">${price}</span>
            </div>
          );
        })}

        <div className="border-t border-border pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${subtotal}</span>
          </div>

          {discountPercent > 0 && (
            <div className="flex justify-between items-center bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] rounded-lg px-3 py-2">
              <span className="flex items-center gap-1.5 text-[hsl(var(--success))] font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                Bundle Discount ({discountPercent}%)
              </span>
              <span className="font-bold text-[hsl(var(--cta))]">-${discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">${gst}</span>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-2xl font-bold text-foreground">${total}</span>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="border-t border-border pt-4">
          <h3 className="font-bold text-foreground mb-3">What Happens Next</h3>
          <div className="space-y-3">
            {WHAT_HAPPENS_NEXT.map((item, i) => (
              <div key={i} className="checkout-nav flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--success))] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4 text-[hsl(var(--success))]" />
          <span>Secure SSL Encrypted Payment</span>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
