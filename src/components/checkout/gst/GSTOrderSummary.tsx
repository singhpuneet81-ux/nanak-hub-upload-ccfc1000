import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { Check, Shield, Clock, Tag } from "lucide-react";
import {
  ADDON_PRICES,
  BUSINESS_NAME_TERMS,
  BusinessNameTerm,
  getBusinessNamePrice,
} from "../abn/pricing";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

// Line item type for order summary
interface LineItem {
  name: string;
  price: number;
  isAddOn?: boolean;
  subText?: string;
}

export const GSTOrderSummary: React.FC = () => {
  const { selections, customer } = useCheckout();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { packages } = usePricingPackages();
  const gstBasePrice = packages.gst.foundation.price;
  const isAccountingPackage = selections.package === "registration_plus_accounting";

  /* -----------------------------
   Build line items (single source)
  ------------------------------ */
  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [];

    // Base GST Registration — dynamic from API
    items.push({ name: "GST Registration", price: gstBasePrice });

    // If Registration + Accounting package selected, add accounting fee
    if (isAccountingPackage) {
      items.push({
        name: "Complete Package (Annual Compliance)",
        price: 4109,
        subText: "Registration + Accounting services",
      });
    }

    // Add-ons from customer selections
    const addons: string[] = customer.selectedAddons || [];
    if (addons.includes("business_name")) {
      const term = (customer.businessNameTerm || "1yr") as BusinessNameTerm;
      const price = getBusinessNamePrice(term);
      items.push({
        name: `Business Name Registration (${BUSINESS_NAME_TERMS[term].label})`,
        price,
        isAddOn: true,
      });
    }
    if (addons.includes("registered_office")) {
      items.push({
        name: "Registered Office Address",
        price: ADDON_PRICES.registered_office,
        isAddOn: true,
      });
    }

    return items;
  }, [customer, gstBasePrice, isAccountingPackage]);

  /* -----------------------------
   Totals calculation
  ------------------------------ */
  const { subtotal, gst, total } = useMemo(() => {
    const sub = lineItems.reduce((sum, item) => sum + item.price, 0);
    // ASIC fees are GST-free - exclude BN ASIC fee from taxable amount
    const bnAddon = (customer?.selectedAddons || []).includes("business_name");
    const bnTerm = (customer?.businessNameTerm || "1yr") as string;
    const bnAsicFee = bnAddon ? (bnTerm === "3yr" ? 102 : 44) : 0;
    const gstAmount = Math.round((sub - bnAsicFee) * 0.1);
    return {
      subtotal: sub,
      gst: gstAmount,
      total: sub + gstAmount,
    };
  }, [lineItems]);

  /* -----------------------------
   Promo (UI only for now)
  ------------------------------ */
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
        {lineItems.map((item, index) => (
          <div key={index} className="flex justify-between">
            <div className="flex-1">
              <span className="text-foreground">
                {item.name}
                {item.isAddOn && (
                  <span className="text-primary ml-1 text-xs">(Add-on)</span>
                )}
              </span>
              {item.subText && (
                <p className="text-xs text-muted-foreground">
                  {item.subText}
                </p>
              )}
            </div>
            <span className="font-medium text-foreground whitespace-nowrap">
              {formatCurrency(item.price)}
            </span>
          </div>
        ))}

        {lineItems.length === 1 && (
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
              <span className="text-sm font-medium text-green-700">
                {appliedPromo}
              </span>
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
            <p className="text-xs text-muted-foreground mt-1.5">
              Enter promotional code if you have one
            </p>
          </>
        )}
      </div>


      {/* Totals */}
      <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (10%)</span>
          <span className="font-medium text-foreground">
            {formatCurrency(gst)}
          </span>
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
        <TrustItem
          title="100% Money-Back Guarantee"
          subtitle="Risk-free service"
          icon={<Check className="w-3.5 h-3.5 text-white" />}
        />
        <TrustItem
          title="Secure Payment"
          subtitle="256-bit SSL encryption"
          icon={<Shield className="w-3.5 h-3.5 text-white" />}
        />
        <TrustItem
          title="Fast Processing"
          subtitle="1–2 business days"
          icon={<Clock className="w-3.5 h-3.5 text-white" />}
        />
      </div>

      <NeedHelpCall />
      <TPBBadge />
      </div>
    </div>
  );
};

/* -----------------------------
 Small helper
------------------------------ */
const TrustItem = ({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
    <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-[hsl(142_71%_35%)]">{title}</p>
      <p className="text-xs text-[hsl(142_71%_45%)]">{subtitle}</p>
    </div>
  </div>
);
