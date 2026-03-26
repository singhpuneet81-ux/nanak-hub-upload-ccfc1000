import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, Info, ChevronDown, BarChart3, Zap, Globe, TrendingUp } from "lucide-react";

type GstMode = "add" | "remove";

const GSTCalculatorPage: React.FC = () => {
  const [amount, setAmount] = useState<string>("44545");
  const [mode, setMode] = useState<GstMode>("add");
  const [gstRate, setGstRate] = useState<string>("10");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const parsed = useMemo(() => {
    const num = parseFloat(amount) || 0;
    const rate = parseFloat(gstRate) || 0;
    const rateDecimal = rate / 100;
    if (mode === "add") {
      const gst = num * rateDecimal;
      return { total: num + gst, gst };
    }
    const gst = num - num / (1 + rateDecimal);
    return { total: num - gst, gst };
  }, [amount, mode, gstRate]);

  const fmt = (n: number) =>
    n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtInput = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };

  const parseInput = (val: string) => val.replace(/,/g, "");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Two-column layout: calculator left, info right */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT — Calculator Card */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  GST Calculator
                </h1>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2.667A1.333 1.333 0 016.333 1.333h3.334A1.333 1.333 0 0111 2.667V4m2 0v9.333a1.333 1.333 0 01-1.333 1.334H4.333A1.333 1.333 0 013 13.333V4h10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Starting amount */}
              <label className="block text-sm font-medium text-foreground mb-1.5">Starting amount</label>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              {/* Add or remove */}
              <label className="block text-sm font-medium text-foreground mb-1.5">Add or remove</label>
              <div className="relative mb-4">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  <span>{mode === "add" ? "Add GST" : "Remove GST"}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setMode("add"); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${mode === "add" ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}
                    >
                      Add GST
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode("remove"); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${mode === "remove" ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}
                    >
                      Remove GST
                    </button>
                  </div>
                )}
              </div>

              {/* GST percentage */}
              <label className="block text-sm font-medium text-foreground mb-1.5">GST percentage</label>
              <div className="relative mb-6">
                <input
                  type="text"
                  inputMode="decimal"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-full pr-8 pl-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>

              {/* Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                  <span className="text-sm font-medium text-primary">
                    {mode === "add" ? "Amount after GST" : "Amount before GST"}
                  </span>
                  <span className="text-lg font-bold text-foreground">${fmt(parsed.total)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: "hsl(var(--success-light))" }}>
                  <span className="text-sm font-medium" style={{ color: "hsl(var(--success))" }}>GST amount</span>
                  <span className="text-lg font-bold" style={{ color: "hsl(var(--cta))" }}>${fmt(parsed.gst)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                © {mode === "add" ? "Adding" : "Removing"} {gstRate}% GST {mode === "add" ? "to" : "from"} ${amount ? parseFloat(amount).toLocaleString("en-AU") : "0"}
              </p>
            </div>
          </div>

          {/* RIGHT — Info sections */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* What is GST */}
            <InfoCard
              color="orange"
              icon={<Info className="w-5 h-5" />}
              title="What is GST?"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                GST (Goods and Services Tax) is a broad-based tax of <strong className="text-foreground">10%</strong> on most goods, services, and other items sold or consumed in Australia.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Businesses registered for GST add 10% to the price of most goods and services, collect it from customers, and remit it to the Australian Taxation Office (ATO).
              </p>
            </InfoCard>

            {/* How to use */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-primary">📘</span> How to Use This Calculator
              </h2>
              <div className="space-y-3">
                {[
                  { step: "1", label: "Enter Starting Amount", desc: "Type the base amount before/after GST" },
                  { step: "2", label: "Choose Add or Remove", desc: "Select whether to add GST to a price or remove it from a GST-inclusive price" },
                  { step: "3", label: "Set GST Rate", desc: "The default Australian GST rate is 10% (pre-filled)" },
                  { step: "4", label: "View Results", desc: "See the GST amount and total amount instantly" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GST Registration Threshold */}
            <InfoCard
              color="yellow"
              icon={<DollarSign className="w-5 h-5" />}
              title="GST Registration Threshold"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                You must register for GST if your business or enterprise has a GST turnover (gross income minus GST) of <strong className="text-foreground">$75,000 or more</strong>.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                For non-profit organisations, the threshold is <strong className="text-foreground">$150,000 or more</strong>.
              </p>
            </InfoCard>

            {/* GST Calculation Features */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> GST Calculation Features
              </h2>
              <div className="space-y-3">
                {[
                  { icon: <TrendingUp className="w-4 h-4" />, label: "Add GST to Prices", desc: "Calculate GST-inclusive prices for invoicing", color: "text-primary" },
                  { icon: <BarChart3 className="w-4 h-4" />, label: "Remove GST from Prices", desc: "Extract the GST component for reporting", color: "hsl(var(--success))" },
                  { icon: <Globe className="w-4 h-4" />, label: "Custom GST Rates", desc: "Support for Australian and international rates", color: "hsl(var(--cta))" },
                  { icon: <Zap className="w-4 h-4" />, label: "Instant Calculations", desc: "Real-time updates as you type", color: "text-purple-500" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`${typeof f.color === "string" && f.color.startsWith("text-") ? f.color : ""}`} style={!f.color.startsWith("text-") ? { color: f.color } : {}}>
                      {f.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common GST Scenarios */}
            <InfoCard
              color="purple"
              icon={<Calculator className="w-5 h-5" />}
              title="Common GST Scenarios"
            >
              <div className="space-y-4">
                <ScenarioCard
                  title="Creating an Invoice"
                  desc="Your product costs $1,000 ex-GST"
                  formula="Add GST: $1,000 × 1.10 = $1,100"
                  accent="primary"
                />
                <ScenarioCard
                  title="BAS Reporting"
                  desc="Total sales including GST: $11,000"
                  formula="Remove GST: $11,000 ÷ 1.1 = $10,000 + $1,000 GST"
                  accent="success"
                />
                <ScenarioCard
                  title="Purchase Analysis"
                  desc="Supplier invoice: $5,500 GST-inclusive"
                  formula="GST Component: $5,500 ÷ 11 = $500 (input tax credit)"
                  accent="cta"
                />
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Reusable coloured info card */
const InfoCard: React.FC<{
  color: "orange" | "yellow" | "purple";
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ color, icon, title, children }) => {
  const borderMap = { orange: "border-l-[hsl(var(--cta))]", yellow: "border-l-yellow-400", purple: "border-l-purple-500" };
  const iconBg = { orange: "bg-[hsl(var(--cta))]/10 text-[hsl(var(--cta))]", yellow: "bg-yellow-50 text-yellow-600", purple: "bg-purple-50 text-purple-600" };

  return (
    <div className={`bg-card rounded-2xl border border-border border-l-4 ${borderMap[color]} p-6`}>
      <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
        <span className={`p-1.5 rounded-lg ${iconBg[color]}`}>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
};

/* Scenario example block */
const ScenarioCard: React.FC<{ title: string; desc: string; formula: string; accent: string }> = ({
  title, desc, formula, accent,
}) => {
  const bgMap: Record<string, string> = {
    primary: "bg-primary/5 border-primary/20",
    success: "bg-[hsl(var(--success-light))] border-[hsl(var(--success))]/20",
    cta: "bg-[hsl(var(--cta))]/5 border-[hsl(var(--cta))]/20",
  };

  return (
    <div className={`rounded-lg border p-3 ${bgMap[accent] || bgMap.primary}`}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <p className="text-xs font-medium mt-1" style={{ color: accent === "cta" ? "hsl(var(--cta))" : accent === "success" ? "hsl(var(--success))" : "hsl(var(--primary))" }}>
        {formula}
      </p>
    </div>
  );
};

export default GSTCalculatorPage;
