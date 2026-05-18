import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Calculator,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Check,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  ChevronDown,
  Clock,
  FileText,
} from "lucide-react";

const fmt = (n: number) =>
  !n && n !== 0
    ? "$0"
    : new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
      }).format(Math.round(n));
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function calcTax(income: number) {
  const B: [number, number, number][] = [
    [0, 18200, 0],
    [18200, 45000, 0.16],
    [45000, 135000, 0.3],
    [135000, 190000, 0.37],
    [190000, Infinity, 0.45],
  ];
  let t = 0;
  for (const [mn, mx, r] of B) {
    if (income <= mn) break;
    t += (Math.min(income, mx) - mn) * r;
  }
  return t + income * 0.02;
}
const taxOnGain = (base: number, gain: number) =>
  calcTax(base + gain) - calcTax(base);
const yrs = (d1: Date, d2: Date) =>
  (d2.getTime() - d1.getTime()) / (365.25 * 864e5);

function AnimNum({ value }: { value: number }) {
  const [d, setD] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const s = prev.current;
    const diff = value - s;
    if (Math.abs(diff) < 1) {
      setD(value);
      prev.current = value;
      return;
    }
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / 500, 1);
      setD(Math.round(s + diff * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = value;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{fmt(d)}</>;
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  help?: string;
}
function CSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = "",
  suffix = "",
  help,
}: SliderProps) {
  const pctV = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xl font-bold text-cta tabular-nums">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${pctV}%, hsl(var(--muted)) ${pctV}%, hsl(var(--muted)) 100%)`,
        }}
      />
      {help && (
        <div className="text-[11px] text-muted-foreground mt-1.5">{help}</div>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="soft-input"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  desc,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}) {
  return (
    <div
      className="flex gap-3 mb-4 cursor-pointer items-start"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`w-12 h-7 rounded-full relative shrink-0 mt-0.5 transition-colors ${
          checked ? "bg-cta" : "bg-muted"
        }`}
      >
        <div
          className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow"
          style={{ left: checked ? 26 : 4 }}
        />
      </div>
      <div>
        <div className="text-sm font-bold text-foreground">{label}</div>
        {desc && (
          <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        )}
      </div>
    </div>
  );
}

