import React, { useState } from "react";
import { Calculator, ArrowRight, TrendingDown, Check, Sparkles, User, Building2, Landmark, ClipboardList, TrendingUp } from "lucide-react";

const structures = [
  { id: "individual", label: "Individual", desc: "TFN & Sole Trader", icon: User },
  { id: "company", label: "Company", desc: "Pty Ltd structure", icon: Building2 },
  { id: "trust", label: "Trust", desc: "Family trust", icon: Landmark },
];

const fyOptions = ["FY 2025-26", "FY 2026-27"];

function estimateTax(revenue: number, structure: string) {
  let currentTax: number;
  let optimisedTax: number;

  if (structure === "individual") {
    // FY 2024-25+ Stage 3 tax brackets
    let baseTax: number;
    if (revenue <= 18200) baseTax = 0;
    else if (revenue <= 45000) baseTax = (revenue - 18200) * 0.16;
    else if (revenue <= 135000) baseTax = 4288 + (revenue - 45000) * 0.30;
    else if (revenue <= 190000) baseTax = 31288 + (revenue - 135000) * 0.37;
    else baseTax = 51638 + (revenue - 190000) * 0.45;
    // Add 2% Medicare levy
    currentTax = baseTax + revenue * 0.02;
    optimisedTax = currentTax * 0.753;
  } else if (structure === "company") {
    currentTax = revenue * 0.25;
    optimisedTax = revenue * 0.22;
  } else {
    currentTax = revenue * 0.30;
    optimisedTax = revenue * 0.21;
  }

  const savings = Math.max(0, Math.round(currentTax - optimisedTax));
  return {
    currentTax: Math.round(currentTax),
    optimisedTax: Math.round(optimisedTax),
    savings,
    percentage: currentTax > 0 ? Math.round((savings / currentTax) * 100) : 0,
  };
}

const fmt = (n: number) => "$" + n.toLocaleString("en-AU");

const strategies: Record<string, { title: string; items: string[]; more: string; cta: string }> = {
  individual: {
    title: "Strategic Personal Tax Architecture",
    items: [
      "Super contribution optimisation (concessional + carry forward caps)",
      "CGT offset modelling (timing of asset disposals)",
      "Medicare levy & surcharge minimisation",
    ],
    more: "...and 5 more proven strategies",
    cta: "Unlock My Advanced Tax Plan",
  },
  company: {
    title: "Corporate Tax Efficiency Blueprint",
    items: [
      "Division 7A planning & loan optimisation",
      "Retained earnings & tax deferral modelling",
      "Director salary vs dividend optimisation",
    ],
    more: "...and 6 more proven strategies",
    cta: "Build My Corporate Tax Structure",
  },
  trust: {
    title: "Wealth Distribution & Tax Engineering Framework",
    items: [
      "Income streaming to lower-tax beneficiaries",
      "Capital gain streaming optimisation",
      "Bucket company profit retention strategy",
    ],
    more: "...and 6 more proven strategies",
    cta: "Optimise My Trust Strategy",
  },
};

