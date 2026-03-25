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

export const TAOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { pricing: apiPricing } = useServicePricing("trust_accounting");
  const cfg = apiPricing ?? getAccountingFallback("trust_accounting")!;

  const startDateId = (customer.taStartDate as string) || "jul";
  const revenueTier = (customer.taRevenue as string) || "under75k";
  const billing = (customer.taBilling as "monthly" | "annual") || "annual";
  const payrollEnabled = !!customer.taPayroll;
  const employeeCount = (customer.taEmployeeCount as number) || 1;
  const catchUp = (customer.taCatchUp as string) || "up_to_date";
  const registeredOffice = !!customer.taRegisteredOffice;
  const taxPlanning = !!customer.taTaxPlanning;

  const packageLevel = (customer.taPackageLevel as "essential" | "premium") || "essential";

  const result = calculateAccountingPrice({
    tiers: cfg.tiers, revenueTier, billing, startDateId,
    startDates: cfg.startDates, annualDiscount: cfg.annualDiscount,
    transitionFee: cfg.transitionFee, enableStrikePricing: cfg.enableStrikePricing,
    packageLevel, taxPlanningFee: cfg.addons?.taxPlanningFee ?? 0,
  });

  const showStrike = !!result.strikeCompliance;
  const startInfo = cfg.startDates.find((d) => d.id === startDateId) ?? cfg.startDates[0];
  const months = startInfo.months;

  const payrollPerEmp = cfg.addons.payrollPerEmployee;
  const payrollFee = payrollEnabled
    ? (billing === "monthly" ? Math.round(payrollPerEmp * employeeCount / 12) : Math.round((payrollPerEmp * employeeCount / 12) * months))
    : 0;
  const catchUpFee = catchUp === "need_support" ? cfg.addons.catchUpFee : 0;
  const officeFee = registeredOffice
    ? (billing === "monthly" ? Math.round(cfg.addons.registeredOfficeFee / 12) : Math.round((cfg.addons.registeredOfficeFee / 12) * months))
    : 0;
  const taxPlanningFee = taxPlanning ? cfg.addons.taxPlanningFee : 0;

  const addonsTotal = payrollFee + catchUpFee + officeFee + taxPlanningFee;
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
              <TooltipProvider><Tooltip><TooltipTrigger asChild><p className="text-xs text-placeholder flex items-center gap-1 cursor-help">Fixed fee <Info size={12} /></p></TooltipTrigger><TooltipContent className="max-w-[240px]"><p className="text-xs">Annual financial statements and tax return are fixed compliance deliverables and not subject to proration.</p></TooltipContent></Tooltip></TooltipProvider>
            </div>
            <StrikePriceDisplay
              price={billing === "monthly" ? `$${Math.round(result.compliance / 12).toLocaleString()}` : `$${result.compliance.toLocaleString()}`}
              strikePrice={showStrike ? (billing === "monthly" ? `$${Math.round(result.strikeCompliance! / 12).toLocaleString()}` : `$${result.strikeCompliance!.toLocaleString()}`) : null}
              suffix={billing === "monthly" ? "/mo" : ""}
            />
          </div>

          <div className="flex justify-between">
            <div><p className="font-medium text-foreground">Ongoing Accounting & BAS ({months} months)</p><p className="text-xs text-placeholder">${result.monthlyFee}/mo × {months}</p></div>
            <StrikePriceDisplay
              price={billing === "monthly" ? `$${result.monthlyFee?.toLocaleString()}` : `$${result.operations.toLocaleString()}`}
              strikePrice={showStrike ? (billing === "monthly" ? `$${result.strikeMonthlyFee!.toLocaleString()}` : `$${result.strikeOperations!.toLocaleString()}`) : null}
              suffix={billing === "monthly" ? "/mo" : ""}
            />
          </div>

          {result.transition > 0 && (<div className="flex justify-between"><div><p className="font-medium text-foreground">Mid-Year Onboarding Review</p><p className="text-xs text-placeholder">Includes prior BAS & opening balance review</p></div><span className="font-medium text-foreground">${result.transition.toLocaleString()}</span></div>)}
          {payrollFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Payroll Services</p><p className="text-xs text-placeholder">{employeeCount} employee × {months} months</p></div><span className="font-medium text-foreground">${payrollFee.toLocaleString()}{billing === "monthly" ? "/mo" : ""}</span></div>)}
          {catchUpFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Catch-Up Pack</p><p className="text-xs text-placeholder">Financial review & clean-up (one-time)</p></div><span className="font-medium text-foreground">${catchUpFee.toLocaleString()}</span></div>)}
          {officeFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Registered Office</p><p className="text-xs text-placeholder">{months} months</p></div><span className="font-medium text-foreground">${officeFee.toLocaleString()}</span></div>)}
          {taxPlanningFee > 0 && (<div className="flex justify-between"><div><p className="text-foreground">Tax Planning Session</p></div><span className="font-medium text-foreground">${taxPlanningFee.toLocaleString()}</span></div>)}
        </div>

        {result.discount > 0 && (<div className="border-t border-border pt-3"><div className="flex justify-between text-sm"><span className="text-[hsl(var(--success))] font-medium">⚡ Annual Discount ({Math.round(cfg.annualDiscount * 100)}%)</span><span className="text-[hsl(var(--success))] font-medium">-${result.discount.toLocaleString()}</span></div></div>)}

        <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-xl p-4">
          <p className="text-xs text-placeholder uppercase tracking-wide">TOTAL DUE TODAY</p>
          {showStrike && result.strikeTotal && (<p className="text-sm text-muted-foreground/60 line-through mt-0.5">${(result.strikeTotal + addonsTotal).toLocaleString()}{billing === "monthly" ? "/mo" : ""}</p>)}
          <p className="text-3xl font-bold text-foreground mt-1">${grandTotal.toLocaleString()}{billing === "monthly" ? "/mo" : ""}</p>
          <p className="text-xs text-placeholder mt-1">{billing === "monthly" ? "Billed monthly • Cancel anytime" : `One-time payment for ${months} months • ${Math.round(cfg.annualDiscount * 100)}% discount applied`}</p>
        </div>

        <div className="space-y-2">
          <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.15)] rounded-lg p-3"><div className="flex items-center gap-2"><CheckCircle className="text-[hsl(var(--success))] shrink-0" size={16} /><p className="text-sm font-medium text-[hsl(var(--success))]">Registered Tax Agent</p></div></div>
          <div className="bg-primary/5 border border-primary/15 rounded-lg p-3"><div className="flex items-center gap-2"><Award className="text-primary shrink-0" size={16} /><p className="text-sm font-medium text-primary">IPA Member</p></div></div>
          <div className="border border-border rounded-lg p-3"><div className="flex items-center gap-2"><Shield className="text-[hsl(var(--cta))] shrink-0" size={16} /><div><p className="text-sm font-medium text-foreground">Secure Payments</p><p className="text-xs text-placeholder">256-bit SSL encryption</p></div></div></div>
        </div>

        <NeedHelpCall />
        <TPBBadge />
      </div>
    </div>
  );
};
