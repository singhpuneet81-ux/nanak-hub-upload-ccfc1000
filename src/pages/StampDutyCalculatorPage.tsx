import React, { useState } from "react";
import {
  MapPin, Building2, Calendar, User, Home, Globe,
  Calculator, ArrowRight, Download, Phone, ExternalLink, Info, ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

// ─── Stamp duty formulas per state ──────────────────────────────────────────

type CalcInput = {
  value: number;
  state: string;
  propertyType: "residential" | "vacant" | "new";
  isFirstHome: boolean;
  isPPR: boolean; // principal place of residence
  isForeign: boolean;
  // VIC specific
  propertyCondition?: "new" | "established" | "vacant";
  isRegionalVic?: boolean;
};

type CalcResult = {
  baseDuty: number;
  totalDuty: number;
  effectiveRate: number;
  breakdown: { label: string; amount: number }[];
  notes: string[];
};

function calcVIC(inp: CalcInput): CalcResult {
  const v = inp.value;
  // VIC standard brackets (Transfer duty)
  let base = 0;
  if (v <= 25000) base = v * 0.014;
  else if (v <= 130000) base = 350 + (v - 25000) * 0.024;
  else if (v <= 960000) base = 2870 + (v - 130000) * 0.06;
  else if (v <= 2000000) base = 55100 + (v - 960000) * 0.055;
  else base = v * 0.065;

  base = Math.round(base);
  let total = base;
  const breakdown: { label: string; amount: number }[] = [{ label: "Base transfer duty", amount: base }];
  const notes: string[] = [];

  // FHB concession – VIC: exempt if <= 600k PPR, reduced up to 750k
  if (inp.isFirstHome && inp.isPPR) {
    if (v <= 600000) {
      breakdown.push({ label: "First Home Buyer concession", amount: -base });
      total = 0;
      notes.push("Full exemption applied (FHB, PPR ≤ $600,000).");
    } else if (v <= 750000) {
      const discount = Math.round(base * ((750000 - v) / 150000));
      breakdown.push({ label: "First Home Buyer concession", amount: -discount });
      total = base - discount;
    }
  }

  // Regional VIC concession (up to $11,000 off new homes)
  if (inp.isRegionalVic && inp.propertyCondition === "new" && total > 0) {
    const reg = Math.min(11000, total);
    breakdown.push({ label: "Regional Victoria discount", amount: -reg });
    total -= reg;
    notes.push("Regional VIC concession applied (new home, outside Greater Melbourne).");
  }

  // Foreign surcharge – VIC 8%
  if (inp.isForeign) {
    const surcharge = Math.round(v * 0.08);
    breakdown.push({ label: "Foreign purchaser surcharge (8%)", amount: surcharge });
    total += surcharge;
    notes.push("Foreign purchaser additional duty at 8% applies.");
  }

  total = Math.max(0, Math.round(total));
  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes };
}

function calcNSW(inp: CalcInput): CalcResult {
  const v = inp.value;
  let base = 0;
  if (v <= 16000) base = v * 0.0125;
  else if (v <= 35000) base = 200 + (v - 16000) * 0.015;
  else if (v <= 93000) base = 485 + (v - 35000) * 0.0175;
  else if (v <= 351000) base = 1500 + (v - 93000) * 0.035;
  else if (v <= 1168000) base = 10545 + (v - 351000) * 0.045;
  else if (v <= 3505000) base = 47295 + (v - 1168000) * 0.055;
  else base = 175830 + (v - 3505000) * 0.07;

  base = Math.round(base);
  let total = base;
  const breakdown = [{ label: "Base transfer duty", amount: base }];
  const notes: string[] = [];

  // NSW FHB: exempt ≤ $800k (existing), ≤ $1M (new), reduced up to thresholds
  if (inp.isFirstHome) {
    if (v <= 800000) {
      breakdown.push({ label: "First Home Buyer exemption", amount: -base });
      total = 0;
      notes.push("Full exemption for NSW FHB (≤ $800,000).");
    } else if (v <= 1000000) {
      const discount = Math.round(base * ((1000000 - v) / 200000));
      breakdown.push({ label: "First Home Buyer concession", amount: -discount });
      total = base - discount;
    }
  }

  if (inp.isForeign) {
    const surcharge = Math.round(v * 0.08);
    breakdown.push({ label: "Foreign purchaser surcharge (8%)", amount: surcharge });
    total += surcharge;
    notes.push("NSW foreign surcharge at 8% applies.");
  }

  total = Math.max(0, Math.round(total));
  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes };
}

