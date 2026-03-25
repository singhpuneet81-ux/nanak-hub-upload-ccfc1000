import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowRight, Info, Zap, Users, PlusCircle, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookkeepingPricing } from "@/hooks/useBookkeepingPricing";
import { BK_TIERS } from "@/components/checkout/bookkeeping/bkPricing";

/** Revenue-based pricing brackets — rates per tier per month */
const REVENUE_BRACKETS = [
  { label: "Up to $75,000",     txns: ["UP TO 50 TXNS/MO", "UP TO 150 TXNS/MO", "UP TO 300 TXNS/MO"], rates: [120, 220, 380] },
  { label: "Up to $250,000",    txns: ["UP TO 50 TXNS/MO", "UP TO 150 TXNS/MO", "UP TO 300 TXNS/MO"], rates: [150, 280, 480] },
  { label: "Up to $500,000",    txns: ["UP TO 50 TXNS/MO", "UP TO 150 TXNS/MO", "UP TO 300 TXNS/MO"], rates: [200, 360, 580] },
  { label: "Up to $1,250,000",  txns: ["UP TO 75 TXNS/MO", "UP TO 200 TXNS/MO", "UP TO 400 TXNS/MO"], rates: [260, 460, 720] },
  { label: "Up to $2,000,000",  txns: ["UP TO 75 TXNS/MO", "UP TO 200 TXNS/MO", "UP TO 400 TXNS/MO"], rates: [320, 560, 860] },
  { label: "Up to $3,500,000",  txns: ["UP TO 100 TXNS/MO", "UP TO 250 TXNS/MO", "UP TO 500 TXNS/MO"], rates: [400, 680, 1020] },
  { label: "Up to $5,000,000",  txns: ["UP TO 100 TXNS/MO", "UP TO 250 TXNS/MO", "UP TO 500 TXNS/MO"], rates: [480, 800, 1200] },
  { label: "Up to $10,000,000", txns: ["UP TO 150 TXNS/MO", "UP TO 350 TXNS/MO", "UP TO 700 TXNS/MO"], rates: [600, 1000, 1500] },
];

interface Props {
  onNext: () => void;
}

