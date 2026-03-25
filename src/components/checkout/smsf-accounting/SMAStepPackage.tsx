import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowRight, Home, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Counter } from "@/components/checkout/Counter";
import { useSMSFPricing } from "@/hooks/useSMSFPricing";
import { Checkbox } from "@/components/ui/checkbox";

interface Props { onNext: () => void; }

export const SMAStepPackage: React.FC<Props> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();
  const { cfg } = useSMSFPricing();
  const [searchParams] = useSearchParams();

  const DISC = cfg.annualDiscount || 0.2;
  const BASE = cfg.baseAnnual;
  const RES_PRICE = cfg.propertyRates.residential;
  const COM_PRICE = cfg.propertyRates.commercial;
  const EXTRA_MEMBER_FEE = cfg.extraMemberFee;
  const PENSION_FEE = cfg.pensionFee;
  const INVESTMENT_ADDONS = cfg.investmentAddons;

  const [billing, setBilling] = useState<"monthly" | "annual">((customer.smaBilling as "monthly" | "annual") || "annual");
  const residentialCount = (customer.smaResidentialCount as number) || 0;
  const commercialCount = (customer.smaCommercialCount as number) || 0;
  const investmentAddons = (customer.smaInvestmentAddons as string[]) || [];
  const memberCount = (customer.smaMemberCount as number) || 2;
  const hasPension = !!customer.smaPension;

  useEffect(() => {
    if (!customer.smaMemberCount) {
      updateCustomer({ smaMemberCount: 2 });
    }
  }, []);

  useEffect(() => {
    updateCustomer({ smaBilling: billing });
  }, [billing]);

  const isAnnual = billing === "annual";
  const baseDisplay = isAnnual ? Math.round(BASE * (1 - DISC)) : BASE;

  const toggleInvestmentAddon = (id: string) => {
    const updated = investmentAddons.includes(id) ? investmentAddons.filter((s: string) => s !== id) : [...investmentAddons, id];
    updateCustomer({ smaInvestmentAddons: updated });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-foreground">Build Your SMSF Package</h2>
        <p className="text-muted-foreground mt-1 text-sm">Every fund starts with the same solid base — then you add only what your fund actually has.</p>
      </div>

      {/* BASE PACKAGE CARD */}
      <div className="border-2 border-[hsl(var(--cta))] rounded-2xl overflow-hidden">
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-[10px] font-bold text-white bg-[hsl(var(--cta))] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 disabled:opacity-50">BASE PACKAGE</span>
            <h3 className="font-semibold text-foreground text-[17px]">SMSF Annual Compliance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Up to 2 members · listed shares / managed funds · Class Super platform</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[30px] font-bold text-foreground leading-none">${baseDisplay.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
            <p className="text-[11px] text-muted-foreground mt-1">or ${Math.round(BASE / 12).toLocaleString()}/mo</p>
          </div>
        </div>
        <div className="border-t border-border/50 px-5 py-3.5 grid grid-cols-2 gap-x-4 gap-y-1">
          {cfg.baseFeatures.map((f, i) => {
            const isAudit = f.toLowerCase().includes("audit");
            return (
              <div key={i} className="flex items-center gap-2">
                <span className={cn("w-[7px] h-[7px] rounded-full shrink-0", isAudit ? "bg-primary" : "bg-[hsl(var(--success))]")} />
                <span className="text-xs text-muted-foreground">{f}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING TOGGLE */}
      <div className="bg-card rounded-2xl border border-border p-3.5 flex items-center gap-4">
        <div className="inline-flex bg-muted/50 rounded-full p-[3px] border border-border/60 relative">
          <button
            onClick={() => setBilling("monthly")}
            className={cn("text-[13px] font-medium px-4 py-1.5 rounded-full transition-all relative z-10", billing === "monthly" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : "text-muted-foreground")}
          >Monthly</button>
          <button
            onClick={() => setBilling("annual")}
            className={cn("text-[13px] font-medium px-4 py-1.5 rounded-full transition-all relative z-10 flex items-center gap-1", billing === "annual" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : "text-muted-foreground")}
          >
            Annual
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", billing === "annual" ? "bg-white/20 text-white" : "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]")}>SAVE 20%</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {isAnnual ? "One upfront payment · 20% discount applied" : "Billed monthly · switch to annual to save 20%"}
        </p>
      </div>

      {/* CUSTOMISE HEADING */}
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Customise your fund</p>

      {/* PROPERTY HOLDINGS */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center"><Home className="text-muted-foreground" size={16} /></div>
          <div><p className="text-[13px] font-semibold text-foreground">Property Holdings</p><p className="text-[11px] text-muted-foreground">Does your fund hold any property?</p></div>
        </div>
        <div className="border-t border-border/50 px-4">
          {/* Residential */}
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div>
              <p className="text-[13px] font-medium text-foreground">Residential Properties</p>
              <p className="text-[11px] text-muted-foreground">Standard residential real estate held in the fund</p>
              <span className="inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full bg-[hsl(var(--cta)/0.08)] text-[hsl(var(--cta))] border border-[hsl(var(--cta)/0.15)]">+${RES_PRICE}/yr each</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {residentialCount > 0 && <span className="text-xs font-semibold text-[hsl(var(--cta))]">${(residentialCount * RES_PRICE).toLocaleString()}</span>}
              <Counter value={residentialCount} onChange={(v) => updateCustomer({ smaResidentialCount: v })} min={0} max={10} label="" />
            </div>
          </div>
          {/* Commercial */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">Commercial Properties</p>
              <p className="text-[11px] text-muted-foreground">Business real property (BRP) — e.g. office, factory</p>
              <span className="inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full bg-[hsl(var(--cta)/0.08)] text-[hsl(var(--cta))] border border-[hsl(var(--cta)/0.15)]">+${COM_PRICE}/yr each</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {commercialCount > 0 && <span className="text-xs font-semibold text-[hsl(var(--cta))]">${(commercialCount * COM_PRICE).toLocaleString()}</span>}
              <Counter value={commercialCount} onChange={(v) => updateCustomer({ smaCommercialCount: v })} min={0} max={10} label="" />
            </div>
          </div>
        </div>
      </div>

      {/* INVESTMENT COMPLEXITY */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center"><TrendingUp className="text-muted-foreground" size={16} /></div>
          <div><p className="text-[13px] font-semibold text-foreground">Investment Complexity</p><p className="text-[11px] text-muted-foreground">Select any investment types your fund holds</p></div>
        </div>
        <div className="border-t border-border/50 px-4">
          {INVESTMENT_ADDONS.map((addon, i) => {
            const isActive = investmentAddons.includes(addon.id);
            return (
              <div key={addon.id} onClick={() => toggleInvestmentAddon(addon.id)}
                className={cn("flex items-center justify-between py-3 cursor-pointer hover:bg-muted/30 transition-colors", i < INVESTMENT_ADDONS.length - 1 && "border-b border-border/30")}>
                <div className="flex items-center gap-3">
                  <Checkbox checked={isActive} onCheckedChange={() => toggleInvestmentAddon(addon.id)} onClick={(e) => e.stopPropagation()} />
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{addon.label}</p>
                    <p className="text-[11px] text-muted-foreground">{addon.sub}</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-foreground shrink-0">+${addon.price}/yr</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FUND MEMBERS */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center"><Users className="text-muted-foreground" size={16} /></div>
          <div><p className="text-[13px] font-semibold text-foreground">Fund Members</p><p className="text-[11px] text-muted-foreground">Base includes 2 members</p></div>
        </div>
        <div className="border-t border-border/50 px-4">
          {/* Member counter */}
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div>
              <p className="text-[13px] font-medium text-foreground">Number of Members</p>
              <p className="text-[11px] text-muted-foreground">First 2 members included in base package</p>
              <span className="inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full bg-[hsl(var(--cta)/0.08)] text-[hsl(var(--cta))] border border-[hsl(var(--cta)/0.15)]">+${EXTRA_MEMBER_FEE}/yr per extra member</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {memberCount > 2 && <span className="text-xs font-semibold text-[hsl(var(--cta))]">${((memberCount - 2) * EXTRA_MEMBER_FEE).toLocaleString()}</span>}
              <Counter value={memberCount} onChange={(v) => updateCustomer({ smaMemberCount: v })} min={2} max={6} label="" />
            </div>
          </div>
          {/* Pension */}
          <div onClick={() => updateCustomer({ smaPension: !hasPension })}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox checked={hasPension} onCheckedChange={(c) => updateCustomer({ smaPension: !!c })} onClick={(e) => e.stopPropagation()} />
              <div>
                <p className="text-[13px] font-medium text-foreground">Pension Phase Member</p>
                <p className="text-[11px] text-muted-foreground">Member receiving pension payments — actuarial certificate at cost</p>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-foreground shrink-0">+${PENSION_FEE}/yr</span>
          </div>
        </div>
      </div>

      {/* Continue */}
      <div className="checkout-nav flex justify-center pt-2">
        <button onClick={onNext} className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-[15px] disabled:opacity-50">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
