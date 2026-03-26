import React, { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

type GstMode = "add" | "remove";

const GSTCalculatorPage: React.FC = () => {
  const [amount, setAmount] = useState<string>("4565");
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

  const totalLabel = mode === "add" ? "Amount after GST" : "Amount before GST";
  const baseNum = parseFloat(amount) || 0;

  const chartData = [
    {
      name: totalLabel,
      value: mode === "add" ? parsed.total : parsed.total,
      color: "hsl(142, 71%, 45%)",
    },
    {
      name: "Amount",
      value: baseNum,
      color: "hsl(24, 95%, 53%)",
    },
  ];

  // For the stacked bar approach, let's use grouped bars
  const barData = [
    { name: totalLabel, amount: parsed.total },
    { name: "Amount", amount: baseNum },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Calculator Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Amount Input */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-primary-foreground/80 uppercase tracking-wider mb-1.5">
                Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={fmtInput(amount)}
                  onChange={(e) => setAmount(parseInput(e.target.value))}
                  className="w-full sm:w-48 px-3 py-2 rounded-lg border-2 border-primary-foreground/20 bg-primary-foreground text-foreground text-sm font-semibold focus:outline-none focus:border-primary-foreground/50 transition-all"
                />
              </div>
            </div>

            {/* Mode Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode("remove")}
                className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                  mode === "remove"
                    ? "bg-primary-foreground text-primary shadow-md"
                    : "bg-primary-foreground/15 text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/25"
                }`}
              >
                Subtract GST
              </button>
              <button
                onClick={() => setMode("add")}
                className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                  mode === "add"
                    ? "bg-primary-foreground text-primary shadow-md"
                    : "bg-primary-foreground/15 text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/25"
                }`}
              >
                Add GST
              </button>
            </div>

            {/* Clear */}
            <button
              onClick={() => { setAmount(""); setMode("add"); }}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors self-start sm:self-center"
              title="Clear"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M5 4V2.667A1.333 1.333 0 016.333 1.333h3.334A1.333 1.333 0 0111 2.667V4m2 0v9.333a1.333 1.333 0 01-1.333 1.334H4.333A1.333 1.333 0 013 13.333V4h10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Results Section */}
          <div className="p-6 sm:p-8">
            {/* Legend + Values */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: "hsl(var(--success))" }} />
                <span className="text-xs font-medium text-muted-foreground">{totalLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: "hsl(var(--cta))" }} />
                <span className="text-xs font-medium text-muted-foreground">Amount</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: "hsl(var(--primary))" }} />
                <span className="text-xs font-medium text-muted-foreground">GST Amount</span>
              </div>
            </div>

            {/* Big Numbers */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold" style={{ color: "hsl(var(--success))" }}>
                  {fmt(parsed.total)}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold" style={{ color: "hsl(var(--cta))" }}>
                  {fmt(baseNum)}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-primary">
                  {fmt(parsed.gst)}
                </p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="w-full h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    {
                      name: "With GST",
                      total: parsed.total,
                      base: baseNum,
                      gst: parsed.gst,
                    },
                    {
                      name: "Breakdown",
                      total: 0,
                      base: baseNum,
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
                  <Bar dataKey="total" stackId="a" fill="hsl(142, 71%, 45%)" radius={[4, 4, 4, 4]} barSize={28} name={totalLabel} />
                  <Bar dataKey="base" stackId="b" fill="hsl(24, 95%, 53%)" radius={[0, 0, 0, 0]} barSize={28} name="Amount" />
                  <Bar dataKey="gst" stackId="b" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} barSize={28} name="GST Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {mode === "add" ? "Adding" : "Removing"} 10% GST {mode === "add" ? "to" : "from"} ${amount ? parseFloat(amount).toLocaleString("en-AU") : "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculatorPage;