function calcQLD(inp: CalcInput): CalcResult {
  const v = inp.value;
  let base = 0;
  if (v <= 5000) base = 0;
  else if (v <= 75000) base = (v - 5000) * 0.015;
  else if (v <= 540000) base = 1050 + (v - 75000) * 0.035;
  else if (v <= 1000000) base = 17325 + (v - 540000) * 0.045;
  else base = 38025 + (v - 1000000) * 0.0575;

  base = Math.round(base);
  let total = base;
  const breakdown = [{ label: "Base transfer duty", amount: base }];
  const notes: string[] = [];

  // QLD FHB: concession for homes ≤ $700k (owner occupied)
  if (inp.isFirstHome && inp.isPPR && v <= 700000) {
    // QLD grants a flat concession rate that results in lower duty
    let concessional = 0;
    if (v <= 350000) concessional = 0;
    else if (v <= 540000) concessional = (v - 350000) * 0.01;
    else if (v <= 700000) concessional = 1900 + (v - 540000) * 0.035;
    concessional = Math.round(concessional);
    const disc = Math.max(0, base - concessional);
    breakdown.push({ label: "First Home Concession", amount: -disc });
    total = concessional;
    notes.push("QLD First Home Concession applied.");
  }

  if (inp.isForeign) {
    const surcharge = Math.round(v * 0.07);
    breakdown.push({ label: "Foreign purchaser surcharge (7%)", amount: surcharge });
    total += surcharge;
    notes.push("QLD foreign surcharge at 7% applies.");
  }

  total = Math.max(0, Math.round(total));
  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes };
}

function calcWA(inp: CalcInput): CalcResult {
  const v = inp.value;
  let base = 0;
  if (v <= 120000) base = v * 0.019;
  else if (v <= 150000) base = 2280 + (v - 120000) * 0.0285;
  else if (v <= 360000) base = 3135 + (v - 150000) * 0.038;
  else if (v <= 725000) base = 11115 + (v - 360000) * 0.045;
  else base = 27540 + (v - 725000) * 0.051;

  base = Math.round(base);
  let total = base;
  const breakdown = [{ label: "Base transfer duty", amount: base }];
  const notes: string[] = [];

  if (inp.isFirstHome && v <= 430000) {
    breakdown.push({ label: "First Home Owner rate concession", amount: -base });
    total = 0;
    notes.push("WA FHB duty waiver applies (≤ $430,000).");
  } else if (inp.isFirstHome && v <= 530000) {
    const disc = Math.round(base * ((530000 - v) / 100000));
    breakdown.push({ label: "First Home Owner concession", amount: -disc });
    total = base - disc;
  }

  if (inp.isForeign) {
    const surcharge = Math.round(v * 0.07);
    breakdown.push({ label: "Foreign purchaser surcharge (7%)", amount: surcharge });
    total += surcharge;
    notes.push("WA foreign surcharge at 7% applies.");
  }

  total = Math.max(0, Math.round(total));
  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes };
}

function calcSA(inp: CalcInput): CalcResult {
  const v = inp.value;
  let base = 0;
  if (v <= 12000) base = v * 0.01;
  else if (v <= 30000) base = 120 + (v - 12000) * 0.02;
  else if (v <= 50000) base = 480 + (v - 30000) * 0.03;
  else if (v <= 100000) base = 1080 + (v - 50000) * 0.035;
  else if (v <= 200000) base = 2830 + (v - 100000) * 0.04;
  else if (v <= 250000) base = 6830 + (v - 200000) * 0.0425;
  else if (v <= 300000) base = 8955 + (v - 250000) * 0.05;
  else if (v <= 500000) base = 11455 + (v - 300000) * 0.055;
  else base = 22455 + (v - 500000) * 0.055;

  base = Math.round(base);
  let total = base;
  const breakdown = [{ label: "Base transfer duty", amount: base }];
  const notes: string[] = [];

  if (inp.isForeign) {
    const surcharge = Math.round(v * 0.07);
    breakdown.push({ label: "Foreign purchaser surcharge (7%)", amount: surcharge });
    total += surcharge;
    notes.push("SA foreign surcharge at 7% applies.");
  }

  total = Math.max(0, Math.round(total));
  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes };
}

