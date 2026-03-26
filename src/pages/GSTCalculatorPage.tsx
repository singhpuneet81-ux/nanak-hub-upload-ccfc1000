import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type GstMode = "add" | "remove";

const GSTCalculatorPage: React.FC = () => {
  const [amount, setAmount] = useState<string>("60000");
  const [mode, setMode] = useState<GstMode>("add");

  const parsed = useMemo(() => {
    const num = parseFloat(amount) || 0;
    if (mode === "add") {
      const gst = num * 0.1;
      return { base: num, total: num + gst, gst };
    }
    const gst = num - num / 1.1;
    return { base: num, total: num - gst, gst };
  }, [amount, mode]);

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
  const totalLabel = mode === "add" ? "GST" : "GST";

  const handleCopy = () => {
    const text = `${mode === "add" ? "Adding" : "Removing"} 10% GST ${mode === "add" ? "to" : "from"} ${fmt(baseNum)} | Total: ${fmt(parsed.total)} | GST: ${fmt(parsed.gst)}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

          {/* ── Header: Amount Input ── */}
          <div className="px-6 pt-6 pb-4">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Enter Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-foreground">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={fmtInput(amount)}
                onChange={(e) => setAmount(parseInput(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-background text-2xl font-bold text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* ── Operation Toggle ── */}
          <div className="px-6 pb-5">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Select Operation
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("remove")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                  mode === "remove"
                    ? "bg-success text-success-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                − Subtract
              </button>
              <button
                onClick={() => setMode("add")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
                  mode === "add"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                + Add GST
              </button>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-border" />

          {/* ── Results Cards ── */}
          <div className="px-6 pt-5 pb-4">
            <div className="grid grid-cols-3 gap-3">
              {/* GST Total */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="h-1.5 w-full" style={{ background: "hsl(var(--success))" }} />
                <div className="p-3 pt-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {mode === "add" ? "Total" : "Net Amount"}
                  </p>
                  <p className="text-base sm:text-lg font-extrabold" style={{ color: "hsl(var(--success))" }}>
                    {fmt(mode === "add" ? parsed.total : parsed.total)}
                  </p>
                </div>
              </div>

              {/* Cost Amount */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="h-1.5 w-full" style={{ background: "hsl(var(--cta))" }} />
                <div className="p-3 pt-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Cost Amount
                  </p>
                  <p className="text-base sm:text-lg font-extrabold" style={{ color: "hsl(var(--cta))" }}>
                    {fmt(baseNum)}
                  </p>
                </div>
              </div>

              {/* GST Amount */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="h-1.5 w-full" style={{ background: "hsl(var(--primary))" }} />
                <div className="p-3 pt-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    GST Amount
                  </p>
                  <p className="text-base sm:text-lg font-extrabold text-primary">
                    {fmt(parsed.gst)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Final Amount Banner ── */}
          <div className="mx-6 mb-4 rounded-xl overflow-hidden" style={{ background: "hsl(var(--success))" }}>
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-xs font-bold uppercase tracking-widest text-success-foreground/80">
                Final Amount
              </span>
              <span className="text-xl font-extrabold text-success-foreground">
                {fmt(mode === "add" ? parsed.total : parsed.total)}
              </span>
            </div>
          </div>

          {/* ── Bar Chart ── */}
          <div className="px-6 pb-2">
            <div className="w-full h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    {
                      name: "Total",
                      total: mode === "add" ? parsed.total : baseNum,
                      base: 0,
                      gst: 0,
                    },
                    {
                      name: "Breakdown",
                      total: 0,
                      base: mode === "add" ? baseNum : parsed.total,
                      gst: parsed.gst,
                    },
                  ]}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) =>
                      "$" + v.toLocaleString("en-AU", { maximumFractionDigits: 0 })
                    }
                    tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
                    axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
                    tickLine={false}
                  />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    formatter={(value: number) => fmt(value)}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(220, 13%, 91%)",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="total" stackId="a" fill="hsl(142, 71%, 45%)" radius={[4, 4, 4, 4]} barSize={24} name="Total" />
                  <Bar dataKey="base" stackId="b" fill="hsl(24, 95%, 53%)" radius={[4, 0, 0, 4]} barSize={24} name="Amount" />
                  <Bar dataKey="gst" stackId="b" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} barSize={24} name="GST" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {mode === "add" ? "Adding" : "Removing"} 10% GST {mode === "add" ? "to" : "from"} {fmt(baseNum)}
            </p>
            <button
              onClick={handleCopy}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculatorPage;