function MethodTab({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl text-center transition-all border-2 ${
        active
          ? "border-cta bg-cta/5"
          : "border-border bg-card hover:border-cta/30"
      }`}
    >
      <Icon
        className={`w-5 h-5 mx-auto mb-1.5 ${
          active ? "text-cta" : "text-muted-foreground"
        }`}
      />
      <div
        className={`text-xs font-bold ${
          active ? "text-cta" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
    </button>
  );
}

function Bar({
  label,
  oldV,
  newV,
  mx,
}: {
  label: string;
  oldV: number;
  newV: number;
  mx: number;
}) {
  const rows = [
    { l: "Old rules", v: oldV, isNew: false },
    { l: "New rules", v: newV, isNew: true },
  ];
  return (
    <div className="mb-5">
      <div className="text-sm font-bold text-foreground mb-2.5">{label}</div>
      {rows.map((r, i) => {
        const worse = r.isNew && r.v > oldV;
        const better = r.isNew && r.v <= oldV;
        const color = !r.isNew
          ? "bg-muted-foreground/60"
          : worse
          ? "bg-destructive"
          : "bg-success";
        return (
          <div key={i} className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[11px] text-muted-foreground w-16 shrink-0">
              {r.l}
            </span>
            <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden">
              <div
                className={`h-full rounded-lg flex items-center justify-end pr-2.5 transition-all duration-700 ${color}`}
                style={{
                  width: `${mx > 0 ? Math.max((r.v / mx) * 100, 5) : 5}%`,
                }}
              >
                <span className="text-[11px] font-bold text-white">
                  {fmt(r.v)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Breakdown({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "neutral" | "cta" | "success" | "destructive";
  items: { l: string; v: string; hl?: boolean }[];
}) {
  const toneClasses = {
    neutral: "text-muted-foreground border-muted-foreground",
    cta: "text-cta border-cta",
    success: "text-success border-success",
    destructive: "text-destructive border-destructive",
  }[tone];
  return (
    <div className="mb-5">
      <div
        className={`text-xs font-bold uppercase tracking-wider mb-2.5 border-l-2 pl-2.5 ${toneClasses}`}
      >
        {title}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex justify-between border-b border-border ${
            item.hl
              ? "bg-cta/5 -mx-3 px-3 py-2.5 rounded-lg border-0"
              : "py-2"
          }`}
        >
          <span
            className={`text-sm ${
              item.hl
                ? "font-bold text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {item.l}
          </span>
          <span
            className={`text-sm tabular-nums ${
              item.hl ? "font-bold text-cta" : "font-semibold text-foreground"
            }`}
          >
            {item.v}
          </span>
        </div>
      ))}
    </div>
  );
}

const CGTCalculatorPage: React.FC = () => {
  const [pp, setPP] = useState(500000);
  const [sp, setSP] = useState(900000);
  const [pd, setPD] = useState("2018-06-15");
  const [sd, setSD] = useState("2030-06-15");
  const [v27, setV27] = useState(780000);
  const [inc, setInc] = useState(95000);
  const [cpi, setCpi] = useState(2.5);
  const [meth, setMeth] = useState<"valuation" | "time">("valuation");
  const [isNew, setNew] = useState(false);
  const [isPen, setPen] = useState(false);
  const [detail, setDetail] = useState(false);

  const J27 = new Date("2027-07-01");

  const R = useMemo(() => {
    if (sp <= pp || pp <= 0) return null;
    const pDate = new Date(pd),
      sDate = new Date(sd),
      cpiR = cpi / 100;
    const gain = sp - pp,
      h12 = yrs(pDate, sDate) >= 1;
    const preY = Math.max(0, yrs(pDate, J27)),
      postY = Math.max(0, yrs(J27, sDate)),
      totY = yrs(pDate, sDate);

    const oldDisc = h12 ? gain * 0.5 : gain;
    const oldTax = taxOnGain(inc, oldDisc);
    const oldEff = gain > 0 ? oldTax / gain : 0;

    let preG: number, postGI: number, ixF: number, ixCB: number;
    if (meth === "valuation") {
      preG = Math.max(0, v27 - pp);
      ixF = Math.pow(1 + cpiR, Math.max(0, postY));
      ixCB = v27 * ixF;
      postGI = Math.max(0, sp - ixCB);
    } else {
      const pPct = totY > 0 ? preY / totY : 0.5;
      preG = gain * pPct;
      const postRaw = gain * (1 - pPct);
      ixF = Math.pow(1 + cpiR, Math.max(0, postY));
      const inflAdj = postRaw * (1 - 1 / ixF);
      postGI = Math.max(0, postRaw - inflAdj);
      ixCB = 0;
    }

    const preDisc = h12 ? preG * 0.5 : preG;
    const newTaxable = preDisc + postGI;
    let newTax = taxOnGain(inc, newTaxable);
    const realG = preG + postGI;
    const minT = isPen ? 0 : realG * 0.3;
    const minHit = !isPen && minT > newTax;
    if (minHit) newTax = minT;

    let finalTax = newTax,
      nbBenefit = false;
    if (isNew && oldTax < newTax) {
      finalTax = oldTax;
      nbBenefit = true;
    }
    const newEff = gain > 0 ? finalTax / gain : 0;

    return {
      gain,
      h12,
      preY,
      postY,
      totY,
      oldDisc,
      oldTax,
      oldEff,
      preG,
      preDisc,
      postGI,
      ixF,
      ixCB,
      newTaxable,
      newTax: finalTax,
      newEff,
      minHit,
      minT,
      nbBenefit,
      diff: finalTax - oldTax,
      atOld: gain - oldTax,
      atNew: gain - finalTax,
    };
  }, [pp, sp, pd, sd, v27, inc, cpi, meth, isNew, isPen]);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pt-10 pb-6 md:pt-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cta/10 border border-cta/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cta" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-cta">
            Budget 2026-27 · Free Tool
          </span>
        </div>
        <h1 className="text-[2rem] md:text-[2.5rem] font-extrabold text-foreground text-center max-w-2xl leading-tight tracking-tight">
          CGT Impact Calculator
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-base max-w-xl mt-3 leading-relaxed">
          Old rules vs new rules — see your exact dollar difference
        </p>
      </section>

      <section className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            {/* Method tabs */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                <span className="w-8 h-8 rounded-lg bg-cta/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-cta" />
                </span>
                Calculation Method
              </h2>
              <div className="flex gap-2.5">
                <MethodTab
                  active={meth === "valuation"}
                  label="Market Valuation @ Jul 2027"
                  icon={FileText}
                  onClick={() => setMeth("valuation")}
                />
                <MethodTab
                  active={meth === "time"}
                  label="Time Apportionment"
                  icon={Clock}
                  onClick={() => setMeth("time")}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {meth === "valuation"
                  ? "Uses a market valuation at 1 July 2027 to split gains between old and new rules. Awaiting legislative confirmation."
                  : "Splits gains proportionally based on time held before and after 1 July 2027. Awaiting legislative confirmation."}
              </div>
            </div>

            {/* Asset details */}
            <div className="bg-card rounded-2xl p-6 md:p-7 shadow-lg border border-border">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-5">
                <span className="w-8 h-8 rounded-lg bg-cta/10 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-cta" />
                </span>
                Your Asset Details
              </h2>

              <CSlider
                label="Purchase Price"
                value={pp}
                onChange={setPP}
                min={50000}
                max={5000000}
                step={10000}
                prefix="$"
              />
              <CSlider
                label="Sale Price"
                value={sp}
                onChange={setSP}
                min={50000}
                max={10000000}
                step={10000}
                prefix="$"
              />
              {meth === "valuation" && (
                <CSlider
                  label="Value at 1 July 2027"
                  value={v27}
                  onChange={setV27}
                  min={50000}
                  max={8000000}
                  step={10000}
                  prefix="$"
                  help="Get a formal valuation — this number determines your tax split"
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField label="Purchase Date" value={pd} onChange={setPD} />
                <DateField label="Sale Date" value={sd} onChange={setSD} />
              </div>

              <CSlider
                label="Other Taxable Income"
                value={inc}
                onChange={setInc}
                min={0}
                max={500000}
                step={5000}
                prefix="$"
                help="Salary, wages, business income (excluding this gain)"
              />
              <CSlider
                label="Assumed Annual CPI"
                value={cpi}
                onChange={setCpi}
                min={0}
                max={6}
                step={0.1}
                suffix="%"
                help="RBA target 2.5% · Historical average ~2.5%"
              />

              <div className="border-t border-border pt-5 mt-2">
                <Toggle
                  label="New build residential property"
                  checked={isNew}
                  onChange={setNew}
                  desc="New residential property investors can choose old 50% discount OR new indexation — calculator picks whichever results in less tax"
                />
                <Toggle
                  label="Age Pension recipient"
                  checked={isPen}
                  onChange={setPen}
                  desc="Exempt from the 30% minimum tax on capital gains"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-5">
            {!R ? (
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-border bg-card shadow-lg p-10 min-h-[420px]">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <Calculator className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-foreground font-bold text-base mb-2 text-center">
                  Enter your asset details
                </p>
                <p className="text-muted-foreground text-sm text-center max-w-[280px]">
                  Sale price must exceed purchase price to see your CGT
                  comparison.
                </p>
              </div>
            ) : (
              <>
                {/* Hero result */}
                <div
                  className={`rounded-2xl p-7 text-center border ${
                    R.diff > 0
                      ? "bg-destructive/5 border-destructive/30"
                      : "bg-success/5 border-success/30"
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    {R.diff > 0
                      ? "⚠ You pay MORE under new rules"
                      : "✓ New rules are BETTER for you"}
                  </div>
                  <div
                    className={`text-5xl md:text-6xl font-extrabold leading-none ${
                      R.diff > 0 ? "text-destructive" : "text-success"
                    }`}
                  >
                    <AnimNum value={Math.abs(Math.round(R.diff))} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2.5">
                    {R.diff > 0
                      ? "additional tax under Budget 2026 rules"
                      : "tax saved under Budget 2026 rules"}
                  </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      l: "Total Gain",
                      v: R.gain,
                      color: "text-foreground",
                      s: `${R.totY.toFixed(1)} year hold`,
                    },
                    {
                      l: "Old Rules Tax",
                      v: R.oldTax,
                      color: "text-muted-foreground",
                      s: `Effective: ${pct(R.oldEff)}`,
                    },
                    {
                      l: "New Rules Tax",
                      v: R.newTax,
                      color: "text-cta",
                      s: `Effective: ${pct(R.newEff)}`,
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-card border border-border shadow-sm"
                    >
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {c.l}
                      </div>
                      <div className={`text-xl font-extrabold ${c.color}`}>
                        <AnimNum value={Math.round(c.v)} />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {c.s}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline + bars */}
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                  {/* Timeline */}
                  <div className="mb-6">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                      Gain split at 1 July 2027
                    </div>
                    <div className="flex h-12 rounded-xl overflow-hidden">
                      <div
                        className="bg-muted flex items-center justify-center border-r-4 border-cta transition-all"
                        style={{
                          flex:
                            R.totY > 0
                              ? R.preY / (R.preY + R.postY)
                              : 0.5,
                          minWidth: 80,
                        }}
                      >
                        <span className="text-[11px] font-bold text-foreground text-center leading-tight">
                          50% DISCOUNT
                          <br />
                          <span className="text-cta text-[10px]">
                            {R.preY.toFixed(1)} yrs
                          </span>
                        </span>
                      </div>
                      <div
                        className="bg-cta/15 flex items-center justify-center transition-all"
                        style={{
                          flex:
                            R.totY > 0
                              ? R.postY / (R.preY + R.postY)
                              : 0.5,
                          minWidth: 80,
                        }}
                      >
                        <span className="text-[11px] font-bold text-cta text-center leading-tight">
                          INDEXATION
                          <br />
                          <span className="text-foreground text-[10px]">
                            {R.postY.toFixed(1)} yrs
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                      <span>Purchase</span>
                      <span className="font-bold text-cta">1 July 2027</span>
                      <span>Sale</span>
                    </div>
                  </div>

                  <Bar
                    label="Tax Payable"
                    oldV={R.oldTax}
                    newV={R.newTax}
                    mx={Math.max(R.oldTax, R.newTax) * 1.2}
                  />
                  <Bar
                    label="After-Tax Profit"
                    oldV={R.atOld}
                    newV={R.atNew}
                    mx={Math.max(R.atOld, R.atNew) * 1.15}
                  />

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    {[
                      {
                        l: "Old Effective Rate",
                        v: pct(R.oldEff),
                        c: "text-muted-foreground",
                      },
                      {
                        l: "New Effective Rate",
                        v: pct(R.newEff),
                        c:
                          R.newEff > R.oldEff
                            ? "text-destructive"
                            : "text-success",
                      },
                    ].map((r, i) => (
                      <div
                        key={i}
                        className="bg-muted/50 rounded-xl p-4 text-center"
                      >
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          {r.l}
                        </div>
                        <div className={`text-2xl font-extrabold mt-1 ${r.c}`}>
                          {r.v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                {R.minHit && (
                  <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-4 flex gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-xs text-destructive font-semibold leading-relaxed">
                      30% minimum tax applied — your marginal rate was below
                      30%, so the floor increased your tax. Exact application
                      will be confirmed when legislation is released.
                    </span>
                  </div>
                )}
                {R.nbBenefit && (
                  <div className="bg-success/5 border border-success/30 rounded-xl p-4 flex gap-2.5">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="text-xs text-success font-semibold leading-relaxed">
                      New build residential benefit applied — the old 50% CGT
                      discount results in less tax for you. Calculator used the
                      more favourable method as permitted under the Budget
                      announcement.
                    </span>
                  </div>
                )}

                {/* Breakdown */}
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                  <button
                    className="w-full flex justify-between items-center"
                    onClick={() => setDetail(!detail)}
                  >
                    <h2 className="text-base font-bold text-foreground">
                      Full Breakdown
                    </h2>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <ChevronDown
                        className={`w-4 h-4 text-cta transition-transform ${
                          detail ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {detail && (
                    <div className="mt-5">
                      <Breakdown
                        title="Old Rules (50% Discount)"
                        tone="neutral"
                        items={[
                          { l: "Total capital gain", v: fmt(R.gain) },
                          {
                            l: "50% discount",
                            v: R.h12
                              ? "Applied"
                              : "Not eligible (<12 months)",
                          },
                          { l: "Taxable gain", v: fmt(R.oldDisc) },
                          { l: "Tax payable", v: fmt(R.oldTax), hl: true },
                        ]}
                      />
                      <Breakdown
                        title="New Rules (Indexation + 30% Min)"
                        tone="cta"
                        items={[
                          { l: "Pre-July 2027 gain", v: fmt(R.preG) },
                          { l: "After 50% discount", v: fmt(R.preDisc) },
                          {
                            l: `Indexation factor (${R.postY.toFixed(
                              1
                            )}yr × ${cpi}%)`,
                            v: `×${R.ixF.toFixed(4)}`,
                          },
                          ...(meth === "valuation"
                            ? [
                                {
                                  l: "Indexed cost base",
                                  v: fmt(R.ixCB),
                                },
                              ]
                            : []),
                          {
                            l: "Post-July 2027 gain (indexed)",
                            v: fmt(R.postGI),
                          },
                          { l: "Total taxable gain", v: fmt(R.newTaxable) },
                          {
                            l: "30% minimum check*",
                            v: R.minHit
                              ? `Applied: ${fmt(R.minT)}`
                              : isPen
                              ? "Exempt (Age Pension)"
                              : "Not triggered",
                          },
                          { l: "Tax payable", v: fmt(R.newTax), hl: true },
                        ]}
                      />
                      <Breakdown
                        title="Difference"
                        tone={R.diff > 0 ? "destructive" : "success"}
                        items={[
                          {
                            l:
                              R.diff > 0 ? "Additional tax" : "Tax saved",
                            v: fmt(Math.abs(R.diff)),
                            hl: true,
                          },
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="bg-cta/5 border border-cta/15 rounded-2xl p-6">
                  <h2 className="flex items-center gap-2 text-base font-bold text-cta mb-3">
                    <TrendingUp className="w-4 h-4" />
                    Smart Tips
                  </h2>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                    {R.diff > 3000 && (
                      <p>
                        <strong className="text-foreground">
                          Get a valuation before July 2027.
                        </strong>{" "}
                        A higher value means more gain under the old 50%
                        discount. Cost: $300-600. Potential saving: thousands.
                      </p>
                    )}
                    {R.postY < 7 && R.diff > 0 && (
                      <p>
                        <strong className="text-foreground">
                          Consider timing.
                        </strong>{" "}
                        With {R.postY.toFixed(0)} years after July 2027,
                        indexation hasn't had time to reduce your gain.
                      </p>
                    )}
                    {R.postY >= 15 && R.diff <= 0 && (
                      <p>
                        <strong className="text-success">
                          Long hold works for you.
                        </strong>{" "}
                        {R.postY.toFixed(0)} years of indexation has
                        significantly reduced your real gain.
                      </p>
                    )}
                    {R.minHit && (
                      <p>
                        <strong className="text-destructive">
                          30% minimum caught you.
                        </strong>{" "}
                        Selling in a low-income year is now less effective.
                      </p>
                    )}
                    <p>
                      <strong className="text-foreground">
                        This is a guide, not advice.
                      </strong>{" "}
                      Book a consultation for numbers specific to your
                      situation.
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div
                  className="rounded-2xl p-7 text-center text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(24 95% 53%) 0%, hsl(15 90% 55%) 100%)",
                  }}
                >
                  <div className="text-xl font-extrabold mb-1.5">
                    Need your exact numbers?
                  </div>
                  <div className="text-sm text-white/85 mb-5">
                    Book a Strategic Tax Planning Meeting with Nanak
                    Accountants
                  </div>
                  <a
                    href="https://calendly.com/nanakaccountant/property-related-cgt-implication?back=1&month=2026-04"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-cta px-7 py-3.5 rounded-full font-bold text-sm hover:scale-[1.03] transition-transform shadow-lg"
                  >
                    Book a Consultation <ArrowRight className="w-4 h-4" />
                  </a>
                  <div className="text-[11px] text-white/70 mt-3.5">
                    Nanak Accountants & Associates · Trusted by 5,000+
                    businesses
                  </div>
                </div>
              </>
            )}

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-2">
              General information only. Not personal financial or tax advice.
              Estimates based on the Federal Budget 2026-27 announcements.
              Legislation has not yet been passed by Parliament. Consult a
              Registered Tax Agent for advice specific to your situation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CGTCalculatorPage;