const TaxCalculatorPage: React.FC = () => {
  const [revenue, setRevenue] = useState(200000);
  const [structure, setStructure] = useState("individual");
  const [fy, setFy] = useState("FY 2025-26");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof estimateTax> | null>(null);

  const handleCalculate = () => {
    setResults(estimateTax(revenue, structure));
    setShowResults(true);
  };

  const pct = ((revenue - 30000) / (2000000 - 30000)) * 100;
  const strat = strategies[structure];

  return (
    <div className="flex flex-col bg-background">
      {/* Hero */}
      <div className="pt-6 md:pt-10" />

      {/* Calculator grid */}
      <section className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Input card */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-6">
              <span className="w-8 h-8 rounded-lg bg-cta/10 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-cta" />
              </span>
              Calculate Your Savings
            </h2>

            {/* Financial Year */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-3 block">Financial Year</label>
              <div className="flex gap-2">
                {fyOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFy(f); setShowResults(false); }}
                    className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      fy === f
                        ? "bg-cta/10 text-cta border-2 border-cta"
                        : "bg-background border-2 border-border text-muted-foreground hover:border-cta/30"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue slider */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Annual Income / Profit
              </label>
              <input
                type="range"
                min={30000}
                max={2000000}
                step={10000}
                value={revenue}
                onChange={(e) => {
                  setRevenue(Number(e.target.value));
                  setShowResults(false);
                }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${pct}%, hsl(220 13% 91%) ${pct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="text-center mt-3">
                <span className="text-2xl font-bold text-foreground">{fmt(revenue)}</span>
                <span className="text-xs text-muted-foreground block">per year</span>
              </div>
            </div>

            {/* Structure selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Current Business Structure
              </label>
              <div className="space-y-2.5">
                {structures.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setStructure(s.id); setShowResults(false); }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        structure === s.id
                          ? "border-cta bg-cta/5"
                          : "border-border hover:border-cta/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          structure === s.id ? "bg-cta/15 text-cta" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-foreground block">{s.label}</span>
                          <span className="text-xs text-muted-foreground">{s.desc}</span>
                        </div>
                      </div>
                      {structure === s.id && (
                        <div className="w-6 h-6 rounded-full bg-cta text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleCalculate} className="btn-cta w-full text-base rounded-xl">
              Calculate My Savings <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Results */}
          <div className="flex flex-col gap-4">
            {!showResults || !results ? (
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-border bg-card shadow-lg p-8 min-h-[420px]">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-foreground font-bold text-base mb-2 text-center">
                  Ready to Calculate Your Savings?
                </p>
                <p className="text-muted-foreground text-sm text-center max-w-[280px]">
                  Enter your details on the left and click "Calculate My Savings" to see your potential tax savings with optimized structuring and strategies.
                </p>
              </div>
            ) : (
              <>
                {/* Savings banner */}
                <div
                  className="rounded-2xl p-6 text-white"
                  style={{
                    background: "linear-gradient(135deg, hsl(24 95% 53%) 0%, hsl(15 90% 55%) 100%)",
                  }}
                >
                  <div className="flex items-center gap-2 text-white/90 text-xs font-semibold mb-2">
                    <Sparkles className="w-4 h-4" />
                    Potential Annual Savings
                  </div>
                  <span className="text-4xl md:text-5xl font-bold block">{fmt(results.savings)}</span>
                  <span className="text-white/80 text-sm mt-1 block">
                    Save up to {results.percentage}% on your tax bill
                  </span>
                </div>

                {/* Tax Breakdown card */}
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                  <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                    <ClipboardList className="w-4 h-4 text-cta" />
                    Tax Breakdown
                  </h3>

                  <div className="space-y-3">
                    {/* Current Tax */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-destructive/5">
                      <div>
                        <span className="text-xs text-muted-foreground block">Current Tax (Estimated)</span>
                        <span className="text-xl font-bold text-foreground">{fmt(results.currentTax)}</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      </div>
                    </div>

                    {/* Optimized Tax */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-success/5">
                      <div>
                        <span className="text-xs text-muted-foreground block">Optimized Tax</span>
                        <span className="text-xl font-bold text-foreground">{fmt(results.optimisedTax)}</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                    </div>
                  </div>

                  {/* Strategies box */}
                  <div className="mt-4 p-4 rounded-xl bg-cta/5 border border-cta/15">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-cta" />
                      <span className="text-sm font-bold text-foreground">{strat.title}</span>
                    </div>
                    <ul className="space-y-2">
                      {strat.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center mt-0.5 shrink-0">
                            <Check className="w-2.5 h-2.5 text-success" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2 italic">{strat.more}</p>
                  </div>

                  {/* Note */}
                  <div className="mt-3 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-cta">Note:</span> This is an estimate based on ATO tax rates for {fy}. Actual savings depend on your specific circumstances.
                    </p>
                  </div>

                  <a href="/pricing" className="btn-cta w-full text-sm mt-4 inline-flex rounded-xl">
                    {strat.cta} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TaxCalculatorPage;
