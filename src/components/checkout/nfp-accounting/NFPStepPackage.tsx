import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, ArrowRight, Calendar, Info, Zap } from "lucide-react";
import { ExpandableServices } from "@/components/checkout/shared/ExpandableServices";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServicePricing } from "@/hooks/useAccountingPricing";
import {
  calculateAccountingPrice,
  getAccountingFallback,
} from "@/config/accountingPricingFallback";

/** Tier-specific metadata tags shown below dropdown */
const NFP_TIER_META: Record<string, { badge: string; tags: string[] }> = {
  under75k: {
    badge: "Under $75K",
    tags: ["AIS lodgement", "Financial report optional", "Income tax exempt", "FBT rebate available"],
  },
  "75to200k": {
    badge: "$75K – $200K",
    tags: ["AIS lodgement", "Financial report required", "Income tax exempt", "FBT rebate available"],
  },
  "200to500k": {
    badge: "$200K – $500K",
    tags: ["AIS lodgement", "Financial report required", "Income tax exempt", "FBT rebate available"],
  },
  "500to1m": {
    badge: "$500K – $1M",
    tags: ["AIS lodgement", "Financial report required", "Audit required", "Income tax exempt"],
  },
  "1mto2m": {
    badge: "$1M – $2M",
    tags: ["AIS lodgement", "Financial report required", "Audit required", "Income tax exempt"],
  },
  "2mto5m": {
    badge: "$2M – $5M",
    tags: ["AIS lodgement", "Financial report required", "Audit required", "Income tax exempt", "FBT rebate available"],
  },
};

interface Props {
  onNext: () => void;
}

