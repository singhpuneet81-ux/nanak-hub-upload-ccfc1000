import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type GstMode = "add" | "remove";
type GstRate = "10" | "custom";

const GSTCalculatorPage: React.FC = () => {
  const [amount, setAmount] = useState<string>("60000");
  const [mode, setMode] = useState<GstMode>("add");
  const [rateType, setRateType] = useState<GstRate>("10");
  const [customRate, setCustomRate] = useState<string>("10");

  const rate = rateType === "10" ? 10 : parseFloat(customRate) || 0;

  const parsed = useMemo(() => {
    const num = parseFloat(amount) || 0;
    const r = rate / 100;
    if (mode === "add") {
      const gst = num * r;
      return { base: num, total: num + gst, gst };
    }
    const gst = num - num / (1 + r);
    return { base: num, total: num - gst, gst };
  }, [amount, mode, rate]);

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtInput = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };

  const parseInput = (val: string) => val.replace(/,/g, "");
  const baseNum = parseFloat(amount) || 0;

  const handleCopy = () => {
    const text = `${mode === "add" ? "Adding" : "Removing"} ${rate}% GST ${mode === "add" ? "to" : "from"} ${fmt(baseNum)} | Total: ${fmt(mode === "add" ? parsed.total : parsed.total)} | GST: ${fmt(parsed.gst)}`;
    navigator.clipboard.writeText(text);
  };

  const afterGstValue = mode === "add" ? parsed.total : parsed.total;
  const barBase = mode === "add" ? baseNum : parsed.total;
  const barGst = parsed.gst;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">

          {/* ── Enter Amount ── */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Enter Amount
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={fmtInput(amount)}
                  onChange={(e) => setAmount(parseInput(e.target.value))}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-border bg-background text-2xl font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <button
                onClick={() => setAmount("")}
                className="px-5 py-3.5 rounded-xl border-2 border-border bg-background text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* ── Select Operation ── */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Select Operation
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("add")}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  mode === "add"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border-2 border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                + Add GST
              </button>
              <button
                onClick={() => setMode("remove")}
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  mode === "remove"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border-2 border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                — Subtract GST
              </button>
            </div>
          </div>

          {/* ── GST Rate ── */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              GST Rate
            </label>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setRateType("10")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  rateType === "10"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border-2 border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                10%
              </button>
              <button
                onClick={() => setRateType("custom")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  rateType === "custom"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border-2 border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                Custom
              </button>
              {rateType === "custom" && (
                <div className="relative ml-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-20 px-3 py-2.5 rounded-xl border-2 border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all text-center"
                    placeholder="15"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">%</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Results Cards ── */}
          <div className="grid grid-cols-3 gap-3">
            {/* After GST */}
            <div className="rounded-xl border border-border overflow-hidden bg-background">
              <div className="h-1 w-full bg-success" />
              <div className="p-3 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "hsl(var(--success))" }}>
                  {mode === "add" ? "After GST" : "Net Amount"}
                </p>
                <p className="text-base sm:text-lg font-extrabold" style={{ color: "hsl(var(--success))" }}>
                  {fmt(afterGstValue)}
                </p>
              </div>
            </div>

            {/* Base Amount */}
            <div className="rounded-xl border border-border overflow-hidden bg-background">
              <div className="h-1 w-full" style={{ background: "hsl(var(--cta))" }} />
              <div className="p-3 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "hsl(var(--cta))" }}>
                  Base Amount
                </p>
                <p className="text-base sm:text-lg font-extrabold" style={{ color: "hsl(var(--cta))" }}>
                  {fmt(baseNum)}
                </p>
              </div>
            </div>

            {/* GST Amount */}
            <div className="rounded-xl border border-border overflow-hidden bg-background">
              <div className="h-1 w-full bg-primary" />
              <div className="p-3 pt-3">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                  GST Amount
                </p>
                <p className="text-base sm:text-lg font-extrabold text-primary">
                  {fmt(parsed.gst)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Visual Breakdown ── */}
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Visual Breakdown
            </label>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                {mode === "add" ? "After GST" : "Net"}
              </span>
              <div className="flex-1 h-10 rounded-lg overflow-hidden flex">
                <div
                  className="h-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    width: `${(barBase / (barBase + barGst)) * 100}%`,
                    background: "hsl(var(--cta))",
                    minWidth: "60px",
                  }}
                >
                  Base: {fmt(barBase)}
                </div>
                <div
                  className="h-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    width: `${(barGst / (barBase + barGst)) * 100}%`,
                    background: "hsl(var(--primary))",
                    minWidth: barGst > 0 ? "60px" : "0px",
                  }}
                >
                  {barGst > 0 && `GST: ${fmt(barGst)}`}
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 justify-end">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--cta))" }} />
                <span className="text-[11px] text-muted-foreground font-medium">Base Amount</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[11px] text-muted-foreground font-medium">GST {mode === "add" ? "Added" : "Removed"}</span>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="rounded-xl border border-border bg-background px-5 py-3.5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              {mode === "add" ? "Adding" : "Removing"} {rate}% GST {mode === "add" ? "to" : "from"} {fmt(baseNum)}
            </p>
            <span className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              {rate}% GST
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculatorPage;
