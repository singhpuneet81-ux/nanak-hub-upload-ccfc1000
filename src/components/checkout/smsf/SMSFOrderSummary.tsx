import React, { useMemo } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { Check, Shield, Clock, Star, CircleAlert } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

const ASIC_FEE = 611;

const WHATS_INCLUDED = [
  "SMSF Trust Deed preparation",
  "Corporate Trustee registration (ASIC)",
  "ABN & TFN application (ATO)",
  "SMSF registration with ATO",
  "Member & trustee resolutions",
  "Compliance guides & checklists",
];

export const SMSFOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { packages } = usePricingPackages();
  const SMSF_BASE_PRICE = packages.smsf.foundation.price;
  const BARE_TRUST_BUNDLE_PRICE = 1500;
  const bareTrustSelected = customer.smsfBareTrust || false;

  const serviceFee = SMSF_BASE_PRICE;

  const { subtotal, gst, total } = useMemo(() => {
    const gstableAmount = serviceFee + (bareTrustSelected ? BARE_TRUST_BUNDLE_PRICE : 0);
    const g = Math.round(gstableAmount / 11);
    return { subtotal: gstableAmount + ASIC_FEE, gst: g, total: gstableAmount + ASIC_FEE + g };
  }, [bareTrustSelected, serviceFee]);

  return (
    <div className="bg-card rounded-xl border border-border sticky top-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-t-xl px-6 py-5">
        <h2 className="text-xl font-semibold">Order Summary</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Line items */}
        <div className="space-y-4 text-[15px]">
          <div className="flex justify-between">
            <span className="font-medium text-foreground">Our service fee</span>
            <span className="font-semibold text-foreground">{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">ASIC fee</span>
              <span className="text-sm font-medium text-[hsl(142_71%_35%)]">(GST Free)</span>
            </div>
            <span className="font-semibold text-foreground">{formatCurrency(ASIC_FEE)}</span>
          </div>

          {bareTrustSelected && (
            <div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Bare Trust / Holding Trust</span>
                <div className="text-right">
                  <span className="text-muted-foreground line-through text-sm mr-1">$2,000</span>
                  <span className="font-semibold text-foreground">{formatCurrency(BARE_TRUST_BUNDLE_PRICE)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">For LRBA property purchases</p>
              <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Save $500</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-4 space-y-3 text-[15px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">{formatCurrency(gst)}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-baseline">
            <span className="text-base text-foreground font-semibold">Total</span>
            <span className="text-3xl font-bold text-[hsl(var(--cta))]">{formatCurrency(total)}</span>
          </div>
        </div>


        {/* Money-back guarantee */}
        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3.5">
          <div className="flex items-start gap-3">
            <CircleAlert className="w-5 h-5 text-[hsl(142_71%_35%)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[15px] font-medium text-[hsl(142_71%_35%)]">100% Money-Back Guarantee</p>
              <p className="text-sm text-[hsl(142_71%_45%)]">
                If you're not satisfied with our service, we'll refund your money. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="space-y-2.5">
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-[hsl(142_71%_35%)]">Fast Processing</p>
              <p className="text-sm text-[hsl(142_71%_45%)]">Setup completed in 5-6 business days</p>
            </div>
          </div>
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-[hsl(142_71%_35%)]">Expert Support</p>
              <p className="text-sm text-[hsl(142_71%_45%)]">Dedicated SMSF specialists</p>
            </div>
          </div>
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-[hsl(142_71%_35%)]">Trusted Service</p>
              <p className="text-sm text-[hsl(142_71%_45%)]">500+ SMSFs established</p>
            </div>
          </div>
        </div>


        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
