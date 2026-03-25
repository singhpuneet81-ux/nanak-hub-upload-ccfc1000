import React, { useState, useMemo } from "react";
import { Calculator, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

/* ── Structure config ── */
const structures = [
  { id: "sole_trader", label: "Sole Trader" },
  { id: "company", label: "Company" },
  { id: "trust", label: "Trust" },
  { id: "unstructured", label: "Unstructured" },
] as const;

type StructureId = (typeof structures)[number]["id"];

const taxSavingsRate: Record<StructureId, number> = {
  sole_trader: 0.12,
  company: 0.15,
  trust: 0.18,
  unstructured: 0.09,
};

const assetProtectionRate: Record<StructureId, number> = {
  sole_trader: 0.10,
  company: 0.15,
  trust: 0.20,
  unstructured: 0.05,
};

function calculate(netWorth: number, income: number, structure: StructureId) {
  const taxSavings = Math.round(income * taxSavingsRate[structure]);
  const assetsProtected = Math.round(netWorth * assetProtectionRate[structure]);
  const totalValue = Math.round(taxSavings + assetsProtected * 0.1);
  return { taxSavings, assetsProtected, totalValue };
}

const fmt = (n: number) => "$" + n.toLocaleString("en-AU");

const BusinessWealthStructuringPage: React.FC = () => {
  const [structure, setStructure] = useState<StructureId>("unstructured");
  const [netWorth, setNetWorth] = useState(2000000);
  const [income, setIncome] = useState(500000);

  const results = useMemo(() => calculate(netWorth, income, structure), [netWorth, income, structure]);
  const animTax = useAnimatedNumber(results.taxSavings);
  const animAssets = useAnimatedNumber(results.assetsProtected);
  const animTotal = useAnimatedNumber(results.totalValue);

  const netPct = ((netWorth - 500000) / (10000000 - 500000)) * 100;
  const incPct = ((income - 100000) / (2000000 - 100000)) * 100;

  return (
    <div className="flex flex-col bg-background">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-10 pb-4 md:pt-16 md:pb-6">
        <div className="inline-flex items-center gap-2 border border-border text-foreground text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wide">
          <Calculator className="w-3.5 h-3.5 text-cta" />
          Interactive Calculator
        </div>
        <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-extrabold text-foreground text-center max-w-2xl mb-3 leading-tight tracking-tight">
          Calculate Your Potential Benefits
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-[0.95rem] max-w-lg mb-10 leading-relaxed font-normal">
          See personalized savings estimates based on your situation
        </p>
      </section>

      {/* Main Card */}
      <section className="flex-1 flex justify-center px-4 pb-6">
        <div className="w-full max-w-5xl bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8 md:gap-10">
            {/* Left column */}
            <div>
              {/* Current Structure */}
              <label className="text-[11px] font-bold text-cta uppercase tracking-[0.12em] mb-3 block">
                Current Structure
              </label>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {structures.map((s) => {
                  const active = structure === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStructure(s.id)}
                      className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200 text-sm font-semibold ${
                        active
                          ? "border-cta bg-cta/5 text-cta"
                          : "border-border hover:border-cta/30 text-foreground"
                      }`}
                    >
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-cta absolute top-2 right-2" />
                      )}
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Net Worth */}
              <label className="text-[11px] font-bold text-foreground uppercase tracking-[0.12em] mb-1 block">
                Net Worth
              </label>
              <span className="text-2xl font-extrabold text-cta block mb-2">{fmt(netWorth)}</span>
              <input
                type="range"
                min={500000}
                max={10000000}
                step={50000}
                value={netWorth}
                onChange={(e) => setNetWorth(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
                style={{
                  background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${netPct}%, hsl(220 13% 91%) ${netPct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>$500K</span>
                <span>$10M</span>
              </div>

              {/* Annual Business Income */}
              <label className="text-[11px] font-bold text-foreground uppercase tracking-[0.12em] mb-1 block">
                Annual Business Income
              </label>
              <span className="text-2xl font-extrabold text-cta block mb-2">{fmt(income)}</span>
              <input
                type="range"
                min={100000}
                max={2000000}
                step={10000}
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
                style={{
                  background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${incPct}%, hsl(220 13% 91%) ${incPct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>$100K</span>
                <span>$2M</span>
              </div>
            </div>

            {/* Right column – Results */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold text-cta uppercase tracking-[0.15em] text-center block">
                Potential Annual Benefits
              </span>

              {/* Tax Savings */}
              <div className="rounded-xl border border-border p-4 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] block mb-1">
                  Tax Savings
                </span>
                <span className="text-2xl font-extrabold text-foreground block">
                  {fmt(animTax)}
                </span>
              </div>

              {/* Assets Protected */}
              <div className="rounded-xl border border-border p-4 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] block mb-1">
                  Assets Protected
                </span>
                <span className="text-2xl font-extrabold text-foreground block">
                  {fmt(animAssets)}
                </span>
              </div>

              {/* Total Value */}
              <div
                className="rounded-xl p-5 text-center text-white"
                style={{
                  background: "linear-gradient(135deg, hsl(24 95% 53%) 0%, hsl(0 85% 50%) 100%)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80 block mb-1">
                  Total Value
                </span>
                <span className="text-3xl font-extrabold block">
                  {fmt(animTotal)}
                </span>
                <span className="text-white/70 text-xs block mt-0.5">per year</span>
              </div>

              {/* CTA */}
              <a
                href="/pricing"
                className="block w-full text-center py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Get Personalized Strategy
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-5xl flex items-start gap-3 p-5 rounded-xl border border-border bg-card">
          <Lightbulb className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-bold text-foreground block mb-0.5">Conservative Estimates</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These calculations provide indicative estimates only. Actual savings depend on your specific circumstances. Book a consultation for personalized analysis and recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessWealthStructuringPage;
