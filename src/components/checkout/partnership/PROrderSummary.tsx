import React, { useMemo } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { Check, Shield, Clock, Star, Zap, Users, Building2 } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

const GST_ADDON_PRICE = 150;
const BN_ASIC_FEES: Record<string, number> = {
  "1yr": 44,
  "3yr": 102,
};
const ADDRESS_PRICE = 250;

const WHATS_INCLUDED = [
  "ABN Registration with ATO",
  "Partnership TFN Application",
  "PAYG Withholding Setup (if required)",
  "ATO Lodgement & Processing",
  "Confirmation & Documentation",
];

export const PROrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { packages } = usePricingPackages();
  const BASE_PRICE = packages.partnership.foundation.price;
  const bnServiceFee = packages.business_name.foundation.price;

  const bnTerm = (customer.prBnTerm as string) || "1yr";
  const bnAsicFee = BN_ASIC_FEES[bnTerm] ?? 44;
  const bnPrice = useMemo(() => {
    if (!customer.prBusinessNameAddon) return 0;
    return bnServiceFee + (BN_ASIC_FEES[bnTerm] ?? 44);
  }, [customer.prBusinessNameAddon, bnTerm, bnServiceFee]);

  const { subtotal, gst, total } = useMemo(() => {
    const sub =
      BASE_PRICE +
      (customer.prGstAddon ? GST_ADDON_PRICE : 0) +
      bnPrice +
      (customer.prBusinessAddressAddon ? ADDRESS_PRICE : 0);
    const bnAsicFeeForGst = customer.prBusinessNameAddon ? (BN_ASIC_FEES[bnTerm] ?? 44) : 0;
    const g = Math.round((sub - bnAsicFeeForGst) * 0.1);
    return { subtotal: sub, gst: g, total: sub + g };
  }, [customer.prGstAddon, bnPrice, customer.prBusinessAddressAddon, bnTerm, customer.prBusinessNameAddon]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">

        {/* Line items */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--cta)/0.1)] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-[hsl(var(--cta))]" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Our service fee</span>
                <span className="font-semibold text-foreground">{formatCurrency(BASE_PRICE)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Partnership ATO Registration</p>
            </div>
          </div>


          {customer.prGstAddon && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">GST Registration</span>
                  <span className="font-semibold text-foreground">{formatCurrency(GST_ADDON_PRICE)}</span>
                </div>
                <p className="text-xs text-muted-foreground">ATO registration</p>
              </div>
            </div>
          )}

          {customer.prBusinessNameAddon && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Business Name Registration</span>
                  <span className="font-semibold text-foreground">{formatCurrency(bnPrice)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Service fee: ${bnServiceFee} + ASIC fee: ${bnAsicFee} <span className="text-[hsl(var(--success))] font-medium">(GST Free)</span>
                  {" "}({bnTerm === "3yr" ? "3 Year" : "1 Year"})
                </p>
              </div>
            </div>
          )}

          {customer.prBusinessAddressAddon && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Business Address Service</span>
                  <span className="font-semibold text-foreground">{formatCurrency(ADDRESS_PRICE)}</span>
                </div>
                <p className="text-xs text-muted-foreground">$250/year - Professional address</p>
              </div>
            </div>
          )}
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

        {/* What's included */}
        <div className="pt-3">
          <p className="text-sm font-semibold text-primary mb-2">What's Included:</p>
          <ul className="space-y-1.5">
            {WHATS_INCLUDED.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Check className="w-3.5 h-3.5 text-[hsl(142_71%_35%)] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trust badges */}
        <div className="space-y-2">
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
            <Zap className="w-5 h-5 text-[hsl(142_71%_35%)] shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Fast Processing</p>
              <p className="text-xs text-muted-foreground">Lodged within 24 hours</p>
            </div>
          </div>
          <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[hsl(142_71%_35%)] shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Registered Tax Agent</p>
              <p className="text-xs text-muted-foreground">Licensed ATO representation</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--cta)/0.08)] rounded-lg px-4 py-3 flex items-center gap-3">
            <Users className="w-5 h-5 text-[hsl(var(--cta))] shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Expert Support</p>
              <p className="text-xs text-muted-foreground">Partnership specialists available</p>
            </div>
          </div>
        </div>


        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
