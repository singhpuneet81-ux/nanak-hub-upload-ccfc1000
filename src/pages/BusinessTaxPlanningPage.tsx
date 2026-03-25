import React, { useState, useEffect, useMemo } from "react";
import { Calculator, Building2, Landmark, User, CheckCircle2, Download, Mail, Clock, Info, ArrowRight, Lightbulb } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { downloadTaxPlanningEstimate } from "@/utils/downloadEstimate";

/* ── entity config ── */
const entities = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "trust", label: "Trust", icon: Landmark },
  { id: "sole_trader", label: "Sole Trader", icon: User },
] as const;

type EntityId = (typeof entities)[number]["id"];

const savingsRates: Record<EntityId, number> = {
  company: 0.18,
  trust: 0.22,
  sole_trader: 0.15,
};

const PLANNING_INVESTMENT = 4500;

function calculate(revenue: number, taxRate: number, entity: EntityId) {
  const currentTax = revenue * (taxRate / 100);
  const annualSavings = Math.round(currentTax * savingsRates[entity]);
  const threeYearSavings = annualSavings * 3;
  const roi = Math.round((annualSavings * 100) / 3500);
  return { annualSavings, threeYearSavings, roi, planningInvestment: PLANNING_INVESTMENT };
}

const fmt = (n: number) => "$" + n.toLocaleString("en-AU");

/* ── EOFY countdown ── */
function useEOFYCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const year = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  const eofy = new Date(year, 5, 30, 23, 59, 59); // June 30
  const diff = Math.max(0, eofy.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins, fyLabel: `End of Financial Year: June 30` };
}

/* ── tip cards per entity ── */
const tipCards: Partial<Record<EntityId, { title: string; description: string; linkLabel: string; color: "green" | "orange" }>> = {
  trust: {
    title: "Trust Structure Advantage",
    description: "Your trust structure allows for flexible income distribution. Ensure you're maximising family splitting opportunities.",
    linkLabel: "Learn More →",
    color: "green",
  },
  sole_trader: {
    title: "Structure Review Recommended",
    description: "At your revenue level, a company or trust structure could deliver significant tax savings.",
    linkLabel: "Compare Structures →",
    color: "orange",
  },
};