export const NFPStepPackage: React.FC<Props> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();
  const { pricing: apiPricing } = useServicePricing("nfp_accounting");
  const localCfg = getAccountingFallback("nfp_accounting")!;
  const cfg = (apiPricing && apiPricing.tiers && apiPricing.revenueTiers?.length > 0) ? apiPricing : localCfg;

  const startDate = (customer.nfpStartDate as string) || "jul";
  const revenueTier = (customer.nfpRevenue as string) || cfg.revenueTiers[0]?.id || "small";
  const billing = (customer.nfpBilling as "monthly" | "annual") || "annual";
  const packageLevel = (customer.nfpPackageLevel as "essential" | "premium") || "essential";

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlBilling = searchParams.get("billing");
    const urlRevenue = searchParams.get("revenue");
    const urlStart = searchParams.get("start");
    const urlPlan = searchParams.get("plan");

    const initBilling = urlBilling === "monthly" || urlBilling === "annual" ? urlBilling : billing;
    const initRevenue = urlRevenue || revenueTier;
    const initStart = urlStart || startDate;
    const initPlan = urlPlan === "essential" || urlPlan === "premium" ? urlPlan : packageLevel;

    if (!customer.nfpStartDate || !customer.nfpRevenue || !customer.nfpBilling || !customer.nfpPackageLevel) {
      updateCustomer({
        nfpStartDate: initStart,
        nfpRevenue: initRevenue,
        nfpBilling: initBilling,
        nfpPackageLevel: initPlan,
      });
    }
  }, []);

  // Billing lock: auto-lock to annual for short periods (≤3 months)
  const selectedStart = cfg.startDates.find((d) => d.id === startDate) ?? cfg.startDates[0];
  const months = selectedStart.months;
  const isFullYear = startDate === "jul";
  const billingLocked = months <= 3;

  useEffect(() => {
    if (billingLocked && billing !== "annual") {
      updateCustomer({ nfpBilling: "annual" });
    }
  }, [billingLocked, billing]);

  const effectiveBilling = billingLocked ? "annual" : billing;

  const result = calculateAccountingPrice({
    tiers: cfg.tiers,
    revenueTier,
    billing: effectiveBilling,
    startDateId: startDate,
    startDates: cfg.startDates,
    annualDiscount: cfg.annualDiscount,
    transitionFee: cfg.transitionFee,
    enableStrikePricing: cfg.enableStrikePricing,
    packageLevel,
    taxPlanningFee: cfg.addons?.taxPlanningFee ?? 0,
    prorateCompliance: cfg.prorateCompliance,
  });

  // Resolve tier info for preview
  const tierCfg = cfg.tiers[revenueTier];
  const tierCompliance = tierCfg?.compliance ?? 0;
  const tierMonthly = tierCfg?.monthly ?? 0;

  const essentialPlan = cfg.plans.essential;
  const premiumPlan = cfg.plans.premium;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 1</p>
        <h3 className="font-bold text-foreground text-lg mb-3">Service Start Date</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cfg.startDates.map((d) => (
            <button key={d.id} onClick={() => updateCustomer({ nfpStartDate: d.id })} className={cn("rounded-lg border-2 p-3 text-center transition-all", startDate === d.id ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]" : "border-border hover:border-primary/30")}>
              <p className={cn("text-sm font-medium", startDate === d.id ? "text-[hsl(var(--cta))]" : "text-foreground")}>{d.label}</p>
              <p className={cn("text-xs mt-0.5", startDate === d.id ? "text-[hsl(var(--cta))]" : "text-placeholder")}>{d.desc}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-placeholder"><Calendar size={14} /><span>Service runs {selectedStart.label} → 30 June 2026</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 2</p>
          <h3 className="font-bold text-foreground text-lg mb-3">Select Revenue Tier</h3>
          <p className="text-sm text-placeholder mb-2">Annual revenue bracket</p>
          <Select value={revenueTier} onValueChange={(v) => updateCustomer({ nfpRevenue: v })}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>{cfg.revenueTiers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>))}</SelectContent>
          </Select>
          {tierCfg && (
            <div className="mt-2 bg-muted/50 border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">{NFP_TIER_META[revenueTier]?.badge ?? "ACNC"}</span>
                <span className="text-xs text-muted-foreground">Compliance <span className="font-semibold text-foreground">${tierCompliance.toLocaleString()}</span>/yr · Ops <span className="font-semibold text-foreground">${tierMonthly}</span>/mo</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(NFP_TIER_META[revenueTier]?.tags ?? []).map((tag, i) => (
                  <span key={i} className="text-[10px] font-medium text-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.08)] border border-[hsl(var(--cta)/0.2)] px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 3</p>
          <h3 className="font-bold text-foreground text-lg mb-3">Billing Option</h3>
          <div className="inline-flex items-center gap-1 bg-primary/10 border-2 border-primary/20 rounded-full p-1.5">
            <button
              onClick={() => !billingLocked && updateCustomer({ nfpBilling: "monthly" })}
              disabled={billingLocked}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                effectiveBilling === "monthly" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-placeholder hover:text-foreground",
                billingLocked && "opacity-40 cursor-not-allowed"
              )}
            >
              Monthly
            </button>
            <button onClick={() => updateCustomer({ nfpBilling: "annual" })} className={cn("px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5", effectiveBilling === "annual" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-placeholder hover:text-foreground")}>
              Annual
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", effectiveBilling === "annual" ? "bg-white/20 text-white" : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]")}>LOCK IN BUDGET · SAVE {Math.round(cfg.annualDiscount * 100)}%</span>
            </button>
          </div>
          {billingLocked && (
            <span className="ml-2 text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 inline-block mt-2">Only {months} months — annual only</span>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 4</p>
        <h3 className="font-bold text-foreground text-lg mb-3">Choose Your Plan</h3>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
          <p className="text-2xl font-bold text-foreground">${result.total.toLocaleString()}<span className="text-sm font-normal text-placeholder">{effectiveBilling === "monthly" ? "/mo" : `/${months}mo`}</span></p>
          <p className="text-xs text-placeholder mt-1">
            {effectiveBilling === "monthly"
              ? `$${result.monthlyFee}/mo ops + $${Math.round(tierCompliance / 12)}/mo compliance${result.premiumExtra > 0 ? ` + $${Math.round(result.premiumExtra / 12)}/mo tax planning` : ""}`
              : `Compliance $${result.compliance.toLocaleString()} + Ops $${result.operations.toLocaleString()}${result.premiumExtra > 0 ? ` + Tax Planning $${result.premiumExtra.toLocaleString()}` : ""}${result.transition > 0 ? ` + Transition $${result.transition}` : ""}${result.discount > 0 ? ` − ${Math.round(cfg.annualDiscount * 100)}% discount` : ""}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div onClick={() => updateCustomer({ nfpPackageLevel: "essential" })} className={cn("relative rounded-2xl border-2 p-6 cursor-pointer transition-all", packageLevel === "essential" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-foreground text-lg">{essentialPlan.title}</h4>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", packageLevel === "essential" ? "border-primary" : "border-muted-foreground/40")}>{packageLevel === "essential" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}</div>
            </div>
            <p className="text-xs text-placeholder mb-3">{essentialPlan.subtitle}</p>
            <div className="space-y-2">
              {essentialPlan.features.map((f, i) => (<div key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-[hsl(var(--success))]" /><span className="text-sm text-foreground">{f}</span></div>))}
              {essentialPlan.extraFeatures.length > 0 && <ExpandableServices accentColor="primary" extraServices={essentialPlan.extraFeatures} />}
            </div>
          </div>

          <div onClick={() => updateCustomer({ nfpPackageLevel: "premium" })} className={cn("relative rounded-2xl border-2 p-6 cursor-pointer transition-all", packageLevel === "premium" ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]" : "border-border hover:border-primary/40")}>
            {premiumPlan.badge && (<div className="absolute -top-3 left-4"><span className="bg-[hsl(var(--cta))] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 disabled:opacity-50"><Zap size={12} /> {premiumPlan.badge}</span></div>)}
            <div className="flex items-center justify-between mb-1 mt-2">
              <h4 className="font-bold text-foreground text-lg">{premiumPlan.title}</h4>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", packageLevel === "premium" ? "border-[hsl(var(--cta))]" : "border-muted-foreground/40")}>{packageLevel === "premium" && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--cta))] disabled:opacity-50" />}</div>
            </div>
            <p className="text-xs text-placeholder mb-3">{premiumPlan.subtitle}</p>
            <div className="space-y-2">
              {premiumPlan.features.map((f, i) => (<div key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-[hsl(var(--success))]" /><span className="text-sm text-foreground">{f}</span></div>))}
              {premiumPlan.extraFeatures.length > 0 && <ExpandableServices accentColor="cta" extraServices={premiumPlan.extraFeatures} />}
            </div>
          </div>
        </div>
      </div>

      <TooltipProvider><Tooltip><TooltipTrigger asChild><p className="text-xs text-placeholder flex items-center gap-1 cursor-help"><Info size={12} /> Annual compliance fees are fixed deliverables and not subject to proration.</p></TooltipTrigger><TooltipContent className="max-w-[280px]"><p className="text-xs">Annual financial statements and returns are fixed compliance deliverables and not subject to proration.</p></TooltipContent></Tooltip></TooltipProvider>

      <div className="checkout-nav flex justify-center pt-2">
        <button onClick={onNext} className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">Continue <ArrowRight size={18} /></button>
      </div>
    </div>
  );
};
