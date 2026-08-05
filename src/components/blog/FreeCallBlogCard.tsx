import { useState } from "react";
import { submitBlogQuizLead } from "@/hooks/useBlogs";

const MAP: Record<
  string,
  { svc: string; base: number; focus: string; teaser: string }
> = {
  employee: {
    svc: "individual_tax",
    base: 70,
    focus: "deductions_super",
    teaser:
      "Most useful for you: what you can actually claim, and whether your super is doing its job.",
  },
  sole_trader: {
    svc: "business_tax",
    base: 80,
    focus: "structure_expenses",
    teaser:
      "Most useful for you: whether your sole trader setup still fits your turnover, and what it costs if not.",
  },
  company_trust: {
    svc: "business_advisory",
    base: 90,
    focus: "structure_cost_optimisation",
    teaser:
      "Most useful for you: distributions, Division 7A exposure, and whether every entity still earns its keep.",
  },
  investor: {
    svc: "property_tax",
    base: 85,
    focus: "loans_depreciation_cgt",
    teaser:
      "Most useful for you: depreciation you may be missing, and your CGT position before you sell.",
  },
};

const PROFILES: [string, string][] = [
  ["employee", "Salary earner"],
  ["sole_trader", "Sole trader / ABN"],
  ["company_trust", "Company or trust"],
  ["investor", "Investor"],
];

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const mobileOk = (v: string) => {
  const d = v.replace(/[^\d]/g, "");
  return d.length >= 9 && d.length <= 12;
};

export interface FreeCallBlogCardProps {
  slug: string;
  articleTitle: string;
  category?: string;
  blogId?: string;
}

