import React, { useState } from "react";
import { Check, Shield, Clock, Tag, CheckCircle } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../../shared/TPBBadge";
import { NeedHelpCall } from "../../shared/NeedHelpCall";

const GST_RATE = 0.1;

const WHATS_INCLUDED = [
  "State incorporation application (VIC/NSW)",
  "ACNC-compliant constitution",
  "ABN & TFN registration",
  "ACNC charity registration",
  "Committee setup & governance documents",
  "Ongoing compliance support (12 months)",
];

export const IAOrderSummary: React.FC = () => {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { packages } = usePricingPackages();
  const IA_PRICE = packages.charity_ia.foundation.price;

  const subtotal = IA_PRICE;
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + gst;

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode.trim().toUpperCase());
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Line items */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <div className="flex-1">
              <span className="text-foreground">Incorporated Association Setup</span>
              <p className="text-xs text-muted-foreground">Complete registration package</p>
            </div>
            <span className="font-medium text-foreground whitespace-nowrap">${IA_PRICE.toLocaleString()}</span>
          </div>
        </div>

        {/* What's Included */}
        {/* <div className="bg-[hsl(var(--cta)/0.05)] rounded-xl p-4 border border-[hsl(var(--cta)/0.15)]">
          <p className="font-semibold text-[hsl(var(--cta))] mb-3 text-sm">What's Included:</p>
          <ul className="space-y-2">
            {WHATS_INCLUDED.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle size={14} className="text-[hsl(var(--success))] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div> */}

        {/* Promo code */}
        <div className="pt-4 border-t border-border">
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{appliedPromo}</span>
              </div>
              <button
                onClick={() => {
                  setAppliedPromo(null);
                  setPromoCode("");
                }}
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
              <p className="text-xs text-muted-foreground mt-1.5">Enter promotional code if you have one</p>
            </>
          )}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">${gst.toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-baseline">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-2xl font-bold text-[hsl(var(--cta))]">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Trust badges - ABN style */}
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
              <p className="text-xs text-[hsl(142_71%_45%)]">5-6 business days</p>
            </div>
          </div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
