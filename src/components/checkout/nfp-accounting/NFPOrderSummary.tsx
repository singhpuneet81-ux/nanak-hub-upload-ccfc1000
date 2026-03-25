import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Shield, CheckCircle, Calendar, Award, Info } from "lucide-react";
import { NeedHelpCall } from "../shared/NeedHelpCall";
import { TPBBadge } from "../shared/TPBBadge";
import { StrikePriceDisplay } from "../shared/StrikePriceDisplay";
import { useServicePricing } from "@/hooks/useAccountingPricing";
import {
  calculateAccountingPrice,
  getAccountingFallback,
} from "@/config/accountingPricingFallback";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const NFPOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { pricing: apiPricing } = useServicePricing("nfp_accounting");
  const localCfg = getAccountingFallback("nfp_accounting")!;
  const cfg = (apiPricing && apiPricing.tiers && apiPricing.revenueTiers?.length > 0) ? apiPricing : localCfg;

  const startDateId = (customer.nfpStartDate as string) || "jul";
  const revenueTier = (customer.nfpRevenue as string) || cfg.revenueTiers[0]?.id || "small";
  const rawBilling = (customer.nfpBilling as "monthly" | "annual") || "annual";
  const startInfo = cfg.startDates.find((d) => d.id === startDateId) ?? cfg.startDates[0];
  const billingLocked = startInfo.months <= 3;
  const billing = billingLocked ? "annual" : rawBilling;
  const payrollEnabled = !!customer.nfpPayroll;
  const employeeCount = (customer.nfpEmployeeCount as number) || 1;
  const catchUp = (customer.nfpCatchUp as string) || "up_to_date";
  const registeredOffice = !!customer.nfpRegisteredOffice;
  const taxPlanning = !!customer.nfpTaxPlanning;

  const packageLevel = (customer.nfpPackageLevel as "essential" | "premium") || "essential";

  const result = calculateAccountingPrice({
    tiers: cfg.tiers, revenueTier, billing, startDateId,
    startDates: cfg.startDates, annualDiscount: cfg.annualDiscount,
    transitionFee: cfg.transitionFee, enableStrikePricing: cfg.enableStrikePricing,
    packageLevel, taxPlanningFee: cfg.addons?.taxPlanningFee ?? 0,
    prorateCompliance: cfg.prorateCompliance,
  });

  const showStrike = !!result.strikeCompliance;
  const months = startInfo.months;

  // For annual billing: show pre-discount as strike and post-discount as actual per line
  const isAnnualWithDiscount = billing === "annual" && result.discount > 0;
  const discountRate = cfg.annualDiscount; // 0.20
  const complianceAfterDiscount = isAnnualWithDiscount ? Math.round(result.compliance * (1 - discountRate)) : result.compliance;
  const operationsAfterDiscount = isAnnualWithDiscount ? Math.round(result.operations * (1 - discountRate)) : result.operations;

  const payrollPerEmp = cfg.addons.payrollPerEmployee;
  const payrollFee = payrollEnabled
    ? (billing === "monthly" ? Math.round(payrollPerEmp * employeeCount / 12) : Math.round((payrollPerEmp * employeeCount / 12) * months))
    : 0;
  const catchUpFee = catchUp === "need_support" ? cfg.addons.catchUpFee : 0;
  const officeFee = registeredOffice
    ? (billing === "monthly" ? Math.round(cfg.addons.registeredOfficeFee / 12) : Math.round((cfg.addons.registeredOfficeFee / 12) * months))
    : 0;
  const taxPlanningFee = taxPlanning ? cfg.addons.taxPlanningFee : 0;

  // Dynamic NFP addons from API
  const dynamicAddons = (cfg.nfpAddons ?? []).filter((addon) => !!(customer as any)[`nfpDynAddon_${addon.key}`]);
  const dynamicAddonsTotal = dynamicAddons.reduce((sum, a) => sum + a.value, 0);

  const addonsTotal = payrollFee + catchUpFee + officeFee + taxPlanningFee + dynamicAddonsTotal;
  const grandTotal = result.total + addonsTotal;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground p-5 rounded-t-2xl">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2"><Calendar size={14} className="text-primary" /><p className="font-semibold text-primary text-sm">Service Period</p></div>
          <p className="text-xs text-placeholder mt-0.5">{startInfo.label} — 30 June 2026 ({months} months)</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-foreground">Annual Compliance</p>
              <TooltipProvider><Tooltip><TooltipTrigger asChild><p className="text-xs text-placeholder flex items-center gap-1 cursor-help">AIS + financial statements <Info size={12} /></p></TooltipTrigger><TooltipContent className="max-w-[240px]"><p className="text-xs">Annual ACNC AIS lodgement and financial statements.</p></TooltipContent></Tooltip></TooltipProvider>
            </div>
            <div className="text-right">
              {isAnnualWithDiscount && (
                <span className="text-xs text-muted-foreground/60 line-through mr-1.5">${result.compliance.toLocaleString()}</span>
              )}
              <span className="font-medium text-foreground">
                {billing === "monthly" ? `$${Math.round(result.compliance / 12).toLocaleString()}/mo` : `$${complianceAfterDiscount.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <div><p className="font-medium text-foreground">Ongoing Accounting & BAS ({months} months)</p><p className="text-xs text-placeholder">${result.monthlyFee}/mo × {months}</p></div>
            <div className="text-right">
              {isAnnualWithDiscount && (
                <span className="text-xs text-muted-foreground/60 line-through mr-1.5">${result.operations.toLocaleString()}</span>
              )}
              <span className="font-medium text-foreground">
                {billing === "monthly" ? `$${result.monthlyFee?.toLocaleString()}/mo` : `$${operationsAfterDiscount.toLocaleString()}`}
              </span>
            </div>
          </div>

          {result.transition > 0 && (<div className="flex justify-between"><div><p className="font-medium text-foreground">Mid-Year Onboarding Review</p><p className="text-xs text-placeholder">Includes prior BAS & opening balance review</p></div><span className="font-medium text-foreground">${result.transition.toLocaleString()}</span></div>)}
          {payrollFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Payroll Services</p><p className="text-xs text-placeholder">{employeeCount} employee × {months} months</p></div><span className="font-medium text-foreground">${payrollFee.toLocaleString()}{billing === "monthly" ? "/mo" : ""}</span></div>)}
          {catchUpFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Catch-Up Pack</p><p className="text-xs text-placeholder">Financial review & clean-up (one-time)</p></div><span className="font-medium text-foreground">${catchUpFee.toLocaleString()}</span></div>)}
          {officeFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Registered Office</p><p className="text-xs text-placeholder">{months} months</p></div><span className="font-medium text-foreground">${officeFee.toLocaleString()}</span></div>)}
          {taxPlanningFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Tax Planning Session</p></div><span className="font-medium text-foreground">${taxPlanningFee.toLocaleString()}</span></div>)}
          {dynamicAddons.map((addon) => (<div key={addon.id} className="flex justify-between"><div><p className="text-foreground">{addon.label}</p>{addon.note && <p className="text-xs text-placeholder">{addon.note}</p>}</div><span className="font-medium text-foreground">${addon.value.toLocaleString()}</span></div>))}
        </div>

        {result.discount > 0 && (<div className="border-t border-border pt-3"><div className="flex justify-between text-sm"><span className="text-[hsl(var(--success))] font-medium">⚡ Annual Discount ({Math.round(cfg.annualDiscount * 100)}%)</span><span className="text-[hsl(var(--success))] font-medium">-${result.discount.toLocaleString()}</span></div></div>)}

        <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-xl p-4">
          <p className="text-xs text-placeholder uppercase tracking-wide">TOTAL DUE TODAY</p>
          {isAnnualWithDiscount && (<p className="text-sm text-muted-foreground/60 line-through mt-0.5">${(result.compliance + result.operations + result.transition + result.premiumExtra + addonsTotal).toLocaleString()}</p>)}
          <p className="text-3xl font-bold text-foreground mt-1">${grandTotal.toLocaleString()}{billing === "monthly" ? "/mo" : ""}</p>
          <p className="text-xs text-placeholder mt-1">{billing === "monthly" ? "Billed monthly • Cancel anytime" : `One-time payment for ${months} months · ${Math.round(cfg.annualDiscount * 100)}% discount · budget locked`}</p>
        </div>

        <div className="space-y-2">
          <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.15)] rounded-lg p-3"><div className="flex items-center gap-2"><CheckCircle className="text-[hsl(var(--success))] shrink-0" size={16} /><p className="text-sm font-medium text-[hsl(var(--success))]">Registered Tax Agent</p></div></div>
          <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.15)] rounded-lg p-3"><div className="flex items-center gap-2"><CheckCircle className="text-[hsl(var(--success))] shrink-0" size={16} /><p className="text-sm font-medium text-[hsl(var(--success))]">ACNC-registered advisor</p></div></div>
          <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.15)] rounded-lg p-3"><div className="flex items-center gap-2"><CheckCircle className="text-[hsl(var(--success))] shrink-0" size={16} /><p className="text-sm font-medium text-[hsl(var(--success))]">ATO-endorsed tax concessions</p></div></div>
          <div className="bg-primary/5 border border-primary/15 rounded-lg p-3"><div className="flex items-center gap-2"><Award className="text-primary shrink-0" size={16} /><p className="text-sm font-medium text-primary">IPA Member</p></div></div>
          <div className="border border-border rounded-lg p-3"><div className="flex items-center gap-2"><Shield className="text-[hsl(var(--cta))] shrink-0" size={16} /><div><p className="text-sm font-medium text-foreground">Secure Payments</p><p className="text-xs text-placeholder">256-bit SSL encryption</p></div></div></div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
