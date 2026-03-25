import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, Shield, Clock, Tag } from "lucide-react";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const REVENUE_PRICES: Record<string, { essential: number; pro: number }> = {
  "up-to-100k": { essential: 2990, pro: 4490 },
  "100k-250k": { essential: 3490, pro: 4990 },
  "250k-500k": { essential: 3990, pro: 5490 },
  "500k-1m": { essential: 4490, pro: 5990 },
  "1m-2m": { essential: 5490, pro: 6990 },
  "2m-5m": { essential: 6990, pro: 8990 },
};

export const ASICOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { packages } = usePricingPackages();
  const ASIC_BASE = packages.asic_agent.foundation.price;
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const pkg = (customer.asicPackage as string) || "asic_only";
  const revenue = (customer.asicRevenue as string) || "";
  const billing = (customer.asicBilling as "monthly" | "annual") || "monthly";
  const packageLevel = (customer.asicPackageLevel as string) || "essential";
  const officeEnabled = !!customer.asicAddonOffice;
  const payrollEnabled = !!customer.asicPayroll;
  const staffCount = (customer.asicStaffCount as number) || 1;

  const { lineItems, subtotal, gst, total } = useMemo(() => {
    const items: { name: string; price: number; subText?: string; isAddOn?: boolean }[] = [];

    // ASIC base fee
    items.push({ name: "ASIC Agent Service", price: ASIC_BASE });

    // Registered Office
    if (officeEnabled) {
      items.push({ name: "Registered Office", price: 300, isAddOn: true });
    }

    // Accounting
    let accountingFee = 0;
    if (pkg === "bundle_accounting" && revenue && REVENUE_PRICES[revenue]) {
      const prices = REVENUE_PRICES[revenue];
      const annualPrice = packageLevel === "pro" ? prices.pro : prices.essential;
      accountingFee = billing === "annual" ? annualPrice : Math.round(annualPrice / 10);
      const label = packageLevel === "pro" ? "Pro" : "Essential";
      const billingLabel = billing === "annual" ? "/yr" : "/mo";
      items.push({
        name: `${label} Accounting`,
        price: accountingFee,
        subText: `${billing === "annual" ? "Annual" : "Monthly"} billing`,
        isAddOn: true,
      });
    }

    // Payroll
    const payrollFee = payrollEnabled ? staffCount * 20 : 0;
    if (payrollFee > 0) {
      items.push({
        name: "Payroll Services",
        price: payrollFee,
        subText: `${staffCount} employee${staffCount > 1 ? "s" : ""}`,
        isAddOn: true,
      });
    }

    const sub = items.reduce((sum, item) => sum + item.price, 0);
    // ASIC base fee is GST-free
    const taxableAmount = sub - ASIC_BASE;
    const gstAmount = Math.round(taxableAmount * 0.1);
    const totalAmount = sub + gstAmount;

    return { lineItems: items, subtotal: sub, gst: gstAmount, total: totalAmount };
  }, [pkg, revenue, billing, packageLevel, officeEnabled, payrollEnabled, staffCount]);

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
                  <p className="text-xs text-muted-foreground">{item.subText}</p>
                )}
              </div>
              <span className="font-medium text-foreground whitespace-nowrap">
                ${item.price.toLocaleString()}
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
            <div className="flex items-center justify-between bg-[hsl(var(--savings-background))] border border-[hsl(var(--success)/0.3)] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-sm font-medium text-[hsl(var(--success))]">{appliedPromo}</span>
              </div>
              <button
                onClick={() => { setAppliedPromo(null); setPromoCode(""); }}
                className="text-xs text-[hsl(var(--success))] hover:underline"
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
            <span className="font-medium text-foreground">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">${gst.toLocaleString()}</span>
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between items-baseline">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-2xl font-bold text-[hsl(var(--cta))]">
              ${total.toLocaleString()}
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
              <p className="text-xs text-[hsl(142_71%_45%)]">2-3 business days</p>
            </div>
          </div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
