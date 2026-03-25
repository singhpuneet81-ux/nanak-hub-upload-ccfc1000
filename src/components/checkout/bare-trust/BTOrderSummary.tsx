import React from "react";
import { formatCurrency } from "@/config/pricing.config";
import { Check, Shield, Clock, Star, CircleAlert, Users } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

const WHATS_INCLUDED = [
  "Professional Bare Trust Deed",
  "LRBA compliance documentation",
  "Trustee setup & appointments",
  "Settlement coordination",
  "E-signing service",
  "Certified copies for lender",
];

const ASIC_FEE = 611;

export const BTOrderSummary: React.FC = () => {
  const { packages } = usePricingPackages();
  const BT_BASE_PRICE = packages.bare_trust.foundation.price;
  const serviceFee = BT_BASE_PRICE;
  const gstableAmount = serviceFee;
  const gst = Math.round(gstableAmount / 11);
  const subtotal = serviceFee + ASIC_FEE;
  const total = subtotal + gst;

  return (
    <div className="bg-card rounded-xl border border-border sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Line items */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Our service fee</span>
            <span className="font-semibold text-foreground">{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">ASIC fee</span>
              <span className="text-xs font-medium text-[hsl(142_71%_35%)]">(GST Free)</span>
            </div>
            <span className="font-semibold text-foreground">{formatCurrency(ASIC_FEE)}</span>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">{formatCurrency(gst)}</span>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-2xl font-bold text-[hsl(var(--cta))]">{formatCurrency(total)}</span>
          </div>
        </div>


        {/* Money-back guarantee */}
        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3">
          <div className="flex items-start gap-2">
            <CircleAlert className="w-4 h-4 text-[hsl(142_71%_35%)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[hsl(142_71%_35%)]">100% Money-Back Guarantee</p>
              <p className="text-xs text-[hsl(142_71%_45%)]">
                If you're not satisfied with our service, we'll refund your money. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="space-y-2">
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Fast Processing</p>
              <p className="text-xs text-[hsl(142_71%_45%)]">Setup completed in 2-3 days</p>
            </div>
          </div>
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Expert Support</p>
              <p className="text-xs text-[hsl(142_71%_45%)]">SMSF specialists available</p>
            </div>
          </div>
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Trusted Service</p>
              <p className="text-xs text-[hsl(142_71%_45%)]">500+ trusts established</p>
            </div>
          </div>
        </div>


        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