export const BKStepPackage: React.FC<Props> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();
  const { pricing, annualDiscount } = useBookkeepingPricing();

  const addonPrices = pricing.addonPrices;

  const selectedTierIdx = (customer.bkTierIdx as number) ?? 1;
  const billing = (customer.bkBilling as "monthly" | "annual") || "annual";
  const isAnnual = billing === "annual";
  const employees = (customer.bkEmployees as number) || 0;
  const extraFeeds = !!customer.bkExtraFeeds;
  const catchUp = !!customer.bkCatchUp;
  const ias = !!customer.bkIas;
  const jobTracking = !!customer.bkJobTracking;

  const revenueIdx = (customer.bkRevenueIdx as number) ?? 2; // default "Up to $500,000"
  const bracket = REVENUE_BRACKETS[revenueIdx] ?? REVENUE_BRACKETS[2];

  // Build dynamic tiers from revenue bracket
  const tiers = pricing.tiers.map((t, idx) => ({
    ...t,
    rate: bracket.rates[idx] ?? t.rate,
  }));

  const tier = tiers[selectedTierIdx] ?? tiers[1] ?? tiers[0];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Bookkeeping Services</h2>
        <p className="text-muted-foreground mt-1">
          Simple, transparent pricing based on your business size.{pricing.software ? ` ${pricing.software} included.` : ""} BAS preparation always included.
        </p>
      </div>

      {/* ── Billing Toggle + Revenue Forecast ── */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 shrink-0">
          <div className="inline-flex items-center gap-1 bg-primary/10 border-2 border-primary/20 rounded-full p-1.5">
            <button
              onClick={() => updateCustomer({ bkBilling: "monthly" })}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                billing === "monthly" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => updateCustomer({ bkBilling: "annual" })}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5",
                billing === "annual" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                billing === "annual" ? "bg-white/20 text-white" : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
              )}>
                SAVE {Math.round(annualDiscount * 100)}%
              </span>
            </button>
          </div>
        </div>

        {/* Revenue Forecast Dropdown */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-[11px] font-medium text-muted-foreground">Annual revenue forecast</label>
          <select
            value={revenueIdx}
            onChange={(e) => updateCustomer({ bkRevenueIdx: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-muted/50 text-sm text-foreground outline-none cursor-pointer focus:border-[hsl(var(--cta))] transition-colors"
          >
            {REVENUE_BRACKETS.map((b, i) => (
              <option key={i} value={i}>{b.label}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-muted-foreground shrink-0">
          Annual = <strong className="text-foreground">${Math.round(tier.rate * (1 - annualDiscount))}/mo</strong> equiv.
        </span>
      </div>

      {/* ── Tier Cards (3 cards with features inside) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.slice(0, 3).map((t, idx) => {
          const isSelected = selectedTierIdx === idx;
          const displayPrice = isAnnual ? Math.round(t.rate * 12 * (1 - annualDiscount)) : t.rate;
          const suffix = isAnnual ? "/yr" : "/mo";
          const altPrice = isAnnual ? `or $${t.rate}/mo` : `$${Math.round(t.rate * 12 * (1 - annualDiscount)).toLocaleString()}/yr`;
          const isPopular = t.badge?.toLowerCase() === "popular";
          const staticTier = BK_TIERS[idx];

          return (
            <div
              key={idx}
              onClick={() => updateCustomer({ bkTierIdx: idx, bkTier: t.name })}
              className={cn(
                "relative rounded-2xl border-2 cursor-pointer transition-all overflow-hidden",
                isSelected ? "border-[hsl(var(--cta))] bg-card" : "border-border hover:border-primary/40 bg-card"
              )}
            >
              {isPopular && (
                <div className="bg-[hsl(var(--cta))] text-white text-[10px] font-bold text-center py-1.5 tracking-wider uppercase disabled:opacity-50">
                  <Zap className="inline w-3 h-3 mr-1" />MOST POPULAR
                </div>
              )}

              <div className={cn("p-5", isPopular && "pt-3")}>
                <div className="absolute top-4 right-4" style={isPopular ? { top: "2.5rem" } : {}}>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isSelected ? "border-[hsl(var(--cta))]" : "border-muted-foreground/40")}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--cta))] disabled:opacity-50" />}
                  </div>
                </div>

                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{bracket.txns[idx] || staticTier?.txnLabel || `UP TO ${t.txn} TXNS/MO`}</p>
                <h3 className="text-lg font-bold text-foreground mb-0.5">{t.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{staticTier?.subtitle || ""}</p>
                <p className="text-3xl font-bold text-foreground">
                  <span className="text-base align-top">$</span>{displayPrice.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{suffix}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{altPrice}</p>
              </div>

              {staticTier && staticTier.features.length > 0 && (
                <>
                  <div className="h-px bg-border mx-4" />
                  <div className="px-5 py-4 space-y-1.5">
                    {staticTier.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <div className={cn(
                          "w-[7px] h-[7px] rounded-full mt-1.5 shrink-0",
                          idx === 0 ? "bg-[hsl(var(--success))]" : (fi === 0 ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--cta))] disabled:opacity-50")
                        )} />
                        <span className="text-[11px] text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Transaction explainer ── */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Info size={14} className="text-primary" />
          <p className="text-xs font-semibold text-primary">What counts as a transaction?</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Each bank deposit, withdrawal, invoice, bill, or expense receipt = 1 transaction. Not sure? Most small businesses have 50–150/mo. We'll confirm your volume in your first call and adjust if needed.
        </p>
      </div>

      {/* ── Payroll Section ── */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Users size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Payroll</h3>
            <p className="text-sm text-muted-foreground">STP lodgement, super, leave & PAYG withholding — per employee</p>
          </div>
        </div>
        <div className="border-t border-border px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground text-sm">Number of Employees</p>
            <p className="text-xs text-muted-foreground">Includes STP, super processing, leave tracking & payslips</p>
          </div>
          <div className="flex items-center gap-3">
            {employees > 0 && (
              <span className="text-sm font-semibold text-[hsl(var(--cta))]">${employees * addonPrices.payroll}/mo</span>
            )}
            <button
              onClick={() => updateCustomer({ bkEmployees: Math.max(0, employees - 1) })}
              disabled={employees <= 0}
              className="w-8 h-8 rounded-full bg-[hsl(var(--cta))] text-white flex items-center justify-center disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold text-foreground min-w-[24px] text-center">{employees}</span>
            <button
              onClick={() => updateCustomer({ bkEmployees: employees + 1 })}
              className="w-8 h-8 rounded-full bg-[hsl(var(--cta))] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Optional Add-ons ── */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <PlusCircle size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Optional Add-ons</h3>
            <p className="text-sm text-muted-foreground">Select anything extra your business needs</p>
          </div>
        </div>

        <div className="border-t border-border divide-y divide-border">
          <div onClick={() => updateCustomer({ bkExtraFeeds: !extraFeeds })} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox checked={extraFeeds} onCheckedChange={(c) => updateCustomer({ bkExtraFeeds: !!c })} onClick={(e) => e.stopPropagation()} />
              <div>
                <p className="font-medium text-foreground text-sm">Extra Bank / Card Feeds</p>
                <p className="text-xs text-muted-foreground">Additional bank accounts, credit cards or payment platforms (e.g. Stripe, PayPal)</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-semibold text-foreground text-sm">+${addonPrices.feeds}/mo</p>
              <p className="text-[10px] text-muted-foreground">per extra feed</p>
            </div>
          </div>

          <div onClick={() => updateCustomer({ bkCatchUp: !catchUp })} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox checked={catchUp} onCheckedChange={(c) => updateCustomer({ bkCatchUp: !!c })} onClick={(e) => e.stopPropagation()} />
              <div>
                <p className="font-medium text-foreground text-sm">Catch-Up Bookkeeping</p>
                <p className="text-xs text-muted-foreground">Books behind? We'll get you up to date before starting ongoing work</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-semibold text-foreground text-sm">from ${addonPrices.catchup}</p>
              <p className="text-[10px] text-muted-foreground">one-time, quoted</p>
            </div>
          </div>

          <div onClick={() => updateCustomer({ bkIas: !ias })} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox checked={ias} onCheckedChange={(c) => updateCustomer({ bkIas: !!c })} onClick={(e) => e.stopPropagation()} />
              <div>
                <p className="font-medium text-foreground text-sm">Monthly IAS Lodgement</p>
                <p className="text-xs text-muted-foreground">For businesses lodging PAYG withholding monthly (not quarterly)</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-semibold text-foreground text-sm">+${addonPrices.ias}/mo</p>
              <p className="text-[10px] text-muted-foreground">in addition to BAS</p>
            </div>
          </div>

          <div onClick={() => updateCustomer({ bkJobTracking: !jobTracking })} className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox checked={jobTracking} onCheckedChange={(c) => updateCustomer({ bkJobTracking: !!c })} onClick={(e) => e.stopPropagation()} />
              <div>
                <p className="font-medium text-foreground text-sm">Job / Project Tracking</p>
                <p className="text-xs text-muted-foreground">Track profitability per job, project or location</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-semibold text-foreground text-sm">+${addonPrices.jobtrack}/mo</p>
              <p className="text-[10px] text-muted-foreground">ongoing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue */}
      <div className="checkout-nav flex justify-center pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