function calcTAS(inp: CalcInput): CalcResult {
  const v = inp.value;
  let base = 0;
  if (v <= 3000) base = 50;
  else if (v <= 25000) base = 50 + (v - 3000) * 0.015;
  else if (v <= 75000) base = 380 + (v - 25000) * 0.0225;
  else if (v <= 200000) base = 1505 + (v - 75000) * 0.035;
  else if (v <= 375000) base = 5880 + (v - 200000) * 0.04;
  else if (v <= 725000) base = 12880 + (v - 375000) * 0.0425;
  else base = 27755 + (v - 725000) * 0.045;

  base = Math.round(base);
  const total = Math.round(base);
  const breakdown = [{ label: "Base transfer duty", amount: base }];

  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes: [] };
}

function calcACT(inp: CalcInput): CalcResult {
  const v = inp.value;
  // ACT uses a marginal rate system
  let base = 0;
  if (v <= 200000) base = v * 0.0006;
  else if (v <= 300000) base = 120 + (v - 200000) * 0.023;
  else if (v <= 500000) base = 2420 + (v - 300000) * 0.028;
  else if (v <= 750000) base = 8020 + (v - 500000) * 0.038;
  else if (v <= 1000000) base = 17520 + (v - 750000) * 0.043;
  else if (v <= 1455000) base = 28270 + (v - 1000000) * 0.05;
  else base = 51020 + (v - 1455000) * 0.055;

  base = Math.round(base);
  let total = base;
  const breakdown = [{ label: "Base transfer duty", amount: base }];
  const notes: string[] = [];

  if (inp.isFirstHome && v <= 1000000) {
    breakdown.push({ label: "Home Buyer Concession", amount: -base });
    total = 0;
    notes.push("ACT Home Buyer Concession: eligible buyers may pay $0 duty.");
  }

  total = Math.max(0, Math.round(total));
  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes };
}

function calcNT(inp: CalcInput): CalcResult {
  const v = inp.value;
  let base = 0;
  if (v <= 525000) {
    base = Math.max(0, (0.06571441 * v + 15) * v / 1000);
  } else {
    base = v * 0.0495;
  }

  base = Math.round(base);
  const total = Math.round(base);
  const breakdown = [{ label: "Base transfer duty", amount: base }];

  return { baseDuty: base, totalDuty: total, effectiveRate: v > 0 ? +((total / v) * 100).toFixed(2) : 0, breakdown, notes: [] };
}

function calculateStampDuty(inp: CalcInput): CalcResult {
  switch (inp.state) {
    case "VIC": return calcVIC(inp);
    case "NSW": return calcNSW(inp);
    case "QLD": return calcQLD(inp);
    case "WA": return calcWA(inp);
    case "SA": return calcSA(inp);
    case "TAS": return calcTAS(inp);
    case "ACT": return calcACT(inp);
    case "NT": return calcNT(inp);
    default: return calcVIC(inp);
  }
}