const BusinessTaxPlanningPage: React.FC = () => {
  const [entity, setEntity] = useState<EntityId>("company");
  const [revenue, setRevenue] = useState(500000);
  const [taxRate, setTaxRate] = useState(30);
  const eofy = useEOFYCountdown();

  const results = useMemo(() => calculate(revenue, taxRate, entity), [revenue, taxRate, entity]);
  const animSavings = useAnimatedNumber(results.annualSavings);
  const anim3Year = useAnimatedNumber(results.threeYearSavings);
  const animRoi = useAnimatedNumber(results.roi);
  const tip = tipCards[entity];

  const revPct = ((revenue - 100000) / (5000000 - 100000)) * 100;
  const taxPct = ((taxRate - 15) / (47 - 15)) * 100;

  return (
    <div className="flex flex-col bg-background">
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-4 pt-10 pb-4 md:pt-16 md:pb-6">
        <div className="inline-flex items-center gap-2 border border-border text-foreground text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wide">
          <Calculator className="w-3.5 h-3.5 text-cta" />
          Interactive Calculator
        </div>
        <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-extrabold text-foreground text-center max-w-2xl mb-3 leading-tight tracking-tight">
          Calculate Your Tax Savings
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-[0.95rem] max-w-lg mb-10 leading-relaxed font-normal">
          See how much you could save with strategic tax planning
        </p>
      </section>

      {/* ── Main Card ── */}
      <section className="flex-1 flex justify-center px-4 pb-6">
        <div className="w-full max-w-5xl bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-10">
            {/* ── Left column ── */}
            <div>
              {/* Entity type */}
              <label className="text-[11px] font-bold text-cta uppercase tracking-[0.12em] mb-3 block">
                Entity Type
              </label>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {entities.map((e) => {
                  const Icon = e.icon;
                  const active = entity === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setEntity(e.id)}
                      className={`relative flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-200 ${
                        active
                          ? "border-cta bg-cta/5"
                          : "border-border hover:border-cta/30"
                      }`}
                    >
                      {active && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cta text-white flex items-center justify-center text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <Icon className={`w-6 h-6 ${active ? "text-cta" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-semibold ${active ? "text-cta" : "text-foreground"}`}>
                        {e.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Annual Revenue */}
              <label className="text-[11px] font-bold text-cta uppercase tracking-[0.12em] mb-1 block">
                Annual Revenue
              </label>
              <span className="text-2xl font-extrabold text-foreground block mb-2">{fmt(revenue)}</span>
              <input
                type="range"
                min={100000}
                max={5000000}
                step={10000}
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
                style={{
                  background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${revPct}%, hsl(220 13% 91%) ${revPct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>$100K</span>
                <span>$5M</span>
              </div>

              {/* Current Tax Rate */}
              <label className="text-[11px] font-bold text-cta uppercase tracking-[0.12em] mb-1 block">
                Current Tax Rate
              </label>
              <span className="text-2xl font-extrabold text-foreground block mb-2">{taxRate}%</span>
              <input
                type="range"
                min={15}
                max={47}
                step={1}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
                style={{
                  background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${taxPct}%, hsl(220 13% 91%) ${taxPct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>15%</span>
                <span>47%</span>
              </div>

              {/* EOFY Countdown */}
              <div className="rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-foreground" />
                  <div>
                    <span className="text-sm font-bold text-foreground block leading-tight">Time Until EOFY</span>
                    <span className="text-xs text-muted-foreground">{eofy.fyLabel}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: eofy.days, label: "Days" },
                    { val: eofy.hours, label: "Hours" },
                    { val: eofy.mins, label: "Mins" },
                  ].map((t) => (
                    <div key={t.label} className="bg-muted rounded-lg py-3 text-center">
                      <span className="text-xl font-extrabold text-foreground block">{t.val}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right column – Results ── */}
            <div className="flex flex-col gap-4">
              {/* Savings banner */}
              <div
                className="rounded-2xl p-6 text-white transition-all duration-500"
                style={{
                  background: "linear-gradient(135deg, hsl(24 95% 53%) 0%, hsl(15 90% 48%) 100%)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80 block mb-1">
                  Potential Annual Savings
                </span>
                <span className="text-4xl md:text-[2.8rem] font-extrabold block">
                  {fmt(animSavings)}
                </span>
                <span className="text-white/70 text-xs block mt-0.5">per year</span>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center bg-white/15 rounded-lg px-4 py-2">
                    <span className="text-xs font-semibold text-white/90">Planning Investment</span>
                    <span className="text-sm font-bold text-white">{fmt(results.planningInvestment)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/15 rounded-lg px-4 py-2">
                    <span className="text-xs font-semibold text-white/90">3-Year Savings</span>
                    <span className="text-sm font-bold text-white">{fmt(anim3Year)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/15 rounded-lg px-4 py-2">
                    <span className="text-xs font-semibold text-white/90">ROI</span>
                    <span className="text-lg font-extrabold text-white">
                      {animRoi}%
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] block mb-2">
                  What's Included
                </span>
                <ul className="space-y-1.5">
                  {[
                    "100% ATO-compliant strategies",
                    "Ongoing quarterly reviews",
                    "Written tax optimisation plan",
                    "Unlimited email support",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cta shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share Results */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] block mb-2">
                  Share Results
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadTaxPlanningEstimate({
                      entity,
                      revenue,
                      taxRate,
                      annualSavings: results.annualSavings,
                      threeYearSavings: results.threeYearSavings,
                      roi: results.roi,
                      planningInvestment: results.planningInvestment,
                    })}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-cta rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-cta rounded-full px-4 py-2 hover:opacity-90 transition-opacity">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                </div>
              </div>

              {/* CTA */}
              <a
                href="/pricing"
                className="block w-full text-center py-3 rounded-xl border-2 border-cta text-cta font-bold text-sm hover:bg-cta hover:text-white transition-colors"
              >
                Get Your Tax Plan
              </a>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Conservative estimate. Actual savings may be higher based on your specific circumstances.
              </p>
            </div>
          </div>

          {/* ── Tip card (entity-specific) ── */}
          {tip && (
            <div
              key={entity}
              className={`mt-6 rounded-xl p-5 flex items-start gap-3 animate-fade-in ${
                tip.color === "green"
                  ? "bg-success/5 border border-success/20"
                  : "bg-cta/5 border border-cta/20"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                tip.color === "green" ? "bg-success/15" : "bg-cta/15"
              }`}>
                <Lightbulb className={`w-4 h-4 ${tip.color === "green" ? "text-success" : "text-cta"}`} />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block mb-1">{tip.title}</span>
                <p className="text-xs text-muted-foreground leading-relaxed mb-1">{tip.description}</p>
                <a href="/pricing" className={`text-xs font-semibold ${tip.color === "green" ? "text-success" : "text-cta"}`}>
                  {tip.linkLabel}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Conservative Estimates disclaimer ── */}
      <section className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-5xl flex items-start gap-3 p-5 rounded-xl border border-border bg-card">
          <Info className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-foreground block mb-0.5">Conservative Estimates</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These calculations are conservative estimates. Actual savings may be higher based on your specific circumstances. Book a consultation for detailed analysis.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessTaxPlanningPage;
