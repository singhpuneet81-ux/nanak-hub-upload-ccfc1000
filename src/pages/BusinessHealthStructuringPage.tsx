import React, { useState, useMemo } from "react";
import {
  DollarSign,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  Shield,
  Users,
  BarChart2,
  Download,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Building2,
  Briefcase,
  Heart,
  Zap,
  UserCheck,
  PiggyBank,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type RiskLevel = "conservative" | "balanced" | "growth";
type GoalId =
  | "reduce_tax"
  | "protect_assets"
  | "family_wealth"
  | "retain_profits"
  | "bring_investors"
  | "keep_compliance"
  | "distribute_income";

interface AssessmentData {
  income: number;
  goals: GoalId[];
  risk: RiskLevel;
}

// ─── Goals config ─────────────────────────────────────────────────────────────
const GOALS: { id: GoalId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "reduce_tax", label: "Reduce tax legally", icon: DollarSign },
  { id: "protect_assets", label: "Protect personal assets", icon: Shield },
  { id: "family_wealth", label: "Plan for family wealth", icon: Heart },
  { id: "retain_profits", label: "Retain profits in business", icon: PiggyBank },
  { id: "bring_investors", label: "Bring in investors later", icon: Building2 },
  { id: "keep_compliance", label: "Keep compliance simple", icon: Zap },
  { id: "distribute_income", label: "Distribute income to spouse", icon: UserCheck },
];

// ─── Scoring engine ────────────────────────────────────────────────────────────
function computeScores(data: AssessmentData) {
  let soleTrader = 30;
  let company = 40;
  let trust = 30;

  // Income influence
  if (data.income > 300000) {
    soleTrader -= 15;
    company += 5;
    trust += 10;
  }
  if (data.income > 600000) {
    soleTrader -= 10;
    trust += 10;
  }

  // Goals influence
  for (const g of data.goals) {
    if (g === "reduce_tax") {
      trust += 10;
      company += 5;
      soleTrader -= 5;
    }
    if (g === "protect_assets") {
      trust += 10;
      company += 5;
      soleTrader -= 10;
    }
    if (g === "family_wealth") {
      trust += 15;
      soleTrader -= 5;
    }
    if (g === "retain_profits") {
      company += 10;
      trust += 5;
    }
    if (g === "bring_investors") {
      company += 15;
      trust -= 5;
      soleTrader -= 10;
    }
    if (g === "keep_compliance") {
      soleTrader += 15;
      company -= 5;
      trust -= 10;
    }
    if (g === "distribute_income") {
      trust += 10;
      company += 3;
    }
  }

  // Risk influence
  if (data.risk === "conservative") {
    soleTrader += 10;
    company -= 5;
    trust -= 5;
  }
  if (data.risk === "balanced") {
    company += 5;
  }
  if (data.risk === "growth") {
    company += 10;
    trust += 5;
    soleTrader -= 15;
  }

  // Clamp
  const clamp = (v: number) => Math.max(5, Math.min(100, v));
  soleTrader = clamp(soleTrader);
  company = clamp(company);
  trust = clamp(trust);

  const total = soleTrader + company + trust;
  const pct = (v: number) => Math.round((v / total) * 100);

  return {
    soleTrader: pct(soleTrader),
    company: pct(company),
    trust: pct(trust),
  };
}

