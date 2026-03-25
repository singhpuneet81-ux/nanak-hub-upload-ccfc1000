import React, { useState, useMemo } from "react";
import { Calculator, Users, Store, Factory, Zap, CheckCircle2, Download, Mail, Lightbulb, Activity } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { downloadValuationEstimate } from "@/utils/downloadEstimate";

/* ── Industry config ── */
const industries = [
  { id: "services", label: "Services", icon: Users },
  { id: "retail", label: "Retail", icon: Store },
  { id: "manufacturing", label: "Manufacturing", icon: Factory },
  { id: "tech", label: "Tech/SaaS", icon: Zap },
] as const;

type IndustryId = (typeof industries)[number]["id"];

const multiples: Record<IndustryId, number> = {
  services: 4.25,
  retail: 3.0,
  manufacturing: 4.25,
  tech: 10.25,
};

const healthScores: Record<IndustryId, number> = {
  services: 92,
  retail: 88,
  manufacturing: 90,
  tech: 95,
};

const industryAvgMargin: Record<IndustryId, number> = {
  services: 15,
  retail: 8,
  manufacturing: 12,
  tech: 18,
};

function calculate(revenue: number, ebitda: number, industry: IndustryId) {
  const valuation = Math.round(ebitda * multiples[industry]);
  const low = Math.round(valuation * 0.8);
  const high = Math.round(valuation * 1.2);
  const profitMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  return { valuation, low, high, profitMargin, healthScore: healthScores[industry] };
}

const fmtK = (n: number) => {
  if (n >= 1000) return "$" + Math.round(n / 1000).toLocaleString("en-AU") + "K";
  return "$" + n.toLocaleString("en-AU");
};

const fmtFull = (n: number) => "$" + n.toLocaleString("en-AU");

const features = [
  "Independent expert valuation report",
  "Court-accepted methodology",
  "Multiple valuation approaches",
  "Detailed financial analysis",
  "Professional presentation",
];

/* ── Donut chart component ── */
const HealthDonut: React.FC<{ score: number }> = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-[130px] h-[130px] mx-auto">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="hsl(220 13% 91%)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="hsl(160 70% 42%)"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-foreground leading-none">{score}</span>
        <span className="text-[10px] text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
};

/* ── Profit margin bar chart ── */
const MarginChart: React.FC<{ yourMargin: number; industryAvg: number }> = ({ yourMargin, industryAvg }) => {
  const maxH = 90;
  const yourH = Math.min(maxH, (yourMargin / 30) * maxH);
  const indH = Math.min(maxH, (industryAvg / 30) * maxH);

  return (
    <div className="bg-white/15 rounded-xl p-4 mt-4">
      <span className="text-xs font-bold text-white/90 block mb-3">Profit Margin vs Industry</span>
      <div className="flex justify-center gap-6 items-end h-[100px]">
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-16 rounded-t-md bg-white/40 transition-all duration-500"
            style={{ height: yourH }}
          />
          <span className="text-[10px] text-white/70">Your Business</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-16 rounded-t-md bg-white/20 transition-all duration-500"
            style={{ height: indH }}
          />
          <span className="text-[10px] text-white/70">Industry Avg</span>
        </div>
      </div>
    </div>
  );
};

