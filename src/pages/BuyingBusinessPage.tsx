import React, { useState, useMemo } from "react";
import { Calculator, CheckCircle2, Download, Mail, Lightbulb, DollarSign, AlertTriangle } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { downloadBuyingEstimate } from "@/utils/downloadEstimate";

/* ── Purchase structure config ── */
const structures = [
  { id: "asset", label: "Asset Purchase", desc: "Tax efficient" },
  { id: "share", label: "Share Purchase", desc: "Includes liabilities" },
] as const;

type StructureId = (typeof structures)[number]["id"];

const STAMP_DUTY = 25000;
const DUE_DILIGENCE = 8500;

function calculate(price: number, revenue: number, ebitda: number, structure: StructureId) {
  const profitMultiple = ebitda > 0 ? +(price / ebitda).toFixed(1) : 0;
  const annualROI = price > 0 ? Math.round((ebitda / price) * 100) : 0;
  const paybackYears = ebitda > 0 ? +(price / ebitda).toFixed(1) : 0;
  const stampDuty = structure === "share" ? STAMP_DUTY : 0;
  const totalInvestment = price + DUE_DILIGENCE + stampDuty;
  return { profitMultiple, annualROI, paybackYears, stampDuty, totalInvestment };
}

const fmtFull = (n: number) => "$" + n.toLocaleString("en-AU");

