import React, { useState } from "react";
import { Lightbulb, TrendingUp, ClipboardList, CheckCircle2 } from "lucide-react";

const stages = [
  { id: "startup", label: "Startup", icon: Lightbulb },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "established", label: "Established", icon: ClipboardList },
];

const basePrices: Record<string, number> = {
  startup: 2500,
  growth: 3500,
  established: 4500,
};

const features = [
  "Comprehensive business plan (30-50 pages)",
  "Detailed financial model & projections",
  "Market research & competitive analysis",
  "Executive summary & pitch deck",
  "Unlimited revisions for 30 days",
];

const fmt = (n: number) => "$" + n.toLocaleString("en-AU");

const BusinessPlanCalculatorPage: React.FC = () => {
  const [stage, setStage] = useState("startup");
  const [funding, setFunding] = useState(100000);
  const [years, setYears] = useState(3);

  const price = basePrices[stage];
  const fundingPct = (funding / 2000000) * 100;
  const yearsPct = ((years - 1) / 6) * 100;

  return (
    <div className="flex flex-col bg-background">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-10 pb-4 md:pt-16 md:pb-6">
        <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-extrabold text-foreground text-center max-w-2xl mb-3 leading-tight tracking-tight">
          Estimate Your Investment
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-[0.95rem] max-w-lg mb-10 leading-relaxed font-normal">
          Get an instant estimate based on your business needs
        </p>
      </section>

      {/* Calculator */}
      <section className="flex-1 flex justify-center px-4 pb-16">
        <div className="w-full max-w-4xl bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* Left: Inputs */}
          <div>
            {/* Business Stage */}
            <label className="text-sm font-semibold text-foreground mb-3 block">
              Business Stage
            </label>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {stages.map((s) => {
                const Icon = s.icon;
                const active = stage === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStage(s.id)}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-200 ${
                      active
                        ? "border-[hsl(var(--purple-accent,270_70%_55%))] bg-[hsl(var(--purple-accent,270_70%_55%)/0.06)]"
                        : "border-border hover:border-[hsl(var(--purple-accent,270_70%_55%)/0.3)]"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        active ? "text-[hsl(270,70%,55%)]" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        active ? "text-[hsl(270,70%,55%)]" : "text-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Funding Required */}
            <label className="text-sm font-semibold text-foreground mb-1 block">
              Funding Required: {fmt(funding)}
            </label>
            <input
              type="range"
              min={0}
              max={2000000}
              step={10000}
              value={funding}
              onChange={(e) => setFunding(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
              style={{
                background: `linear-gradient(to right, hsl(270 70% 55%) 0%, hsl(270 70% 55%) ${fundingPct}%, hsl(220 13% 91%) ${fundingPct}%, hsl(220 13% 91%) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mb-8">
              <span>$0</span>
              <span>$2M+</span>
            </div>

            {/* Projection Period */}
            <label className="text-sm font-semibold text-foreground mb-1 block">
              Projection Period: {years} {years === 1 ? "Year" : "Years"}
            </label>
            <input
              type="range"
              min={1}
              max={7}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
              style={{
                background: `linear-gradient(to right, hsl(270 70% 55%) 0%, hsl(270 70% 55%) ${yearsPct}%, hsl(220 13% 91%) ${yearsPct}%, hsl(220 13% 91%) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mb-8">
              <span className="text-[hsl(270,70%,55%)]">1 Year</span>
              <span>7 Years</span>
            </div>

            {/* Pro Tip */}
            <div className="rounded-xl bg-[hsl(270,70%,55%,0.07)] border border-[hsl(270,70%,55%,0.15)] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-[hsl(270,70%,55%)]" />
                <span className="text-sm font-bold text-foreground">Pro Tip</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Banks and investors typically require 3-5 year projections. Longer projections show commitment to long-term growth.
              </p>
            </div>
          </div>

          {/* Right: Pricing card */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl p-8 text-white flex flex-col items-center"
              style={{
                background: "linear-gradient(135deg, hsl(270 70% 55%) 0%, hsl(280 80% 60%) 100%)",
              }}
            >
              <span className="text-xs font-bold tracking-[0.15em] uppercase mb-2 text-white/90">
                Estimated Investment
              </span>
              <span className="text-5xl md:text-6xl font-extrabold mb-1">{fmt(price)}</span>
              <span className="text-sm text-white/80 mb-6">+ GST</span>

              <ul className="w-full space-y-3 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-white/80" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/pricing"
                className="w-full py-3.5 rounded-full bg-white text-[hsl(270,70%,55%)] font-bold text-center text-sm hover:bg-white/90 transition-colors"
              >
                Get Started Now
              </a>
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              50% deposit required to commence work
              <br />
              Balance due upon delivery
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessPlanCalculatorPage;
