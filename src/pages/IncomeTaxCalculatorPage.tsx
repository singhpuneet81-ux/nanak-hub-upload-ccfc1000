import React, { useMemo, useState } from "react";
import "./IncomeTaxCalculatorPage.css";

type FyKey = "y2526" | "y2627";
type Residency = "resident" | "nonres" | "whm";
type Frequency = "annual" | "monthly" | "fortnightly" | "weekly";
type Period = Frequency;
type Bracket = [number, number];

type YearRates = {
  label: string;
  resident: Bracket[];
  nonres: Bracket[];
  whm: Bracket[];
  medicare: { lo: number; hi: number; rate: number; shade: number };
  help: { t1: number; t2: number; base2: number; capFrom: number; capRate: number };
  sg: number;
  instantDeduction: number;
};

const LEAD_SOURCE = "income_tax_calculator";
const API_BASE = "https://api.cavaluer.com";

const RATES: Record<FyKey, YearRates> = {
  y2526: {
    label: "2025-26",
    resident: [
      [18200, 0],
      [45000, 0.16],
      [135000, 0.3],
      [190000, 0.37],
      [Infinity, 0.45],
    ],
    nonres: [
      [135000, 0.3],
      [190000, 0.37],
      [Infinity, 0.45],
    ],
    whm: [
      [45000, 0.15],
      [135000, 0.3],
      [190000, 0.37],
      [Infinity, 0.45],
    ],
    medicare: { lo: 27222, hi: 34027, rate: 0.02, shade: 0.1 },
    help: { t1: 67000, t2: 125000, base2: 8700, capFrom: 179286, capRate: 0.1 },
    sg: 0.12,
    instantDeduction: 0,
  },
  y2627: {
    label: "2026-27",
    resident: [
      [18200, 0],
      [45000, 0.15],
      [135000, 0.3],
      [190000, 0.37],
      [Infinity, 0.45],
    ],
    nonres: [
      [135000, 0.3],
      [190000, 0.37],
      [Infinity, 0.45],
    ],
    whm: [
      [45000, 0.15],
      [135000, 0.3],
      [190000, 0.37],
      [Infinity, 0.45],
    ],
    medicare: { lo: 28011, hi: 35014, rate: 0.02, shade: 0.1 },
    help: { t1: 69528, t2: 129716, base2: 9028, capFrom: 186050, capRate: 0.1 },
    sg: 0.12,
    instantDeduction: 1000,
  },
};

const LITO = { max: 700, t1: 37500, taper1: 0.05, t2: 45000, taper2: 0.015 };
const PERIODS: Record<Period, number> = { weekly: 52, fortnightly: 26, monthly: 12, annual: 1 };
const PER_LABEL: Record<Period, string> = {
  weekly: "per week",
  fortnightly: "per fortnight",
  monthly: "per month",
  annual: "per year",
};
const COL_LABEL: Record<Period, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
  annual: "Annual",
};
const FREQ_TO_YEAR: Record<Frequency, number> = {
  annual: 1,
  monthly: 12,
  fortnightly: 26,
  weekly: 52,
};