const BusinessValuationPage: React.FC = () => {
  const [industry, setIndustry] = useState<IndustryId>("services");
  const [revenue, setRevenue] = useState(1000000);
  const [ebitda, setEbitda] = useState(200000);

  const results = useMemo(() => calculate(revenue, ebitda, industry), [revenue, ebitda, industry]);
  const animValuation = useAnimatedNumber(results.valuation);
  const animLow = useAnimatedNumber(results.low);
  const animHigh = useAnimatedNumber(results.high);
  const revPct = ((revenue - 100000) / (10000000 - 100000)) * 100;
  const ebitdaPct = (ebitda / 2000000) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-10 pb-4 md:pt-16 md:pb-6">
        <div className="inline-flex items-center gap-2 border border-border text-foreground text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wide">
          <Calculator className="w-3.5 h-3.5 text-[hsl(270,70%,55%)]" />
          Interactive Calculator
        </div>
        <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-extrabold text-foreground text-center max-w-2xl mb-3 leading-tight tracking-tight">
          Quick Valuation Estimate
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-[0.95rem] max-w-lg mb-10 leading-relaxed font-normal">
          Get an indicative range for your business value
        </p>
      </section>

      {/* Main card */}
      <section className="flex-1 flex justify-center px-4 pb-16">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6">
          {/* Left */}
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8">
            {/* Industry Type */}
            <label className="text-sm font-semibold text-foreground mb-3 block">Industry Type</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {industries.map((ind) => {
                const Icon = ind.icon;
                const active = industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      active
                        ? "border-[hsl(270,70%,55%)] bg-[hsl(270,70%,55%,0.08)]"
                        : "border-border hover:border-[hsl(270,70%,55%,0.3)]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-[hsl(270,70%,55%)]" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-semibold ${active ? "text-[hsl(270,70%,55%)]" : "text-foreground"}`}>
                      {ind.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Annual Revenue */}
            <label className="text-sm font-semibold text-foreground mb-1 block">
              Annual Revenue: {fmtFull(revenue)}
            </label>
            <input
              type="range"
              min={100000}
              max={10000000}
              step={50000}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
              style={{
                background: `linear-gradient(to right, hsl(270 70% 55%) 0%, hsl(270 70% 55%) ${revPct}%, hsl(220 13% 91%) ${revPct}%, hsl(220 13% 91%) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mb-8">
              <span>$100K</span>
              <span>$10M+</span>
            </div>

            {/* Annual Net Profit (EBITDA) */}
            <label className="text-sm font-semibold text-foreground mb-1 block">
              Annual Net Profit (EBITDA): {fmtFull(ebitda)}
            </label>
            <input
              type="range"
              min={0}
              max={2000000}
              step={10000}
              value={ebitda}
              onChange={(e) => setEbitda(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
              style={{
                background: `linear-gradient(to right, hsl(270 70% 55%) 0%, hsl(270 70% 55%) ${ebitdaPct}%, hsl(220 13% 91%) ${ebitdaPct}%, hsl(220 13% 91%) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mb-8">
              <span>$0</span>
              <span>$2M+</span>
            </div>

            {/* Pro Tip */}
            <div className="rounded-xl bg-[hsl(270,70%,55%,0.07)] border border-[hsl(270,70%,55%,0.15)] p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-[hsl(270,70%,55%)]" />
                <span className="text-sm font-bold text-foreground">Pro Tip</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Business valuations typically use 3-7x EBITDA multiples. Higher multiples apply to businesses with recurring revenue, strong growth, and market leadership.
              </p>
            </div>

            {/* Business Health Score */}
            <div className="rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[hsl(270,70%,55%)]" />
                  <span className="text-sm font-bold text-foreground">Business Health Score</span>
                </div>
                <span className="text-xs font-bold text-[hsl(160,70%,42%)]">Excellent</span>
              </div>

              <HealthDonut score={results.healthScore} />

              <p className="text-center text-xs text-[hsl(270,70%,55%)] font-semibold mt-3">
                Profit Margin: {results.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4">
            {/* Valuation card */}
            <div
              className="rounded-2xl p-6 text-white transition-all duration-500"
              style={{
                background: "linear-gradient(135deg, hsl(270 70% 55%) 0%, hsl(280 80% 60%) 100%)",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80 block mb-1">
                Estimated Valuation Range
              </span>
              <span className="text-4xl md:text-[2.8rem] font-extrabold block">
                {fmtK(animValuation)}
              </span>
              <span className="text-white/70 text-xs block mt-0.5">
                Range: {fmtK(animLow)} – {fmtK(animHigh)}
              </span>

              <MarginChart
                yourMargin={results.profitMargin}
                industryAvg={industryAvgMargin[industry]}
              />
            </div>

            {/* Features */}
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(270,70%,55%)] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Share */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadValuationEstimate({
                  industry,
                  revenue,
                  ebitda,
                  valuation: results.valuation,
                  low: results.low,
                  high: results.high,
                  profitMargin: results.profitMargin,
                  healthScore: results.healthScore,
                })}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity" style={{ background: "hsl(270 70% 55%)" }}
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity" style={{ background: "hsl(270 70% 55%)" }}>
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
            </div>

            {/* CTA */}
            <a
              href="/pricing"
              className="block w-full text-center py-3 rounded-xl border-2 font-bold text-sm hover:text-white transition-colors"
              style={{ borderColor: "hsl(270 70% 55%)", color: "hsl(270 70% 55%)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(270 70% 55%)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "hsl(270 70% 55%)"; }}
            >
              Get Professional Valuation
            </a>

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Starting from $2,500 + GST
              <br />
              Tailored to your business complexity
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessValuationPage;
