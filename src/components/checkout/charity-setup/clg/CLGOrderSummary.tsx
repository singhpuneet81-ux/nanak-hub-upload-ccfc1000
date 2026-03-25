import React from "react";
import { Shield, Zap, Users } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../../shared/TPBBadge";
import { NeedHelpCall } from "../../shared/NeedHelpCall";

const GST_RATE = 0.1;
const ASIC_FEE = 503;


export const CLGOrderSummary: React.FC = () => {
  const { packages } = usePricingPackages();
  const CLG_PRICE = packages.charity_clg.foundation.price;

  const serviceFee = CLG_PRICE;
  const subtotal = serviceFee + ASIC_FEE;
  const gst = Math.round(serviceFee * GST_RATE * 100) / 100;
  const total = subtotal + gst;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-2xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-6 space-y-4">

      {/* Base fee - Family Trust style */}
      <div className="space-y-3 text-sm">
        <p className="font-medium text-foreground mb-2">Company Limited by Guarantee</p>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Our service fee</span>
          <span className="font-medium text-foreground">${serviceFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ASIC fee <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span></span>
          <span className="font-medium text-foreground">${ASIC_FEE}</span>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">${subtotal.toLocaleString()}.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (10%)</span>
          <span className="font-medium text-foreground">${gst.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-border mt-4 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-foreground font-medium">Total</span>
          <span className="text-2xl font-bold text-[hsl(var(--cta))]">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>


      {/* Trust markers */}
      <div className="space-y-2">
        <div className="bg-[hsl(var(--success)/0.08)] rounded-xl p-3 border border-[hsl(var(--success)/0.15)]">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[hsl(var(--success))]" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--success))]">100% Satisfaction Guarantee</p>
              <p className="text-xs text-[hsl(var(--success))]">If you're not satisfied with our service, we'll refund your money. No questions asked.</p>
            </div>
          </div>
        </div>

        <div className="bg-[hsl(var(--success)/0.08)] rounded-xl p-3 border border-[hsl(var(--success)/0.15)]">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[hsl(var(--success))]" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--success))]">Fast Processing</p>
              <p className="text-xs text-[hsl(var(--success))]">Setup completed in 3-5 days</p>
            </div>
          </div>
        </div>

        <div className="bg-[hsl(var(--success)/0.08)] rounded-xl p-3 border border-[hsl(var(--success)/0.15)]">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[hsl(var(--success))]" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--success))]">Expert Support</p>
              <p className="text-xs text-[hsl(var(--success))]">ASIC & ACNC specialists</p>
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
