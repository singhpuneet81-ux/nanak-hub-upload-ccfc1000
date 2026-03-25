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

interface Props {
  onNext: () => void;
}

export const PTStepPackage: React.FC<Props> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();
  const { pricing: apiPricing } = useServicePricing("partnership_tax");
  const cfg = apiPricing ?? getAccountingFallback("partnership_tax")!;

  const startDate = (customer.ptStartDate as string) || "jul";
  const revenueTier = (customer.ptRevenue as string) || "under75k";
  const billing = (customer.ptBilling as "monthly" | "annual") || "annual";
  const packageLevel = (customer.ptPackageLevel as "essential" | "premium") || "essential";

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

    if (!customer.ptStartDate || !customer.ptRevenue || !customer.ptBilling || !customer.ptPackageLevel) {
      updateCustomer({
        ptStartDate: initStart,
        ptRevenue: initRevenue,
        ptBilling: initBilling,
        ptPackageLevel: initPlan,
      });
    }
  }, []);

  const selectedStart = cfg.startDates.find((d) => d.id === startDate) ?? cfg.startDates[0];
  const months = selectedStart.months;

  const result = calculateAccountingPrice({
    tiers: cfg.tiers,
    revenueTier,
    billing,
    startDateId: startDate,
    startDates: cfg.startDates,
    annualDiscount: cfg.annualDiscount,
    transitionFee: cfg.transitionFee,
    enableStrikePricing: cfg.enableStrikePricing,
    packageLevel,
    taxPlanningFee: cfg.addons?.taxPlanningFee ?? 0,
  });

  const essentialPlan = cfg.plans.essential;
  const premiumPlan = cfg.plans.premium;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 1</p>
        <h3 className="font-bold text-foreground text-lg mb-3">Service Start Date</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cfg.startDates.map((d) => (
            <button key={d.id} onClick={() => updateCustomer({ ptStartDate: d.id })} className={cn("rounded-lg border-2 p-3 text-center transition-all", startDate === d.id ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]" : "border-border hover:border-primary/30")}>
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
          <Select value={revenueTier} onValueChange={(v) => updateCustomer({ ptRevenue: v })}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>{cfg.revenueTiers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">&nbsp;</p>
          <h3 className="font-bold text-foreground text-lg mb-3">Billing Option</h3>
          <div className="inline-flex items-center gap-1 bg-primary/10 border-2 border-primary/20 rounded-full p-1.5">
            <button onClick={() => updateCustomer({ ptBilling: "monthly" })} className={cn("px-5 py-2 rounded-full text-sm font-semibold transition-all", billing === "monthly" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-placeholder hover:text-foreground")}>Monthly</button>
            <button onClick={() => updateCustomer({ ptBilling: "annual" })} className={cn("px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5", billing === "annual" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-placeholder hover:text-foreground")}>
              Annual
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", billing === "annual" ? "bg-white/20 text-white" : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]")}>SAVE {Math.round(cfg.annualDiscount * 100)}%</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 3</p>
        <h3 className="font-bold text-foreground text-lg mb-3">Choose Your Plan</h3>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
          <p className="text-2xl font-bold text-foreground">${result.total.toLocaleString()}<span className="text-sm font-normal text-placeholder">{billing === "monthly" ? "/mo" : `/${months}mo`}</span></p>
          <p className="text-xs text-placeholder mt-1">
            {billing === "monthly"
              ? `$${result.monthlyFee}/mo ops + $${Math.round(result.compliance / 12)}/mo compliance${result.premiumExtra > 0 ? ` + $${Math.round(result.premiumExtra / 12)}/mo tax planning` : ""}`
              : `Compliance $${result.compliance.toLocaleString()} + Ops $${result.operations.toLocaleString()}${result.premiumExtra > 0 ? ` + Tax Planning $${result.premiumExtra.toLocaleString()}` : ""}${result.transition > 0 ? ` + Transition $${result.transition}` : ""}${result.discount > 0 ? ` − ${Math.round(cfg.annualDiscount * 100)}% discount` : ""}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div onClick={() => updateCustomer({ ptPackageLevel: "essential" })} className={cn("relative rounded-2xl border-2 p-6 cursor-pointer transition-all", packageLevel === "essential" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
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

          <div onClick={() => updateCustomer({ ptPackageLevel: "premium" })} className={cn("relative rounded-2xl border-2 p-6 cursor-pointer transition-all", packageLevel === "premium" ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]" : "border-border hover:border-primary/40")}>
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

      <TooltipProvider><Tooltip><TooltipTrigger asChild><p className="text-xs text-placeholder flex items-center gap-1 cursor-help"><Info size={12} /> Annual compliance fees are fixed deliverables and not subject to proration.</p></TooltipTrigger><TooltipContent className="max-w-[280px]"><p className="text-xs">Annual financial statements and tax return are fixed compliance deliverables and not subject to proration.</p></TooltipContent></Tooltip></TooltipProvider>

      <div className="checkout-nav flex justify-center pt-2">
        <button onClick={onNext} className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">Continue <ArrowRight size={18} /></button>
      </div>
    </div>
  );
};