const RES_NOTES: Record<Residency, React.ReactNode> = {
  resident: (
    <>
      <b>Tax residency is not your visa status.</b> If Australia is where you live, work and have a
      settled routine - including students and 482, 485 or 491 holders here 183 days or more - you are
      generally a resident for tax purposes, even without PR or citizenship.
    </>
  ),
  nonres: (
    <>
      <b>Check before choosing this.</b> Foreign resident rates generally apply only if your usual home
      is overseas. Most temporary visa holders living in Australia are residents for tax purposes and
      should select Australian resident. Unsure? Speak with us before lodging.
    </>
  ),
  whm: (
    <>
      These rates apply only to <b>417 and 462 visa holders</b>. On any other visa, choose Australian
      resident or foreign resident based on where your usual home is.
    </>
  ),
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

function bracketTax(ti: number, scale: Bracket[]) {
  let tax = 0;
  let prev = 0;
  for (const [cap, rate] of scale) {
    if (ti > prev) tax += (Math.min(ti, cap) - prev) * rate;
    prev = cap;
    if (ti <= cap) break;
  }
  return tax;
}

function marginalRate(ti: number, scale: Bracket[]) {
  let prev = 0;
  for (const [cap, rate] of scale) {
    if (ti > prev && ti <= cap) return rate;
    prev = cap;
  }
  return ti <= 0 ? 0 : scale[scale.length - 1][1];
}

function lito(ti: number) {
  if (ti <= LITO.t1) return LITO.max;
  if (ti <= LITO.t2) return Math.max(0, LITO.max - (ti - LITO.t1) * LITO.taper1);
  return Math.max(
    0,
    LITO.max - (LITO.t2 - LITO.t1) * LITO.taper1 - (ti - LITO.t2) * LITO.taper2
  );
}

function medicareLevy(ti: number, cfg: YearRates["medicare"]) {
  if (ti <= cfg.lo) return 0;
  if (ti >= cfg.hi) return ti * cfg.rate;
  return (ti - cfg.lo) * cfg.shade;
}

function helpRepay(ti: number, cfg: YearRates["help"]) {
  if (ti <= cfg.t1) return 0;
  if (ti >= cfg.capFrom) return ti * cfg.capRate;
  if (ti <= cfg.t2) return (ti - cfg.t1) * 0.15;
  return cfg.base2 + (ti - cfg.t2) * 0.17;
}

function calculate(
  gross: number,
  yearKey: FyKey,
  residency: Residency,
  hasHelp: boolean,
  useInstant: boolean,
  otherDeductions: number
) {
  const y = RATES[yearKey];
  const scale = y[residency];
  const instant = residency === "resident" && useInstant ? y.instantDeduction : 0;
  const deductions = Math.max(instant, otherDeductions || 0);
  const taxable = Math.max(0, gross - deductions);

  const grossTax = bracketTax(taxable, scale);
  const offset = residency === "resident" ? Math.min(lito(taxable), grossTax) : 0;
  const incomeTax = grossTax - offset;
  const levy = residency === "resident" ? medicareLevy(taxable, y.medicare) : 0;
  const help = hasHelp ? helpRepay(taxable, y.help) : 0;
  const total = incomeTax + levy + help;

  return {
    gross,
    deductions,
    instant,
    taxable,
    grossTax,
    offset,
    incomeTax,
    levy,
    help,
    total,
    net: gross - total,
    marginal: marginalRate(taxable, scale),
  };
}

type SlipRow = {
  label: string;
  sub?: string;
  annual: number;
  cls?: string;
  sign?: string;
  isTotal?: boolean;
};

const IncomeTaxCalculatorPage: React.FC = () => {
  const [fy, setFy] = useState<FyKey>("y2526");
  const [period, setPeriod] = useState<Period>("annual");
  const [income, setIncome] = useState(95000);
  const [freq, setFreq] = useState<Frequency>("annual");
  const [incSuper, setIncSuper] = useState(false);
  const [residency, setResidency] = useState<Residency>("resident");
  const [hasHelp, setHasHelp] = useState(false);
  const [useInstant, setUseInstant] = useState(true);
  const [deductions, setDeductions] = useState(0);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [consentAll, setConsentAll] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [leadStatus, setLeadStatus] = useState<{ text: string; kind: "" | "ok" | "err" }>({
    text: "",
    kind: "",
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const showInstant = fy === "y2627" && residency === "resident";
  const y = RATES[fy];

  const { result, slipRows } = useMemo(() => {
    const entered = (Number(income) || 0) * FREQ_TO_YEAR[freq];
    const superAmount = incSuper ? entered - entered / (1 + y.sg) : 0;
    const gross = incSuper ? entered / (1 + y.sg) : entered;
    const applyInstant = showInstant && useInstant;
    const r = calculate(gross, fy, residency, hasHelp, applyInstant, Number(deductions) || 0);

    const rows: SlipRow[] = [];
    rows.push({
      label: "Gross income",
      sub: incSuper ? "Excludes the 12% super shown below" : undefined,
      annual: r.gross,
    });
    if (incSuper) {
      rows.push({
        label: "Employer super",
        sub: "Paid to your fund, not to you",
        annual: superAmount,
        cls: "muted",
      });
    }
    if (r.deductions > 0) {
      const dLabel =
        r.instant > 0 && r.deductions === r.instant
          ? "$1,000 instant deduction"
          : "Work-related deductions";
      rows.push({
        label: dLabel,
        sub: "Reduces your taxable income",
        annual: r.deductions,
        cls: "muted",
        sign: "-",
      });
      rows.push({ label: "Taxable income", annual: r.taxable });
    }
    rows.push({
      label: "Income tax",
      sub: r.offset > 0 ? "After LITO of " + money(r.offset) : undefined,
      annual: r.incomeTax,
      cls: "neg",
      sign: "-",
    });
    if (residency === "resident") {
      rows.push({
        label: "Medicare levy",
        sub: r.levy === 0 ? "Below the low-income threshold" : "2% of taxable income",
        annual: r.levy,
        cls: "neg",
        sign: "-",
      });
    }
    if (hasHelp) {
      rows.push({
        label: "HECS-HELP repayment",
        sub: "Marginal system, " + y.label + " thresholds",
        annual: r.help,
        cls: "neg",
        sign: "-",
      });
    }
    rows.push({ label: "Take-home pay", annual: r.net, isTotal: true });

    return { result: r, slipRows: rows };
  }, [income, freq, incSuper, fy, residency, hasHelp, showInstant, useInstant, deductions, y]);

  const div = PERIODS[period];

  const handleLeadSubmit = async () => {
    const name = leadName.trim();
    const email = leadEmail.trim();
    const phone = leadPhone.trim();

    if (!name || !email) {
      setLeadStatus({
        text: "Add your name and email so we can get back to you.",
        kind: "err",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLeadStatus({
        text: "That email address doesn't look right - check and try again.",
        kind: "err",
      });
      return;
    }

    const snapshot = {
      financial_year: RATES[fy].label,
      residency,
      income: Number(income) || 0,
      income_frequency: freq,
      has_help: hasHelp,
      tax: result?.incomeTax ?? null,
      medicare: result?.levy ?? null,
      help_repayment: result?.help ?? null,
      net: result?.net ?? null,
      display_period: period,
    };

    setLeadSubmitting(true);
    setLeadStatus({ text: "", kind: "" });
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            name,
            email,
            phone,
            mobile: phone || null,
            source: LEAD_SOURCE,
            service_interest: "individual_tax",
            callback_requested: !!phone,
            marketing_optin: consentAll,
            consent: {
              email: true,
              sms: !!phone && consentAll,
              whatsapp: false,
            },
            calculator_snapshot: snapshot,
          },
          touchpoint: {
            channel: "calculator",
            source: LEAD_SOURCE,
            page: "/income-tax-calculator",
            captured_at: new Date().toISOString(),
          },
          source: LEAD_SOURCE,
          calculatorSnapshot: snapshot,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(body.message || "Could not submit — please try again.");
      }
      setLeadStatus({
        text: "Thanks " + name + " - we'll be in touch shortly.",
        kind: "ok",
      });
    } catch (e) {
      setLeadStatus({
        text: e instanceof Error ? e.message : "Something went wrong. Please try again.",
        kind: "err",
      });
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div className="itc">
      <header>
        <div className="wrap">
          <div className="eyebrow">Free Calculator | Nanak Accountants &amp; Associates</div>
          <h1>
            Work out your <span className="hl">income tax</span> for 2025-26 and 2026-27
          </h1>
          <p className="header-note">
            Built by registered tax agents. Resident, foreign resident and working holiday maker rates,
            the Medicare levy, LITO, HECS-HELP marginal repayments and the 15% bracket cut from 1 July
            2026.
          </p>
          <div className="trust-row">
            <span>Registered Tax Agent 26113345</span>
            <span>Trusted by 5,000+ businesses</span>
            <span>Rated 5 stars from 1,000+ reviews</span>
          </div>
        </div>
      </header>

      <main>
        <div className="wrap">
          <div className="grid">
            <section className="panel" aria-label="Your details">
              <h2>Your details</h2>

              <div className="field">
                <label>Financial year</label>
                <div className="seg" role="group" aria-label="Financial year">
                  <button
                    type="button"
                    className={fy === "y2526" ? "active" : ""}
                    onClick={() => setFy("y2526")}
                  >
                    2025-26
                  </button>
                  <button
                    type="button"
                    className={fy === "y2627" ? "active" : ""}
                    onClick={() => setFy("y2627")}
                  >
                    2026-27
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="itc-income">Income before tax</label>
                <div className="row2">
                  <input
                    type="number"
                    id="itc-income"
                    min={0}
                    step={500}
                    value={income}
                    inputMode="decimal"
                    aria-label="Income amount"
                    onChange={(e) => setIncome(Number(e.target.value))}
                  />
                  <select
                    id="itc-freq"
                    aria-label="Income frequency"
                    value={freq}
                    onChange={(e) => setFreq(e.target.value as Frequency)}
                  >
                    <option value="annual">per year</option>
                    <option value="monthly">per month</option>
                    <option value="fortnightly">per fortnight</option>
                    <option value="weekly">per week</option>
                  </select>
                </div>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={incSuper}
                  onChange={(e) => setIncSuper(e.target.checked)}
                />
                <span>
                  Amount includes super
                  <small>Tick if your package is quoted inclusive of the 12% super guarantee</small>
                </span>
              </label>

              <div className="field">
                <label htmlFor="itc-residency">Residency for tax purposes</label>
                <select
                  id="itc-residency"
                  value={residency}
                  onChange={(e) => setResidency(e.target.value as Residency)}
                >
                  <option value="resident">Australian resident (incl. most temporary visas)</option>
                  <option value="nonres">Foreign resident (usual home overseas)</option>
                  <option value="whm">Working holiday maker (417 / 462 visa)</option>
                </select>
                <div className={`res-note${residency === "nonres" ? " warn" : ""}`}>
                  {RES_NOTES[residency]}
                </div>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={hasHelp}
                  onChange={(e) => setHasHelp(e.target.checked)}
                />
                <span>
                  I have a HECS-HELP debt
                  <small>Includes HELP, VSL, SSL and AASL study loans</small>
                </span>
              </label>

              {showInstant && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={useInstant}
                    onChange={(e) => setUseInstant(e.target.checked)}
                  />
                  <span>
                    $1,000 instant work deduction
                    <small>
                      New for 2026-27 - a flat deduction for work expenses, no receipts needed.
                      Australian residents with work income.
                    </small>
                  </span>
                </label>
              )}

              <div className="field">
                <label htmlFor="itc-deductions">Other work-related deductions (per year)</label>
                <input
                  type="number"
                  id="itc-deductions"
                  min={0}
                  step={100}
                  value={deductions}
                  inputMode="decimal"
                  onChange={(e) => setDeductions(Number(e.target.value))}
                />
                <p className="hint">
                  Claim the $1,000 flat deduction or your actual expenses with receipts - not both.
                  Enter actuals here if they are higher.
                </p>
              </div>
            </section>

            <section aria-label="Your results">
              <div className="headline">
                <div className="lbl">Your estimated tax</div>
                <div className="big">{money(result.total / div)}</div>
                <div className="per">
                  {PER_LABEL[period]} - income tax, Medicare levy
                  {hasHelp ? " and HELP" : ""}
                </div>
                <div className="period-tabs" role="group" aria-label="Display period">
                  {(
                    [
                      ["weekly", "Weekly"],
                      ["fortnightly", "Fortnightly"],
                      ["monthly", "Monthly"],
                      ["annual", "Annual"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={period === key ? "active" : ""}
                      onClick={() => setPeriod(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="rate-chips">
                  <span className="chip">
                    Effective tax rate:{" "}
                    {result.gross > 0 ? ((result.total / result.gross) * 100).toFixed(1) : "0.0"}%
                  </span>
                  <span className="chip">
                    Marginal rate: {(result.marginal * 100).toFixed(0)}%
                  </span>
                  <span className="chip">
                    Take-home: {money(result.net / div)} {PER_LABEL[period]}
                  </span>
                </div>
              </div>

              <div className="panel payslip">
                <table aria-label="Tax breakdown">
                  <thead>
                    <tr>
                      <th>Breakdown</th>
                      <th>{COL_LABEL[period]}</th>
                      <th>Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slipRows.map((row) => {
                      if (row.isTotal) {
                        return (
                          <tr key={row.label} className="total">
                            <td>{row.label}</td>
                            <td>{money(row.annual / div)}</td>
                            <td>{money(row.annual)}</td>
                          </tr>
                        );
                      }
                      const sign = row.sign || "";
                      const amountClass = row.cls === "neg" ? "neg" : "";
                      return (
                        <tr key={row.label} className={row.cls || undefined}>
                          <td>
                            {row.label}
                            {row.sub ? <span className="sub">{row.sub}</span> : null}
                          </td>
                          <td className={amountClass}>
                            {sign}
                            {money(row.annual / div)}
                          </td>
                          <td className={amountClass}>
                            {sign}
                            {money(row.annual)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lead">
                <h3>
                  Ready to <span className="hl">do your tax return with us?</span>
                </h3>
                <p>Leave your details and one of our accountants will get back to you.</p>
                <div className="lead-grid">
                  <input
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    aria-label="Name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    aria-label="Email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                  <input
                    type="tel"
                    placeholder="Mobile"
                    autoComplete="tel"
                    aria-label="Mobile"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                  />
                  <button
                    className="btn"
                    type="button"
                    disabled={leadSubmitting}
                    onClick={handleLeadSubmit}
                  >
                    Get started
                  </button>
                </div>
                {leadStatus.text ? (
                  <div className={`status ${leadStatus.kind}`} role="status">
                    {leadStatus.text}
                  </div>
                ) : null}
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={consentAll}
                    onChange={(e) => setConsentAll(e.target.checked)}
                  />
                  <span>
                    Keep me updated with tax tips and reminders by email, text and phone. Opt out any
                    time.{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsOpen((o) => !o);
                      }}
                    >
                      Full terms
                    </a>
                  </span>
                </label>
                <p className={`terms-full${termsOpen ? " open" : ""}`}>
                  I agree to receive marketing from Nanak Accountants &amp; Associates by email, text
                  message and phone call. I understand calls may be automated, pre-recorded or use an
                  AI voice, that standard message rates may apply, and that this consent applies even if
                  my number is on the Do Not Call Register. I can opt out any time by replying STOP to a
                  text, using the unsubscribe link in any email, or asking not to receive further calls.
                </p>
                <p className="alt-links">
                  Optional - you&apos;ll get your results either way.{" "}
                  <a
                    href="https://nanakaccountants.com.au/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>{" "}
                  &nbsp;|&nbsp;{" "}
                  <a
                    href="https://calendly.com/nanakaccountant"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book a time
                  </a>{" "}
                  &nbsp;|&nbsp; <a href="tel:1300626258">1300 626 258</a>
                </p>
              </div>
            </section>
          </div>

          <footer>
            <p>
              General advice only - not tax or financial advice. Estimates use the resident, foreign
              resident and working holiday maker rates legislated for 2025-26 and 2026-27, the 2%
              Medicare levy with the singles low-income reduction, LITO, and the HECS-HELP marginal
              repayment system. Excludes the Medicare levy surcharge, family and seniors thresholds,
              offsets other than LITO, and reportable fringe benefits or super contributions. Residency
              for tax purposes is set by the ATO&apos;s residency tests, not your visa. Your
              circumstances may change the result - speak with us on{" "}
              <a href="tel:1300626258">1300 626 258</a>.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default IncomeTaxCalculatorPage;