const BuyingBusinessPage: React.FC = () => {
  const [structure, setStructure] = useState<StructureId>("asset");
  const [price, setPrice] = useState(500000);
  const [revenue, setRevenue] = useState(800000);
  const [ebitda, setEbitda] = useState(150000);

  const results = useMemo(() => calculate(price, revenue, ebitda, structure), [price, revenue, ebitda, structure]);

  const animTotal = useAnimatedNumber(results.totalInvestment);
  const animROI = useAnimatedNumber(results.annualROI);
  const animStamp = useAnimatedNumber(results.stampDuty);

  const pricePct = ((price - 100000) / (5000000 - 100000)) * 100;
  const revPct = ((revenue - 100000) / (10000000 - 100000)) * 100;
  const ebitdaPct = ((ebitda - 20000) / (2000000 - 20000)) * 100;

  /* ── Insights ── */
  const insights: { icon: React.ReactNode; title: string; text: string; bg: string }[] = [];
  if (structure === "share") {
    insights.push({
      icon: <DollarSign className="w-4 h-4 text-[hsl(25,95%,53%)]" />,
      title: "Stamp Duty Alert",
      text: "Share purchase triggers $25K stamp duty. Asset purchase may be more tax efficient.",
      bg: "bg-[hsl(25,95%,53%,0.08)]",
    });
  }
  if (results.annualROI >= 20) {
    insights.push({
      icon: <CheckCircle2 className="w-4 h-4 text-[hsl(160,70%,42%)]" />,
      title: "Strong ROI Potential",
      text: `${results.annualROI}% annual ROI is excellent if numbers are verified. Due diligence is critical to confirm.`,
      bg: "bg-[hsl(160,70%,42%,0.08)]",
    });
  } else {
    insights.push({
      icon: <AlertTriangle className="w-4 h-4 text-[hsl(45,93%,47%)]" />,
      title: "Moderate ROI",
      text: `${results.annualROI}% annual ROI — consider negotiating a lower purchase price or verifying growth potential.`,
      bg: "bg-[hsl(45,93%,47%,0.08)]",
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-10 pb-4 md:pt-16 md:pb-6">
        <div className="inline-flex items-center gap-2 border border-border text-foreground text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wide">
          <Calculator className="w-3.5 h-3.5 text-[hsl(25,95%,53%)]" />
          Interactive Calculator
        </div>
        <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-extrabold text-foreground text-center max-w-2xl mb-3 leading-tight tracking-tight">
          Quick Valuation Estimate
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-[0.95rem] max-w-lg mb-10 leading-relaxed font-normal">
          Get instant insights on your potential business acquisition
        </p>
      </section>

      {/* Main card */}
      <section className="flex-1 flex justify-center px-4 pb-16">
        <div className="w-full max-w-5xl bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
            {/* Left */}
            <div>
              {/* Purchase Structure */}
              <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground mb-3 block">
                Purchase Structure
              </label>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {structures.map((s) => {
                  const active = structure === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStructure(s.id)}
                      className={`relative flex flex-col items-center gap-0.5 py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                        active
                          ? "border-[hsl(25,95%,53%)] bg-[hsl(25,95%,53%,0.06)]"
                          : "border-border hover:border-[hsl(25,95%,53%,0.3)]"
                      }`}
                    >
                      {active && (
                        <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-[hsl(25,95%,53%)]" />
                      )}
                      <span className={`text-sm font-bold ${active ? "text-[hsl(25,95%,53%)]" : "text-foreground"}`}>
                        {s.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{s.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Purchase Price */}
              <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground mb-1 block">
                Purchase Price
              </label>
              <span className="text-xl font-extrabold text-[hsl(25,95%,53%)] block mb-2">{fmtFull(price)}</span>
              <input
                type="range"
                min={100000}
                max={5000000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
                style={{
                  background: `linear-gradient(to right, hsl(25 95% 53%) 0%, hsl(25 95% 53%) ${pricePct}%, hsl(220 13% 91%) ${pricePct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>$100K</span>
                <span>$5M</span>
              </div>

              {/* Annual Revenue */}
              <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground mb-1 block">
                Annual Revenue
              </label>
              <span className="text-xl font-extrabold text-[hsl(25,95%,53%)] block mb-2">{fmtFull(revenue)}</span>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={50000}
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
                style={{
                  background: `linear-gradient(to right, hsl(25 95% 53%) 0%, hsl(25 95% 53%) ${revPct}%, hsl(220 13% 91%) ${revPct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>$100K</span>
                <span>$10M</span>
              </div>

              {/* Annual Profit (EBITDA) */}
              <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground mb-1 block">
                Annual Profit (EBITDA)
              </label>
              <span className="text-xl font-extrabold text-[hsl(25,95%,53%)] block mb-2">{fmtFull(ebitda)}</span>
              <input
                type="range"
                min={20000}
                max={2000000}
                step={10000}
                value={ebitda}
                onChange={(e) => setEbitda(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer mb-1"
                style={{
                  background: `linear-gradient(to right, hsl(25 95% 53%) 0%, hsl(25 95% 53%) ${ebitdaPct}%, hsl(220 13% 91%) ${ebitdaPct}%, hsl(220 13% 91%) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-6">
                <span>$20K</span>
                <span>$2M</span>
              </div>
            </div>

            {/* Right – Valuation Metrics */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3 block text-right">
                Valuation Metrics
              </label>
              <div className="flex flex-col gap-3">
                {/* Profit Multiple */}
                <div className="rounded-xl border border-border p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block mb-0.5">
                    Profit Multiple
                  </span>
                  <span className="text-2xl font-extrabold text-foreground">{results.profitMultiple}x</span>
                  <span className="text-[11px] text-muted-foreground block">Industry avg: 2-4x</span>
                </div>

                {/* Annual ROI */}
                <div className="rounded-xl border border-border p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block mb-0.5">
                    Annual ROI
                  </span>
                  <span className="text-2xl font-extrabold text-foreground">{animROI}%</span>
                  <span className="text-[11px] text-muted-foreground block">Payback: {results.paybackYears} years</span>
                </div>

                {/* Due Diligence Cost */}
                <div className="rounded-xl border border-border p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground block mb-0.5">
                    Due Diligence Cost
                  </span>
                  <span className="text-2xl font-extrabold text-foreground">{fmtFull(DUE_DILIGENCE)}</span>
                  <span className="text-[11px] text-muted-foreground block">Recommended package</span>
                </div>

                {/* Stamp Duty (share only) */}
                {structure === "share" && (
                  <div className="rounded-xl border border-[hsl(25,95%,53%,0.3)] bg-[hsl(25,95%,53%,0.05)] p-4 animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(25,95%,53%)] block mb-0.5">
                      Stamp Duty
                    </span>
                    <span className="text-2xl font-extrabold text-foreground">{fmtFull(animStamp)}</span>
                    <span className="text-[11px] text-muted-foreground block">Share purchase only</span>
                  </div>
                )}

                {/* Total Investment */}
                <div
                  className="rounded-xl p-4 text-white"
                  style={{
                    background: "linear-gradient(135deg, hsl(10 90% 55%) 0%, hsl(25 95% 53%) 100%)",
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 block mb-0.5">
                    Total Investment
                  </span>
                  <span className="text-2xl font-extrabold">{fmtFull(animTotal)}</span>
                  <span className="text-[11px] text-white/70 block">Including all costs</span>
                </div>

                {/* Buttons */}
                <button
                  onClick={() => downloadBuyingEstimate({
                    structure,
                    price,
                    revenue,
                    ebitda,
                    profitMultiple: results.profitMultiple,
                    annualROI: results.annualROI,
                    paybackYears: results.paybackYears,
                    stampDuty: results.stampDuty,
                    dueDiligence: DUE_DILIGENCE,
                    totalInvestment: results.totalInvestment,
                  })}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: "hsl(220 25% 17%)" }}
                >
                  <Download className="w-4 h-4" /> Download Estimate
                </button>
                <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-foreground border border-border transition-colors hover:bg-muted">
                  <Mail className="w-4 h-4" /> Email Results
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-border my-8" />

          {/* Insights */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-[hsl(25,95%,53%)]" />
              <span className="text-sm font-bold text-foreground">Smart Insights Based on Your Inputs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((ins, i) => (
                <div key={i} className={`${ins.bg} rounded-xl p-4 animate-fade-in`}>
                  <div className="flex items-center gap-2 mb-1">
                    {ins.icon}
                    <span className="text-sm font-bold text-foreground">{ins.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <hr className="border-border my-6" />
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-foreground block mb-0.5">Conservative Estimates</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                These calculations provide indicative estimates only. Actual valuation and costs depend on comprehensive due diligence. Industry multiples vary by sector, location, and business specifics. Always conduct professional due diligence before committing to any acquisition.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyingBusinessPage;