function getRecommendation(data: AssessmentData) {
  const scores = computeScores(data);
  const max = Math.max(scores.soleTrader, scores.company, scores.trust);

  if (max === scores.trust) {
    return {
      type: "Family Trust",
      subtitle: "Wealth & Protection",
      icon: Heart,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      taxFlexibility: "High",
      assetProtection: "Strong",
      bestFor: "High Income & Families",
      pros: ["Income splitting", "Strong asset protection", "Estate planning", "Tax flexibility"],
      cons: ["Higher setup cost", "More compliance", "Complex to manage", "Distribution rules"],
      setupCost: "$1,500 – $3,500",
      annualCost: "$2,000 – $4,000",
      scores,
    };
  }
  if (max === scores.company) {
    return {
      type: "Company",
      subtitle: "Growth & Investment",
      icon: Building2,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      taxFlexibility: "Medium",
      assetProtection: "Good",
      bestFor: "Growth & Investors",
      pros: ["Fixed 25% tax rate", "Investor-ready", "Asset separation", "Retained earnings"],
      cons: ["No income splitting", "Dividend rules", "Annual ASIC fees", "Complex reporting"],
      setupCost: "$800 – $1,500",
      annualCost: "$1,500 – $3,000",
      scores,
    };
  }
  return {
    type: "Sole Trader",
    subtitle: "Simple & Direct",
    icon: UserCheck,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    taxFlexibility: "Low",
    assetProtection: "Weak",
    bestFor: "Freelancers & Side Hustles",
    pros: ["Simplest structure", "Low setup costs", "Full control", "Minimal compliance"],
    cons: ["No asset protection", "No tax planning", "Personal liability", "Hard to scale"],
    setupCost: "$0 – $500",
    annualCost: "$0 – $800",
    scores,
  };
}