/** v4 Free 15-minute call card — shown on every published blog post. */
export function FreeCallBlogCard({
  slug,
  articleTitle,
  category,
}: FreeCallBlogCardProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [emailBad, setEmailBad] = useState(false);
  const [mobileBad, setMobileBad] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const pickProfile = (v: string) => {
    setProfile(v);
    setTimeout(() => setStep(2), 150);
  };

  const onSubmit = async () => {
    const em = email.trim();
    const mo = mobile.trim();
    const eBad = !emailOk(em);
    const mBad = !mobileOk(mo);
    setEmailBad(eBad);
    setMobileBad(mBad);
    if (eBad || mBad || !profile) return;

    const m = MAP[profile];
    setSubmitting(true);

    const payload = {
      lead: {
        email: em,
        mobile: mo,
        status: "new",
        record_type: "lead",
        service_interest: m.svc,
        lead_score: m.base,
        callback_requested: true,
        marketing_optin: true,
        consent: {
          email_marketing: "case_study_plus_tips_v1",
          mobile: "free_15min_call_v1",
        },
        quiz_answers: { profile, review_focus: m.focus },
        company_website: "",
      },
      touchpoint: {
        channel: "blog",
        source: "free_15min_call",
        page: `/blog/${slug}`,
        article_title: articleTitle,
        category: category || null,
        captured_at: new Date().toISOString(),
      },
    };

    try {
      await submitBlogQuizLead(slug, payload);
      setDone(true);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="nbc">
      <style>{`
        .nbc{--o:#F26B21;--od:#D9550E;--os:#FEF1E8;--navy:#1B2A4A;--grey:#6B7280;--faint:#9CA3AF;
          --line:#E5E7EB;--green:#0E7C4A;
          max-width:660px;margin:30px auto;background:#fff;border:1.5px solid var(--line);
          border-radius:16px;overflow:hidden;font-family:inherit;color:#22252A;
          box-shadow:0 3px 16px rgba(27,42,74,.07)}
        .nbc *{box-sizing:border-box}
        .nbc-top{background:linear-gradient(135deg,#1B2A4A,#25395F);padding:14px 20px 13px;color:#fff;position:relative;overflow:hidden}
        .nbc-top:after{content:'';position:absolute;right:-40px;top:-40px;width:150px;height:150px;
          border-radius:50%;background:rgba(242,107,33,.16)}
        .nbc-flag{display:inline-block;background:var(--o);color:#fff;font-size:9px;font-weight:800;
          letter-spacing:.09em;text-transform:uppercase;padding:3px 7px;border-radius:4px;margin-bottom:6px}
        .nbc-h{font-size:18px;font-weight:800;line-height:1.2;letter-spacing:-0.01em;position:relative}
        .nbc-h span{color:#FFB27D}
        .nbc-p{font-size:12.5px;color:#C3CDE2;margin-top:4px;position:relative;line-height:1.45}
        .nbc-body{padding:14px 20px 15px}
        .nbc-gets{display:flex;flex-wrap:wrap;gap:4px 14px;margin-bottom:12px}
        .nbc-get{display:inline-flex;gap:5px;align-items:center;font-size:11.8px;color:#4B5563;line-height:1.3;white-space:nowrap}
        .nbc-get b{color:var(--green);flex:0 0 auto;font-weight:800}
        .nbc-q{font-size:13px;font-weight:700;margin-bottom:8px}
        .nbc-chips{display:flex;flex-wrap:wrap;gap:7px}
        .nbc-chip{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:8px 13px;
          font-size:12.5px;font-family:inherit;cursor:pointer;transition:all .15s;color:#22252A;line-height:1.2}
        .nbc-chip:hover{border-color:var(--o);background:var(--os)}
        .nbc-chip.sel{border-color:var(--o);background:var(--o);color:#fff;font-weight:600}
        .nbc-step{display:none}
        .nbc-step.on{display:block;animation:nbcfade .22s ease}
        @keyframes nbcfade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        .nbc-teaser{font-size:12.3px;font-weight:700;color:var(--navy);background:var(--os);
          border-left:3px solid var(--o);border-radius:0 7px 7px 0;padding:8px 11px;margin-bottom:10px;line-height:1.35}
        .nbc-fields{display:grid;grid-template-columns:1fr 1fr;gap:9px}
        @media(max-width:560px){.nbc-fields{grid-template-columns:1fr}}
        .nbc-f{position:relative}
        .nbc-field{width:100%;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;
          font-size:14px;font-family:inherit;outline:none;background:#fff}
        .nbc-field:focus{border-color:var(--o)}
        .nbc-field.bad{border-color:#DC2626;background:#FFFBFB}
        .nbc-e{font-size:11.5px;color:#DC2626;margin-top:4px;display:none}
        .nbc-e.on{display:block}
        .nbc-btn{width:100%;margin-top:9px;background:linear-gradient(135deg,#F58540,#F26B21);color:#fff;
          border:none;cursor:pointer;padding:12px 18px;border-radius:10px;font-size:14.5px;font-weight:800;
          font-family:inherit;transition:filter .15s,transform .1s}
        .nbc-btn:hover{filter:brightness(1.06)}
        .nbc-btn:active{transform:scale(.99)}
        .nbc-btn:disabled{opacity:.65;cursor:default}
        .nbc-micro{font-size:10.8px;color:var(--grey);margin-top:7px;text-align:center;line-height:1.4}
        .nbc-back{background:none;border:none;color:var(--grey);font-size:11px;cursor:pointer;
          font-family:inherit;margin-top:7px;padding:2px 0;text-decoration:underline;display:block}
        .nbc-done{display:none;text-align:center;padding:2px 0}
        .nbc-done.on{display:block}
        .nbc-done .tick{width:38px;height:38px;border-radius:50%;background:var(--green);color:#fff;
          display:flex;align-items:center;justify-content:center;font-size:19px;margin:0 auto 8px}
        .nbc-done h4{font-size:15.5px;font-weight:800;color:var(--navy);margin:0}
        .nbc-done p{font-size:12.3px;color:var(--grey);margin-top:4px;line-height:1.45}
        .nbc-trust{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;
          padding:8px 20px 9px;background:#FAF8F5;border-top:1px solid var(--line)}
        .nbc-trust span{font-size:10.8px;color:var(--grey);white-space:nowrap;display:inline-flex;align-items:center;gap:5px}
        .nbc-trust b{color:var(--o);font-weight:800}
        .nbc-disc{font-size:9.5px;color:var(--faint);line-height:1.4;padding:0 20px 10px;text-align:center}
        .nbc-btn:focus-visible,.nbc-chip:focus-visible,.nbc-field:focus-visible{outline:3px solid rgba(242,107,33,.4);outline-offset:2px}
        @media(prefers-reduced-motion:reduce){.nbc *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="nbc-top">
        <span className="nbc-flag">Free · No obligation</span>
        <div className="nbc-h">
          Talk to a real accountant for <span>15 minutes</span>
        </div>
        <div className="nbc-p">
          Bring one question. We&apos;ll tell you straight if it needs work - and if it
          doesn&apos;t, we&apos;ll say that too.
        </div>
      </div>

      <div className="nbc-body">
        <div className="nbc-gets">
          <div className="nbc-get">
            <b>✓</b>
            <span>Registered tax agent</span>
          </div>
          <div className="nbc-get">
            <b>✓</b>
            <span>No sales script</span>
          </div>
          <div className="nbc-get">
            <b>✓</b>
            <span>Case study by email</span>
          </div>
          <div className="nbc-get">
            <b>✓</b>
            <span>Booked within 1 business day</span>
          </div>
        </div>

        {!done ? (
          <div>
            <div className={`nbc-step${step === 1 ? " on" : ""}`}>
              <div className="nbc-q">First - which best describes you?</div>
              <div className="nbc-chips">
                {PROFILES.map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    className={`nbc-chip${profile === v ? " sel" : ""}`}
                    onClick={() => pickProfile(v)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`nbc-step${step === 2 ? " on" : ""}`}>
              <div className="nbc-teaser">
                {profile ? MAP[profile].teaser : ""}
              </div>
              <div className="nbc-fields">
                <div className="nbc-f">
                  <input
                    className={`nbc-field${emailBad ? " bad" : ""}`}
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailBad(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                  />
                  <div className={`nbc-e${emailBad ? " on" : ""}`}>Enter a valid email</div>
                </div>
                <div className="nbc-f">
                  <input
                    className={`nbc-field${mobileBad ? " bad" : ""}`}
                    type="tel"
                    placeholder="Mobile"
                    autoComplete="tel"
                    inputMode="tel"
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      setMobileBad(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                  />
                  <div className={`nbc-e${mobileBad ? " on" : ""}`}>
                    Enter a valid Australian mobile
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="nbc-btn"
                disabled={submitting}
                onClick={onSubmit}
              >
                {submitting ? "Booking..." : "Book my free 15 minutes"}
              </button>
              <div className="nbc-micro">
                We call once to arrange a time. Mobile used for this call only. Tax tips by
                email - unsubscribe anytime.
              </div>
              <button type="button" className="nbc-back" onClick={() => setStep(1)}>
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="nbc-done on">
            <div className="tick">✓</div>
            <h4>Booked - we&apos;ll call you</h4>
            <p>
              An accountant will ring to lock in your 15 minutes, usually within one business
              day. Case study on its way to your inbox.
            </p>
          </div>
        )}
      </div>

      <div className="nbc-trust">
        <span>
          <b>✓</b> Registered Tax Agent 26113345
        </span>
        <span>
          <b>★</b> 1,000+ five-star Google reviews
        </span>
        <span>
          <b>✓</b> 8+ offices Australia-wide
        </span>
      </div>
      <div className="nbc-disc">
        General information only. The call is not personal tax, financial or legal advice.
      </div>
    </div>
  );
}

/** @deprecated Use FreeCallBlogCard — kept as alias for existing imports */
export const TaxCheckBlogCard = FreeCallBlogCard;
