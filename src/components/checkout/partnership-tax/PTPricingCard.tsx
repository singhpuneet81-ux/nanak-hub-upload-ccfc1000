import React, { useState } from "react";
import { Check, ArrowRight, Zap, Calendar, Info } from "lucide-react";
import {
  PT_PRICING,
  PT_REVENUE_TIERS,
  PT_START_DATES,
  calculatePTPrice,
  type PTRevenueKey,
} from "@/config/partnershipTaxPricing.config";
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

const ESSENTIAL_FEATURES = [
  "Partnership Tax Return",
  "Partner Distribution Statements",
  "BAS Preparation & Lodgement",
  "Partner Capital Tracking",
  "Year-End Financial Statements",
];

const PREMIUM_FEATURES = [
  "Everything in Essential",
  "Strategic Partner Tax Planning",
  "Capital Account Management",
  "Priority Phone Support",
  "Quarterly Reviews",
  "Dedicated Partnership Accountant",
];

export const PTPricingCard: React.FC = () => {
  const [plan, setPlan] = useState<"essential" | "premium">("essential");
  const [revenueTier, setRevenueTier] = useState<PTRevenueKey>("under75k");
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [startDate, setStartDate] = useState("jul");

  const result = calculatePTPrice({ revenueTier, billing, startDateId: startDate });
  const selectedStart = PT_START_DATES.find((d) => d.id === startDate)!;

  return (
    <div className="py-10 px-4">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ===== LEFT — Configuration ===== */}
          <div className="flex-1 space-y-6">
            {/* Step 1 — Plan */}
            <div>
              <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 1</p>
              <h3 className="font-bold text-foreground text-lg mb-3">Choose Your Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPlan("essential")}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${plan === "essential" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <p className="font-bold text-foreground">Essential</p>
                  <p className="text-xs text-placeholder mt-0.5">Compliance-focused</p>
                </button>
                <button onClick={() => setPlan("premium")}
                  className={`rounded-xl border-2 p-4 text-left transition-all relative ${plan === "premium" ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]" : "border-border hover:border-[hsl(var(--cta)/0.3)]"}`}>
                  <span className="absolute -top-2.5 right-3 bg-[hsl(var(--cta))] text-white text-[10px] font-bold px-2 py-0.5 rounded-full disabled:opacity-50">POPULAR</span>
                  <p className="font-bold text-foreground flex items-center gap-1.5"><Zap size={14} className="text-[hsl(var(--cta))]" /> Premium</p>
                  <p className="text-xs text-placeholder mt-0.5">Strategic growth</p>
                </button>
              </div>
            </div>

            {/* Step 2 — Revenue */}
            <div>
              <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 2</p>
              <h3 className="font-bold text-foreground text-lg mb-3">Select Revenue Tier</h3>
              <Select value={revenueTier} onValueChange={(v) => setRevenueTier(v as PTRevenueKey)}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PT_REVENUE_TIERS.map((t) => (<SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3 — Billing */}
            <div>
              <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 3</p>
              <h3 className="font-bold text-foreground text-lg mb-3">Billing Option</h3>
              <div className="inline-flex items-center gap-1 bg-primary/10 border-2 border-primary/20 rounded-full p-1.5">
                <button onClick={() => setBilling("monthly")}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${billing === "monthly" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-placeholder hover:text-foreground"}`}>Monthly</button>
                <button onClick={() => setBilling("annual")}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${billing === "annual" ? "bg-[hsl(var(--cta))] text-white shadow-lg disabled:opacity-50" : "text-placeholder hover:text-foreground"}`}>
                  Annual<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${billing === "annual" ? "bg-white/20 text-white" : "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"}`}>SAVE 20%</span>
                </button>
              </div>
            </div>

            {/* Step 4 — Start Date */}
            <div>
              <p className="text-xs font-bold uppercase text-placeholder tracking-widest mb-1">Step 4</p>
              <h3 className="font-bold text-foreground text-lg mb-3">Service Start Date</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PT_START_DATES.map((d) => (
                  <button key={d.id} onClick={() => setStartDate(d.id)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${startDate === d.id ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]" : "border-border hover:border-primary/30"}`}>
                    <p className={`text-sm font-medium ${startDate === d.id ? "text-[hsl(var(--cta))]" : "text-foreground"}`}>{d.label}</p>
                    <p className={`text-xs mt-0.5 ${startDate === d.id ? "text-[hsl(var(--cta))]" : "text-placeholder"}`}>{d.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-placeholder"><Calendar size={14} /><span>Service runs until 30 June 2026</span></div>
            </div>

            {/* Features list */}
            <div className="border border-border rounded-xl p-5">
              <h4 className="font-bold text-foreground mb-3">{plan === "premium" ? "Premium" : "Essential"} Includes</h4>
              <ul className="space-y-2">
                {(plan === "premium" ? PREMIUM_FEATURES : ESSENTIAL_FEATURES).map((f, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-[hsl(var(--success))]" /><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ===== RIGHT — Live Investment Summary ===== */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
              <div className="bg-primary text-primary-foreground p-5 rounded-t-2xl">
                <h2 className="text-lg font-semibold">Investment Summary</h2>
                <p className="text-primary-foreground/70 text-sm mt-0.5">
                  {plan === "premium" ? "Premium" : "Essential"} · {selectedStart.label} – 30 Jun 2026
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-foreground">Annual Compliance</p>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <p className="text-xs text-placeholder flex items-center gap-1 cursor-help">Fixed fee <Info size={12} /></p>
                      </TooltipTrigger><TooltipContent className="max-w-[240px]"><p className="text-xs">Annual financial statements and tax return are fixed compliance deliverables and not subject to proration.</p></TooltipContent></Tooltip></TooltipProvider>
                    </div>
                    <span className="font-medium text-foreground">
                      {billing === "monthly" ? `$${Math.round(result.compliance / 12).toLocaleString()}/mo` : `$${result.compliance.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-foreground">Ongoing Accounting & BAS ({result.months} months)</p>
                      <p className="text-xs text-placeholder">${result.monthlyFee}/mo × {result.months} months</p>
                    </div>
                    <span className="font-medium text-foreground">
                      {billing === "monthly" ? `$${result.monthlyFee?.toLocaleString()}/mo` : `$${result.operations.toLocaleString()}`}
                    </span>
                  </div>

                  {result.transition > 0 && (
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-foreground">Mid-Year Onboarding Review</p>
                        <p className="text-xs text-placeholder">Includes prior BAS & opening balance review</p>
                      </div>
                      <span className="font-medium text-foreground">${result.transition.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {result.discount > 0 && (
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--success))] font-medium">⚡ Annual Discount (20%)</span>
                      <span className="text-[hsl(var(--success))] font-medium">-${result.discount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-xl p-4">
                  <p className="text-xs text-placeholder uppercase tracking-wide">TOTAL DUE TODAY</p>
                  <p className="text-3xl font-bold text-foreground mt-1">${result.total.toLocaleString()}{billing === "monthly" ? "/mo" : ""}</p>
                  <p className="text-xs text-placeholder mt-1">
                    {billing === "monthly" ? "Billed monthly · Cancel anytime" : `One-time payment · Service until 30 Jun 2026`}
                  </p>
                </div>

                <a href={`/partnership-tax?plan=${plan}&billing=${billing}&revenue=${revenueTier}&start=${startDate}&step=0`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full h-12 bg-[hsl(var(--cta))] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  Get Started — ${result.total.toLocaleString()}{billing === "monthly" ? "/mo" : ""}<ArrowRight size={18} />
                </a>

                <p className="text-xs text-placeholder text-center leading-relaxed">
                  Annual financial statements and tax return are fixed compliance deliverables and not subject to proration.
                </p>
                <p className="text-center text-xs text-placeholder">All prices exclude GST · Prorated pricing available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