function getTaxBracket(income: number) {
  if (income > 180000) return { label: "Top Tax Bracket (45%)", rate: 45 };
  if (income > 120000) return { label: "High Tax Bracket (37%)", rate: 37 };
  if (income > 45000) return { label: "Mid Tax Bracket (32.5%)", rate: 32.5 };
  return { label: "Lower Tax Bracket (19%)", rate: 19 };
}

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtFull(n: number) {
  return "$" + n.toLocaleString("en-AU");
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Income", "Goals", "Risk"];

const StepperBar: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEP_LABELS.map((label, i) => {
      const num = i + 1;
      const done = num < step;
      const active = num === step;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                done
                  ? "bg-[hsl(var(--cta))] text-white"
                  : active
                    ? "bg-[hsl(var(--cta))] text-white ring-4 ring-[hsl(var(--cta)/0.2)]"
                    : "bg-white border-2 border-border text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 size={18} /> : num}
            </div>
            <span
              className={`mt-1 text-xs font-medium ${
                active ? "text-[hsl(var(--cta))]" : done ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`h-0.5 w-16 sm:w-24 mb-5 transition-colors ${done ? "bg-[hsl(var(--cta))]" : "bg-border"}`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Step 1: Income ────────────────────────────────────────────────────────────
const Step1: React.FC<{
  income: number;
  setIncome: (v: number) => void;
  onNext: () => void;
}> = ({ income, setIncome, onNext }) => {
  const pct = ((income - 50000) / (2000000 - 50000)) * 100;
  const bracket = getTaxBracket(income);
  const isHighIncome = income >= 200000;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
        <DollarSign className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">What is your annual business income?</h2>
      <p className="text-sm text-[hsl(var(--cta))] mb-8">This helps us understand your tax position</p>

      <span className="text-4xl font-extrabold text-foreground mb-6">{fmtFull(income)}</span>

      <div className="w-full mb-2">
        <input
          type="range"
          min={50000}
          max={2000000}
          step={10000}
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${pct}%, hsl(220 13% 88%) ${pct}%, hsl(220 13% 88%) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$50k</span>
          <span>$2M+</span>
        </div>
      </div>

      {isHighIncome && (
        <div className="w-full mt-6 flex items-start gap-2 p-3 rounded-xl bg-orange-50 border border-orange-200 text-left">
          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700">
            High income earner: You could benefit significantly from proper structuring to reduce tax and protect
            assets.
          </p>
        </div>
      )}

      <div className="w-full mt-4 p-3 rounded-xl bg-muted/40 border border-border text-left">
        <p className="text-xs text-muted-foreground">
          Current bracket: <span className="font-semibold text-foreground">{bracket.label}</span>
        </p>
      </div>

      <button
        onClick={onNext}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
        style={{ background: "hsl(var(--cta))" }}
      >
        Continue <ChevronRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 2: Goals ─────────────────────────────────────────────────────────────
const Step2: React.FC<{
  goals: GoalId[];
  setGoals: (g: GoalId[]) => void;
  income: number;
  onNext: () => void;
  onBack: () => void;
}> = ({ goals, setGoals, income, onNext, onBack }) => {
  const toggle = (id: GoalId) => {
    setGoals(goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id]);
  };

  const scores = useMemo(() => computeScores({ income, goals, risk: "balanced" }), [income, goals]);

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
          <Target className="w-7 h-7 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">What are your key goals?</h2>
        <p className="text-sm text-[hsl(var(--cta))]">Select all that apply (this is where the magic happens)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {GOALS.map((g) => {
          const active = goals.includes(g.id);
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                active
                  ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.06)] text-[hsl(var(--cta))]"
                  : "border-border bg-white hover:border-[hsl(var(--cta)/0.4)] text-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? "bg-[hsl(var(--cta))] text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1">{g.label}</span>
              {active && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 mb-6">
        <p className="text-xs font-bold text-foreground mb-3">Live Structure Match Preview</p>
        {[
          { label: "Sole Trader", pct: scores.soleTrader, color: "#3b82f6" },
          { label: "Company", pct: scores.company, color: "hsl(var(--cta))" },
          { label: "Trust", pct: scores.trust, color: "#a855f7" },
        ].map((row) => (
          <div key={row.label} className="mb-2">
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-bold" style={{ color: row.color }}>
                {row.pct}%
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${row.pct}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={goals.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "hsl(var(--cta))" }}
        >
          Continue <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 3: Risk ──────────────────────────────────────────────────────────────
const RISKS: { id: RiskLevel; label: string; sub: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "conservative", label: "Conservative", sub: "Priority on simplicity and minimal risk", icon: Shield },
  { id: "balanced", label: "Balanced", sub: "Mix of protection and growth potential", icon: Target },
  { id: "growth", label: "Growth-Focused", sub: "Willing to handle complexity for better outcomes", icon: TrendingUp },
];

const Step3: React.FC<{
  risk: RiskLevel;
  setRisk: (r: RiskLevel) => void;
  onViewResults: () => void;
  onBack: () => void;
}> = ({ risk, setRisk, onViewResults, onBack }) => (
  <div>
    <div className="flex flex-col items-center text-center mb-8">
      <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
        <TrendingUp className="w-7 h-7 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">What's your risk appetite?</h2>
      <p className="text-sm text-muted-foreground">How do you approach business decisions?</p>
    </div>

    <div className="flex flex-col gap-3 mb-8">
      {RISKS.map((r) => {
        const active = risk === r.id;
        const Icon = r.icon;
        return (
          <button
            key={r.id}
            onClick={() => setRisk(r.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              active
                ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.06)]"
                : "border-border bg-white hover:border-[hsl(var(--cta)/0.4)]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                active ? "bg-[hsl(var(--cta))] text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${active ? "text-foreground" : "text-foreground"}`}>{r.label}</p>
              <p className={`text-xs mt-0.5 ${active ? "text-[hsl(var(--cta))]" : "text-muted-foreground"}`}>{r.sub}</p>
            </div>
            {active && <CheckCircle2 className="w-5 h-5 text-[hsl(var(--cta))] shrink-0" />}
          </button>
        );
      })}
    </div>

    <div className="flex gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
      >
        <ChevronLeft size={16} /> Back
      </button>
      <button
        onClick={onViewResults}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
        style={{ background: "hsl(var(--cta))" }}
      >
        View Results <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

// ─── Results ───────────────────────────────────────────────────────────────────
const COMPARISON_ROWS = [
  {
    label: "Tax Flexibility",
    soleTrader: { val: "Low", color: "text-orange-500" },
    company: { val: "Medium", color: "text-blue-500" },
    trust: { val: "High", color: "text-green-600" },
  },
  {
    label: "Asset Protection",
    soleTrader: { val: "Weak", color: "text-red-500" },
    company: { val: "Good", color: "text-blue-500" },
    trust: { val: "Strong", color: "text-green-600" },
  },
  {
    label: "Setup Cost",
    soleTrader: { val: "Low", color: "text-green-600" },
    company: { val: "Medium", color: "text-blue-500" },
    trust: { val: "High", color: "text-orange-500" },
  },
  {
    label: "Compliance",
    soleTrader: { val: "Simple", color: "text-green-600" },
    company: { val: "Moderate", color: "text-blue-500" },
    trust: { val: "Complex", color: "text-orange-500" },
  },
  {
    label: "Best For",
    soleTrader: { val: "Freelancers", color: "text-blue-500" },
    company: { val: "Growth", color: "text-blue-500" },
    trust: { val: "Families", color: "text-purple-600" },
  },
];