const STATES = [
  { value: "VIC", label: "Victoria" },
  { value: "NSW", label: "New South Wales" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

const OFFICIAL_CALC_URLS: Record<string, string> = {
  VIC: "https://www.sro.vic.gov.au/calculators/land-transfer-duty-calculator",
  NSW: "https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty",
  QLD: "https://www.qld.gov.au/housing/buying-owning-home/advice-buying-home/transfer-duty/calculate-transfer-duty",
  WA: "https://www.wa.gov.au/service/financial-management/taxes-and-fees/transfer-duty-calculator",
  SA: "https://www.revenuesa.sa.gov.au/calculators/stamp-duty-land-calculator",
  TAS: "https://www.sro.tas.gov.au/dutiescalculator",
  ACT: "https://www.revenue.act.gov.au/duties/conveyance-duty",
  NT: "https://nt.gov.au/property/buying-or-selling-property/calculating-stamp-duty",
};

const fmt = (n: number) => "$" + n.toLocaleString("en-AU");

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 px-3 rounded-full text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-cta/10 text-cta border-2 border-cta"
          : "bg-background border-2 border-border text-muted-foreground hover:border-cta/30"
      }`}
    >
      {children}
    </button>
  );
}

const StampDutyCalculatorPage: React.FC = () => {
  const [state, setState] = useState("VIC");
  const [stateOpen, setStateOpen] = useState(false);
  const [propertyValue, setPropertyValue] = useState(700000);
  const [propertyType, setPropertyType] = useState<"residential" | "vacant" | "new">("residential");
  const [contractDate, setContractDate] = useState<Date>(new Date());
  const [calOpen, setCalOpen] = useState(false);
  const [isFirstHome, setIsFirstHome] = useState(false);
  const [isPPR, setIsPPR] = useState(true);
  const [isForeign, setIsForeign] = useState(false);
  const [propertyCondition, setPropertyCondition] = useState<"new" | "established" | "vacant">("established");
  const [isRegionalVic, setIsRegionalVic] = useState(false);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    const res = calculateStampDuty({
      value: propertyValue,
      state,
      propertyType,
      isFirstHome,
      isPPR,
      isForeign,
      propertyCondition,
      isRegionalVic,
    });
    setResult(res);
    setCalculated(true);
  };

  const handleDownload = () => {
    if (!result) return;
    const stateLabel = STATES.find((s) => s.value === state)?.label ?? state;
    const content = `STAMP DUTY ESTIMATE
Generated: ${new Date().toLocaleDateString("en-AU")}

PROPERTY DETAILS:
- State: ${stateLabel}
- Property Value: ${fmt(propertyValue)}
- Property Type: ${propertyType === "new" ? "New Home" : propertyType === "vacant" ? "Vacant Land" : "Established"}
- Contract Date: ${format(contractDate, "dd-MM-yyyy")}
- First Home Buyer: ${isFirstHome ? "Yes" : "No"}
- Principal Place of Residence: ${isPPR ? "Yes" : "No"}
- Foreign Purchaser: ${isForeign ? "Yes" : "No"}

RESULTS:
- Estimated Duty Payable: ${fmt(result.totalDuty)}
- Effective Rate: ${result.effectiveRate}%

BREAKDOWN:
${result.breakdown.map((b) => `- ${b.label}: ${b.amount < 0 ? "-" : ""}${fmt(Math.abs(b.amount))}`).join("\n")}
${result.notes.length > 0 ? "\nNOTES:\n" + result.notes.map((n) => `- ${n}`).join("\n") : ""}

Contact: 1300 626 257
Website: nanakaccountants.com.au

Note: Estimates only. Final assessment by state revenue office. Eligibility conditions apply.
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stamp-duty-estimate-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedStateLabel = STATES.find((s) => s.value === state)?.label ?? "Victoria";
  const sliderPct = ((propertyValue - 100000) / (5000000 - 100000)) * 100;

  return (
    <div className="bg-background">

      {/* Hero Header */}
      <div
        className="w-full py-10 px-4 text-center"
        style={{ background: "linear-gradient(135deg, hsl(225 70% 40%) 0%, hsl(230 80% 50%) 50%, hsl(220 75% 45%) 100%)" }}
      >
        <img src="/favicon.webp" alt="Nanak Accountants" className="w-12 h-12 object-contain mx-auto mb-3" />
        <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/25 uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          Stamp Duty Calculator
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
          Calculate Property<br />Transfer Duty
        </h1>
        <p className="text-white/80 text-sm md:text-base">
          Accurate estimates for all Australian states and territories
        </p>
      </div>

      {/* Calculator grid */}
      <section className="flex justify-center px-4 sm:px-6 lg:px-10 pb-12 pt-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Left: Input card ── */}
          <div className="flex flex-col gap-4">

            {/* Step 1 – Select State */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
                Select State
              </h2>

              {/* Custom state dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStateOpen((o) => !o)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-background hover:border-cta/40 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-left text-sm font-medium text-foreground">{selectedStateLabel}</span>
                  <svg className={`w-4 h-4 text-muted-foreground transition-transform ${stateOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {stateOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                    {STATES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { setState(s.value); setStateOpen(false); setCalculated(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          state === s.value
                            ? "bg-cta/10 text-cta font-semibold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Questions will adapt based on your state selection
              </p>
            </div>

            {/* Step 2 – Property Details */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                Property Details
              </h2>

              {/* Property Value */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-foreground mb-2 block">Property Value</label>
                <div className="flex items-center gap-2 border-2 border-border rounded-xl px-4 py-3 bg-background focus-within:border-cta/50 transition-colors">
                  <span className="text-muted-foreground font-medium">$</span>
                  <input
                    type="number"
                    min={100000}
                    max={5000000}
                    step={1000}
                    value={propertyValue}
                    onChange={(e) => { setPropertyValue(Number(e.target.value)); setCalculated(false); }}
                    className="flex-1 bg-transparent outline-none text-foreground font-medium text-sm"
                  />
                </div>
                <input
                  type="range"
                  min={100000}
                  max={5000000}
                  step={10000}
                  value={propertyValue}
                  onChange={(e) => { setPropertyValue(Number(e.target.value)); setCalculated(false); }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer mt-3"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--cta)) 0%, hsl(var(--cta)) ${sliderPct}%, hsl(220 13% 91%) ${sliderPct}%, hsl(220 13% 91%) 100%)`,
                  }}
                />
              </div>

              {/* Property Type */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-foreground mb-2 block">Property Type</label>
                <div className="flex gap-2">
                  <ToggleBtn active={propertyType === "new"} onClick={() => { setPropertyType("new"); setCalculated(false); }}>New Home</ToggleBtn>
                  <ToggleBtn active={propertyType === "residential"} onClick={() => { setPropertyType("residential"); setCalculated(false); }}>Established</ToggleBtn>
                  <ToggleBtn active={propertyType === "vacant"} onClick={() => { setPropertyType("vacant"); setCalculated(false); }}>Vacant Land</ToggleBtn>
                </div>
              </div>

              {/* Contract Date */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Contract Date</label>
                <Popover open={calOpen} onOpenChange={setCalOpen} modal>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-background hover:border-cta/40 transition-colors text-left"
                    >
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{format(contractDate, "dd-MM-yyyy")}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={contractDate}
                      onSelect={(d) => { if (d) { setContractDate(d); setCalOpen(false); } }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Step 3 – About You */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
                About You
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Is this your first home purchase?</label>
                  <div className="flex gap-2">
                    <ToggleBtn active={isFirstHome} onClick={() => { setIsFirstHome(true); setCalculated(false); }}>Yes, First Home</ToggleBtn>
                    <ToggleBtn active={!isFirstHome} onClick={() => { setIsFirstHome(false); setCalculated(false); }}>Not First Home</ToggleBtn>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Will you live in this property? (PPR)</label>
                  <div className="flex gap-2">
                    <ToggleBtn active={isPPR} onClick={() => { setIsPPR(true); setCalculated(false); }}>Yes, I'll Live Here</ToggleBtn>
                    <ToggleBtn active={!isPPR} onClick={() => { setIsPPR(false); setCalculated(false); }}>Investment Property</ToggleBtn>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Are you a foreign purchaser?</label>
                  <div className="flex gap-2">
                    <ToggleBtn active={!isForeign} onClick={() => { setIsForeign(false); setCalculated(false); }}>Australian Resident</ToggleBtn>
                    <ToggleBtn active={isForeign} onClick={() => { setIsForeign(true); setCalculated(false); }}>Foreign Purchaser</ToggleBtn>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 – State Specific (VIC) */}
            {state === "VIC" && (
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
                  <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">4</span>
                  Victoria Specific
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Property Condition</label>
                    <div className="flex gap-2">
                      <ToggleBtn active={propertyCondition === "new"} onClick={() => { setPropertyCondition("new"); setCalculated(false); }}>New Home</ToggleBtn>
                      <ToggleBtn active={propertyCondition === "established"} onClick={() => { setPropertyCondition("established"); setCalculated(false); }}>Established</ToggleBtn>
                      <ToggleBtn active={propertyCondition === "vacant"} onClick={() => { setPropertyCondition("vacant"); setCalculated(false); }}>Vacant Land</ToggleBtn>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRegionalVic}
                      onChange={(e) => { setIsRegionalVic(e.target.checked); setCalculated(false); }}
                      className="mt-0.5 w-4 h-4 rounded border-border accent-cta"
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground block">Regional Victoria Property</span>
                      <span className="text-xs text-muted-foreground">Outside Greater Melbourne (up to $11,000 discount)</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Calculate Button */}
            <button onClick={handleCalculate} className="btn-cta w-full text-base rounded-xl py-3.5">
              <Calculator className="w-4 h-4" />
              Calculate Stamp Duty
            </button>
          </div>

          {/* ── Right: Results ── */}
          <div className="flex flex-col gap-4 self-start">
            {!calculated || !result ? (
              <div className="bg-card rounded-2xl p-8 border border-border shadow-lg flex flex-col items-center justify-center min-h-[260px]">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-foreground font-bold text-base mb-2 text-center">Ready to Calculate</p>
                <p className="text-muted-foreground text-sm text-center max-w-[240px]">
                  Answer the questions to see your estimate
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
                {/* Main result */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Estimated Duty Payable
                </p>
                <p className="text-4xl font-bold text-foreground mb-1">{fmt(result.totalDuty)}</p>
                <p className="text-sm text-cta font-semibold mb-4">Effective rate: {result.effectiveRate}%</p>

                {/* Transfer only note */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-cta/5 border border-cta/15 mb-5">
                  <Info className="w-4 h-4 text-cta mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Transfer duty only.</span> Additional registration fees, title fees, and other government charges will apply.
                  </p>
                </div>

                {/* Breakdown */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Breakdown</p>
                  <div className="space-y-2">
                    {result.breakdown.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{b.label}</span>
                        <span className={`font-semibold ${b.amount < 0 ? "text-success" : "text-foreground"}`}>
                          {b.amount < 0 ? `-${fmt(Math.abs(b.amount))}` : fmt(b.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {result.notes.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-muted/50">
                    {result.notes.map((n, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{n}</p>
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 mb-5">
                  <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Estimates only.</span> Final assessment by state revenue office. Eligibility conditions apply.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  <a
                    href={OFFICIAL_CALC_URLS[state] ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-border bg-background hover:border-cta/40 text-sm font-semibold text-foreground transition-colors"
                  >
                    View official calculator
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-border bg-background hover:border-cta/40 text-sm font-semibold text-foreground transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Estimate
                  </button>

                  <a
                    href="tel:1300626257"
                    className="btn-cta w-full text-sm rounded-xl py-2.5 inline-flex"
                  >
                    <Phone className="w-4 h-4" />
                    Book a Call
                  </a>
                </div>
              </div>
            )}

            {/* Need a Home Loan card */}
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: "linear-gradient(135deg, hsl(24 95% 53%) 0%, hsl(15 90% 55%) 100%)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm">Need a Home Loan?</span>
              </div>
              <p className="text-white/85 text-xs mb-4">
                We can connect you with trusted finance partners to get your home loan sorted quickly and easily.
              </p>
              <a
                href="tel:1300626257"
                className="inline-flex items-center gap-2 bg-white text-cta text-sm font-bold px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
              >
                Get Loan Help
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Important information footer */}
      <div className="flex justify-center px-4 sm:px-6 lg:px-10 pb-12">
        <div className="w-full max-w-7xl">
          <div className="flex items-start gap-3 p-5 rounded-2xl border border-border bg-muted/30">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Important Information</p>
              <p className="text-xs text-muted-foreground mb-2">
                This calculator provides estimates only. Actual stamp duty payable may vary based on specific circumstances, legislative changes, and state revenue office assessments.
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                First home buyer concessions and exemptions are subject to strict eligibility criteria including citizenship/residency requirements, property value limits, and occupancy conditions. Foreign purchaser surcharges apply as defined by FIRB regulations.
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Always verify calculations with your state revenue office before making financial decisions.</span> We recommend consulting with a qualified property conveyancer or tax specialist for personalised advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StampDutyCalculatorPage;