const Results: React.FC<{ data: AssessmentData; onRestart: () => void }> = ({ data, onRestart }) => {
  const rec = getRecommendation(data);
  const bracket = getTaxBracket(data.income);
  const [email, setEmail] = useState("");
  const Icon = rec.icon;
  const savingsLow = Math.round(data.income * 0.08);
  const savingsHigh = Math.round(data.income * 0.22);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="flex flex-col items-center text-center py-10">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Your Optimal Structure</h1>
        <p className="text-sm text-muted-foreground">
          Based on your <span className="text-[hsl(var(--cta))] font-medium">goals</span> and{" "}
          <span className="text-[hsl(var(--cta))] font-medium">income profile</span>
        </p>
      </div>

      {/* Tax bracket alert */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">You're in the {bracket.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            With an income of {fmtFull(data.income)}, structuring properly could significantly reduce your tax exposure.
            The right structure could save you{" "}
            <span className="font-bold text-orange-600">
              {fmtFull(savingsLow)} – {fmtFull(savingsHigh)}+ annually
            </span>
            .
          </p>
        </div>
      </div>

      {/* Recommendation card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <p className="text-[10px] font-bold text-[hsl(var(--cta))] uppercase tracking-widest mb-2">
          Recommended For You
        </p>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rec.iconBg}`}>
            <Icon className={`w-5 h-5 ${rec.iconColor}`} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{rec.type}</h2>
            <p className="text-xs text-muted-foreground">{rec.subtitle}</p>
          </div>
        </div>

        {/* Why This Suits You */}
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-4">
          <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> Why This Suits You
          </p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Annual income: {fmtFull(data.income)} ({bracket.label})
            </li>
            {data.goals.slice(0, 3).map((g) => {
              const goal = GOALS.find((x) => x.id === g);
              return goal ? (
                <li key={g} className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  You selected: {goal.label.toLowerCase()}
                </li>
              ) : null;
            })}
            <li className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Risk appetite: {data.risk.charAt(0).toUpperCase() + data.risk.slice(1)}
            </li>
          </ul>
        </div>

        {/* What This Could Mean */}
        <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-5">
          <p className="text-xs font-bold text-green-700 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" /> What This Could Mean
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { label: "Tax Flexibility", val: rec.taxFlexibility },
              { label: "Asset Protection", val: rec.assetProtection },
              { label: "Best For", val: rec.bestFor },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-muted-foreground mb-0.5">{item.label}</p>
                <p className="font-bold text-foreground">{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Considerations */}
        <h3 className="text-sm font-bold text-foreground mb-3">Key Considerations</h3>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs font-bold text-green-600 mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pros
            </p>
            <ul className="space-y-1">
              {rec.pros.map((p) => (
                <li key={p} className="text-xs text-foreground">
                  ✓ {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-orange-500 mb-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Cons
            </p>
            <ul className="space-y-1">
              {rec.cons.map((c) => (
                <li key={c} className="text-xs text-foreground">
                  • {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Setup / Annual cost */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">Setup Cost</p>
            <p className="text-sm font-bold text-foreground">{rec.setupCost}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">Annual Cost</p>
            <p className="text-sm font-bold text-foreground">{rec.annualCost}</p>
          </div>
        </div>
      </div>

      {/* Match Scores */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[hsl(var(--cta))]" /> Structure Match Scores
        </p>
        {[
          { label: "Sole Trader", pct: rec.scores.soleTrader, color: "#3b82f6" },
          { label: "Company", pct: rec.scores.company, color: "hsl(var(--cta))" },
          { label: "Family Trust", pct: rec.scores.trust, color: "#a855f7" },
        ].map((row) => (
          <div key={row.label} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-bold" style={{ color: row.color }}>
                {row.pct}%
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${row.pct}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Full comparison table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6 overflow-x-auto">
        <p className="text-sm font-bold text-foreground mb-4">Full Comparison</p>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-medium pb-3 pr-4"></th>
              <th className="text-center text-muted-foreground font-medium pb-3 px-2">Sole Trader</th>
              <th className="text-center text-muted-foreground font-medium pb-3 px-2">Company</th>
              <th className="text-center text-muted-foreground font-medium pb-3 px-2">Trust</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={row.label} className={i < COMPARISON_ROWS.length - 1 ? "border-b border-border" : ""}>
                <td className="py-2.5 pr-4 text-foreground font-medium">{row.label}</td>
                <td className={`py-2.5 px-2 text-center font-medium ${row.soleTrader.color}`}>{row.soleTrader.val}</td>
                <td className={`py-2.5 px-2 text-center font-medium ${row.company.color}`}>{row.company.val}</td>
                <td className={`py-2.5 px-2 text-center font-medium ${row.trust.color}`}>{row.trust.val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF box */}
      {/* <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground mb-0.5">Get Your Full Comparison PDF</p>
          <p className="text-xs text-muted-foreground mb-3">
            Receive a detailed breakdown of all 3 structures with personalised recommendations based on your profile
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-white">
              <span className="text-muted-foreground text-xs">✉</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background: "hsl(var(--cta))" }}
            >
              Send PDF
            </button>
          </div>
        </div>
      </div> */}

      {/* CTA */}
      <a
        href="/pricing"
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 mb-3"
        style={{ background: "linear-gradient(135deg, hsl(24 95% 53%), hsl(0 85% 50%))" }}
      >
        <Lock className="w-5 h-5" /> Unlock My Optimised Structure Strategy <ArrowRight size={18} />
      </a>
      <p className="text-center text-xs text-muted-foreground mb-6">
        Book a consultation with our structure specialists
      </p>

      <button
        onClick={onRestart}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
      >
        — Start New Assessment
      </button>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const BusinessHealthStructuringPage: React.FC = () => {
  const [step, setStep] = useState(0); // 0 = assessment steps, -1 = results
  const [substep, setSubstep] = useState(1); // 1, 2, 3
  const [income, setIncome] = useState(200000);
  const [goals, setGoals] = useState<GoalId[]>([]);
  const [risk, setRisk] = useState<RiskLevel>("balanced");

  const restart = () => {
    setStep(0);
    setSubstep(1);
    setIncome(200000);
    setGoals([]);
    setRisk("balanced");
  };

  if (step === -1) {
    return (
      <div className="bg-[#f7f8fa]">
        <Results data={{ income, goals, risk }} onRestart={restart} />
      </div>
    );
  }

  return (
    <div className="bg-[#f7f8fa] flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-10 pb-2 text-center">
        <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 text-orange-600 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Structure Assessment
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 leading-tight max-w-lg">
          Find Your Perfect Business Structure
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mb-8">
          Answer 3 simple questions to get personalized recommendations
        </p>
        <StepperBar step={substep} />
      </section>

      {/* Card */}
      <section className="flex-1 flex justify-center px-4 pb-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8">
          {substep === 1 && <Step1 income={income} setIncome={setIncome} onNext={() => setSubstep(2)} />}
          {substep === 2 && (
            <Step2
              goals={goals}
              setGoals={setGoals}
              income={income}
              onNext={() => setSubstep(3)}
              onBack={() => setSubstep(1)}
            />
          )}
          {substep === 3 && (
            <Step3 risk={risk} setRisk={setRisk} onViewResults={() => setStep(-1)} onBack={() => setSubstep(2)} />
          )}
        </div>
      </section>

      {/* Nav bottom hint */}
      <div className="flex justify-between items-center max-w-lg mx-auto w-full px-8 pb-8">
        {substep > 1 ? (
          <button
            onClick={() => setSubstep((s) => s - 1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}
        {substep < 3 ? (
          <button
            onClick={() => setSubstep((s) => s + 1)}
            className="flex items-center gap-1 text-sm text-[hsl(var(--cta))] font-medium hover:opacity-80 transition-all"
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default BusinessHealthStructuringPage;
