import React, { useState, useMemo, useEffect } from "react";
import {
  Check, TrendingUp, Sparkles, Target,
  DollarSign, FileText, BarChart2, Briefcase,
  Phone, Mail, User, Shield, Clock, CheckCircle2,
  ChevronRight, ChevronLeft, Lock, Calendar, Building2,
} from "lucide-react";

import { SoftInput } from "@/components/checkout/FormInputs";
import { validateEmail, validatePhone, validateABNOptional } from "@/utils/validation";
import { submitCheckout } from "@/utils/submitCheckout";
import { toast } from "sonner";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { TPBBadge } from "@/components/checkout/shared/TPBBadge";
import { useTieredPricing } from "@/hooks/useTieredPricing";

// ─── Pricing Data (static fallbacks, overridden by API) ───────────────────────
const STATIC_PLANS = [
  {
    id: "startup",
    label: "Startup",
    subtitle: "Pre-launch or just established",
    badge: "Pre-launch / Startup stage",
    price: 990,
    icon: Sparkles,
    recommended: false,
    features: [
      "3-5 year financial projections (P&L, Cash Flow)",
      "Market analysis & competitor research",
      "Executive summary & business overview",
      "Marketing & sales strategy",
      "Professional graphic design",
      "Unlimited revisions (30 days)",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    subtitle: "Established and scaling operations",
    badge: "1-3 years in business",
    price: 1299,
    icon: TrendingUp,
    recommended: true,
    features: [
      "3-5 year comprehensive financial projections",
      "In-depth market & competitor analysis",
      "Growth strategy & expansion roadmap",
      "Marketing plan with customer acquisition",
      "Operational & organizational structure",
      "Premium graphic design & formatting",
      "Unlimited revisions (30 days)",
    ],
  },
  {
    id: "established",
    label: "Established",
    subtitle: "Mature business seeking funding",
    badge: "3+ years in business",
    price: 1499,
    icon: Target,
    recommended: false,
    features: [
      "Comprehensive 3-5 year financial projections",
      "Historical performance analysis",
      "Advanced market positioning & strategy",
      "Detailed marketing & growth plan",
      "Risk assessment & mitigation strategies",
      "Management & operations analysis",
      "Premium design + Pitch deck included",
      "Unlimited revisions (30 days)",
    ],
  },
];

const STATIC_ADDONS = [
  { id: "pitch_deck", label: "Investor Pitch Deck", price: 750 },
  { id: "excel_model", label: "Excel Financial Model", price: 500 },
  { id: "pitch_training", label: "Investor Presentation Training", price: 650 },
  { id: "rush_delivery", label: "Rush Delivery (3-4 business days)", price: 500 },
];

// Icon map for merging API data with local icons
const PLAN_ICON_MAP: Record<string, React.ElementType> = {
  startup: Sparkles,
  growth: TrendingUp,
  established: Target,
};

function buildPlans(apiPlans: ReturnType<typeof useTieredPricing>["plans"]): PlanItem[] {
  return apiPlans.map((ap) => ({
    ...ap,
    icon: PLAN_ICON_MAP[ap.id] || Sparkles,
  }));
}

// Shared plan type used across all sub-components
type PlanItem = {
  id: string;
  label: string;
  subtitle: string;
  badge: string | null;
  price: number;
  icon: React.ElementType;
  recommended: boolean;
  features: string[];
  delivery?: string;
};

const PLANS: PlanItem[] = STATIC_PLANS;
const ADDONS = STATIC_ADDONS;

const PURPOSES = [
  { id: "bank_loan", label: "Bank Loan Application", icon: DollarSign, sub: "Financing & capital" },
  { id: "investor", label: "Investor Pitch / Venture Capital", icon: TrendingUp, sub: "Equity funding" },
  { id: "grant", label: "Grant Application", icon: FileText, sub: "Government grants" },
  { id: "strategic", label: "Strategic Planning & Internal Use", icon: Target, sub: "Internal planning" },
  { id: "migration", label: "Migration Purpose", icon: Briefcase, sub: "Visa sponsorship" },
];

const INDUSTRY_OPTIONS = [
  { value: "retail", label: "Retail & E-commerce" },
  { value: "hospitality", label: "Hospitality & Food Services" },
  { value: "professional", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare & Medical" },
  { value: "technology", label: "Technology & Software" },
  { value: "construction", label: "Construction & Trades" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education & Training" },
  { value: "financial", label: "Financial Services" },
  { value: "other", label: "Other" },
];

const YEARS_OPTIONS = [
  { value: "prelaunch", label: "Pre-launch / Startup" },
  { value: "1-3", label: "1-3 years" },
  { value: "3plus", label: "3+ years" },
];

const FUNDING_OPTIONS = [
  { value: "", label: "Select funding amount" },
  { value: "under_100k", label: "Under $100,000" },
  { value: "100k_500k", label: "$100,000 – $500,000" },
  { value: "500k_1m", label: "$500,000 – $1,000,000" },
  { value: "1m_5m", label: "$1,000,000 – $5,000,000" },
  { value: "5m_plus", label: "$5,000,000+" },
  { value: "not_sure", label: "Not sure yet" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcPricing(plan: typeof PLANS[0], addOns: string[], addonsSource: typeof ADDONS = ADDONS) {
  const addOnTotal = addonsSource.filter((a) => addOns.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const subtotal = plan.price + addOnTotal;
  const gst = Math.round(subtotal * 0.1);
  const total = subtotal + gst;
  const deposit = Math.round(total * 0.5 * 100) / 100;
  return { addOnTotal, subtotal, gst, total, deposit };
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
const OrderSummary: React.FC<{ plan: typeof PLANS[0]; addOns: string[]; addonsSource?: typeof ADDONS }> = ({ plan, addOns, addonsSource = ADDONS }) => {
  const { addOnTotal, subtotal, gst, total, deposit } = calcPricing(plan, addOns, addonsSource);
  const isRush = addOns.includes("rush_delivery");
  const deliveryDays = isRush ? "3-4" : "5-8";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm sticky top-4">
      <div className="bg-primary text-primary-foreground px-5 py-4 rounded-t-xl">
        <h3 className="font-semibold text-lg">Order Summary</h3>
      </div>
      <div className="p-5 space-y-4">

      <div className="space-y-2 text-sm border-b border-border pb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{plan.label} Plan</span>
          <span className="font-medium">${plan.price.toLocaleString()}</span>
        </div>
        {addonsSource.filter((a) => addOns.includes(a.id)).map((a) => (
          <div key={a.id} className="flex justify-between">
            <span className="text-muted-foreground text-xs">
              {a.label} <span className="text-[hsl(var(--cta))]">(Add-on)</span>
            </span>
            <span className="font-medium">${a.price}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 text-sm border-b border-border pb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (10%)</span>
          <span>${gst}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1">
          <span>Total</span>
          <span className="text-[hsl(var(--cta))]">${total.toLocaleString()}</span>
        </div>
      </div>

      {/* Deposit highlight */}
      <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-3 text-center">
        <p className="text-[10px] font-bold text-[hsl(var(--cta))] uppercase tracking-widest mb-1">Deposit Required to Start</p>
        <p className="text-2xl font-extrabold text-[hsl(var(--cta))]">${deposit.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">Balance due upon delivery</p>
      </div>

      {/* ABN-style trust badges */}
      <div className="space-y-2.5">
        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(142_71%_35%)]">100% Money-Back Guarantee</p>
            <p className="text-xs text-[hsl(142_71%_45%)]">Risk-free service</p>
          </div>
        </div>

        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Secure Payment</p>
            <p className="text-xs text-[hsl(142_71%_45%)]">256-bit SSL encryption</p>
          </div>
        </div>

        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Fast Processing</p>
            <p className="text-xs text-[hsl(142_71%_45%)]">{deliveryDays} business days</p>
          </div>
        </div>
      </div>

      <TPBBadge />
      </div>
    </div>
  );
};

// ─── Stepper ──────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Business Info", "Requirements", "Review & Pay"];

const Stepper: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEP_LABELS.map((label, i) => {
      const num = i + 1;
      const done = step > num;
      const active = step === num;
      return (
        <React.Fragment key={num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                done || active
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              {done ? <Check className="w-4 h-4" /> : num}
            </div>
            <span className={`text-xs mt-1 font-medium ${active || done ? "text-foreground" : "text-muted-foreground"} ${!active ? "hidden sm:block" : ""}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`h-0.5 w-12 sm:w-24 mx-1 mb-4 transition-colors ${
                step > num ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Pill selector ────────────────────────────────────────────────────────────
interface PillOption { value: string; label: string }
const PillSelector: React.FC<{
  label: string;
  required?: boolean;
  options: PillOption[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
}> = ({ label, required, options, value, onChange, error, hint }) => (
  <div>
    <label className="form-label">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
              active
                ? "border-cta bg-cta/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-cta/40"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);

// ─── Step 1: Business Info ────────────────────────────────────────────────────
const Step1BusinessInfo: React.FC<{
  plan: typeof PLANS[0];
  data: any;
  onChange: (k: string, v: string) => void;
  errors: Record<string, string>;
  onNext: () => void;
}> = ({ plan, data, onChange, errors, onNext }) => (
  <div>
    <h2 className="text-2xl font-bold text-foreground text-center mb-1">Tell Us About Your Business</h2>
    <p className="text-muted-foreground text-center text-sm mb-6">
      {plan.label} Plan – ${plan.price.toLocaleString()} + GST
    </p>

    <div className="space-y-5">
      {/* Primary Purpose */}
      <div>
        <label className="form-label">
          Primary Purpose <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {PURPOSES.map((p) => {
            const Icon = p.icon;
            const active = data.purpose === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange("purpose", p.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  active ? "border-cta bg-cta/5" : "border-border hover:border-cta/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-cta/12" : "bg-muted"}`}>
                  <Icon className={`w-4 h-4 ${active ? "text-cta" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.sub}</p>
                </div>
                {active && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-cta flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.purpose && <p className="mt-1 text-xs text-destructive">{errors.purpose}</p>}
      </div>

      <SoftInput
        label="Business Name"
        required
        placeholder="Enter your business name"
        value={data.businessName}
        onChange={(e) => onChange("businessName", e.target.value)}
        error={errors.businessName}
      />

      <div>
        <SoftInput
          label="Business ABN (if registered)"
          placeholder="12 345 678 901"
          icon={<span className="text-muted-foreground text-sm">#</span>}
          value={data.abn}
          onChange={(e) => onChange("abn", e.target.value)}
          error={errors.abn}
        />
        <p className="text-xs text-muted-foreground mt-1">Optional – Leave blank if not yet registered</p>
      </div>

      {/* Industry as dropdown */}
      <div>
        <label className="form-label">
          Industry / Sector <span className="text-destructive">*</span>
        </label>
        <div className="relative mt-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Briefcase className="w-4 h-4" />
          </div>
          <select
            value={data.industry || ""}
            onChange={(e) => onChange("industry", e.target.value)}
            className={`soft-select pl-10 ${errors.industry ? "border-destructive" : ""}`}
          >
            <option value="">Select your industry</option>
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {errors.industry && <p className="mt-1 text-xs text-destructive">{errors.industry}</p>}
      </div>

      {/* Other Industry Field */}
      {data.industry === "other" && (
        <SoftInput
          label="Please specify your industry"
          required
          placeholder="e.g. Agriculture, Mining, etc."
          icon={<Briefcase className="w-4 h-4" />}
          value={data.otherIndustry || ""}
          onChange={(e) => onChange("otherIndustry", e.target.value)}
          error={errors.otherIndustry}
        />
      )}

      {/* Years in Business as dropdown */}
      <div>
        <label className="form-label">
          Years in Business <span className="text-destructive">*</span>
        </label>
        <div className="relative mt-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={data.yearsInBusiness || ""}
            onChange={(e) => onChange("yearsInBusiness", e.target.value)}
            className={`soft-select pl-10 ${errors.yearsInBusiness ? "border-destructive" : ""}`}
          >
            <option value="">Select years in operation</option>
            {YEARS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Your plan will be automatically adjusted based on business age</p>
        {errors.yearsInBusiness && <p className="mt-1 text-xs text-destructive">{errors.yearsInBusiness}</p>}
      </div>

      {/* Target Funding Amount as dropdown */}
      <div>
        <label className="form-label">Target Funding Amount</label>
        <div className="relative mt-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <DollarSign className="w-4 h-4" />
          </div>
          <select
            value={data.fundingAmount || ""}
            onChange={(e) => onChange("fundingAmount", e.target.value)}
            className="soft-select pl-10"
          >
            <option value="">Select funding amount</option>
            {FUNDING_OPTIONS.filter((o) => o.value !== "").map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>

    <div className="flex justify-end mt-8">
      <button onClick={onNext} className="btn-cta flex items-center gap-2">
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ─── Step 2: Requirements ─────────────────────────────────────────────────────
const Step2Requirements: React.FC<{
  plan: typeof PLANS[0];
  data: any;
  onChange: (k: string, v: string) => void;
  addOns: string[];
  onToggleAddOn: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  addonsSource?: typeof ADDONS;
}> = ({ data, onChange, addOns, onToggleAddOn, onBack, onNext, addonsSource = ADDONS }) => (
  <div>
    <h2 className="text-2xl font-bold text-foreground text-center mb-1">Customize Your Business Plan</h2>
    <p className="text-muted-foreground text-center text-sm mb-6">Tell us your specific requirements</p>

    <div className="space-y-6">
      {/* Projection Period */}
      <div>
        <label className="form-label">
          Financial Projection Period <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {[
            { id: "5years", label: "5 Years", sub: "Recommended for investors", recommended: true },
            { id: "3years", label: "3 Years", sub: "Standard for most bank loans" },
          ].map((opt) => {
            const active = data.projectionPeriod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange("projectionPeriod", opt.id)}
                className={`p-4 rounded-xl border-2 text-center relative transition-all ${
                  active ? "border-cta bg-cta/5" : "border-border hover:border-cta/30"
                }`}
              >
                <p className="font-bold text-lg text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.sub}</p>
                {opt.recommended && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cta text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                    Recommended
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add-ons - Rush Delivery only */}
      <div>
        <label className="form-label">Additional Services (Optional)</label>
        <div className="space-y-2 mt-1">
          {addonsSource.filter((a) => a.id === "rush_delivery").map((addon) => {
            const checked = addOns.includes(addon.id);
            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => onToggleAddOn(addon.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${
                  checked ? "border-cta bg-cta/4" : "border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      checked ? "bg-cta border-cta" : "border-border bg-background"
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">{addon.label}</span>
                </div>
                <span className="text-sm font-semibold text-cta">+${addon.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>

    <div className="flex justify-between mt-8">
      <button onClick={onBack} className="btn-secondary flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <button onClick={onNext} className="btn-cta flex items-center gap-2">
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ─── Step 3: Review & Pay ─────────────────────────────────────────────────────
const Step3ReviewPay: React.FC<{
  plan: typeof PLANS[0];
  addOns: string[];
  step1Data: any;
  step2Data: any;
  contactData: any;
  onChange: (k: string, v: string) => void;
  errors: Record<string, string>;
  agreed: boolean;
  onAgree: (v: boolean) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  addonsSource?: typeof ADDONS;
}> = ({ plan, addOns, step1Data, step2Data, contactData, onChange, errors, agreed, onAgree, isSubmitting, onBack, onSubmit, addonsSource = ADDONS }) => {
  const { deposit, subtotal, gst, total } = calcPricing(plan, addOns, addonsSource);
  const isRush = addOns.includes("rush_delivery");
  const industryLabel = INDUSTRY_OPTIONS.find(o => o.value === step1Data.industry)?.label || step1Data.industry;
  const purposeLabel = PURPOSES.find(p => p.id === step1Data.purpose)?.label || step1Data.purpose;
  const yearsLabel = YEARS_OPTIONS.find(o => o.value === step1Data.yearsInBusiness)?.label || step1Data.yearsInBusiness;
  const fundingLabel = FUNDING_OPTIONS.find(o => o.value === step1Data.fundingAmount)?.label || step1Data.fundingAmount;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground text-center mb-1">Review & Pay</h2>
      <p className="text-muted-foreground text-center text-sm mb-6">Confirm your details before proceeding to payment</p>

      {/* Contact Details */}
      <div className="space-y-4 mb-6">
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Contact Details</h3>
          </div>
          <div className="space-y-4 ml-11">
            <SoftInput label="Contact Person Name" required placeholder="John Smith" icon={<User className="w-4 h-4" />} value={contactData.name} onChange={(e) => onChange("name", e.target.value)} error={errors.name} />
            <SoftInput label="Email Address" required type="email" placeholder="john@example.com" icon={<Mail className="w-4 h-4" />} value={contactData.email} onChange={(e) => onChange("email", e.target.value)} error={errors.email} />
            <SoftInput label="Phone Number" required type="tel" placeholder="04XX XXX XXX" icon={<Phone className="w-4 h-4" />} value={contactData.phone} onChange={(e) => onChange("phone", e.target.value)} error={errors.phone} />
          </div>
        </div>

        {/* Business Details Preview */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Business Details</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Primary Purpose</span><span className="font-medium text-foreground">{purposeLabel || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Business Name</span><span className="font-medium text-foreground">{step1Data.businessName || "—"}</span></div>
            {step1Data.abn && <div className="flex justify-between"><span className="text-muted-foreground">ABN</span><span className="font-medium text-foreground">{step1Data.abn}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span className="font-medium text-foreground">{step1Data.industry === "other" ? step1Data.otherIndustry || "Other" : industryLabel || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Years in Business</span><span className="font-medium text-foreground">{yearsLabel || "—"}</span></div>
            {fundingLabel && <div className="flex justify-between"><span className="text-muted-foreground">Target Funding</span><span className="font-medium text-foreground">{fundingLabel}</span></div>}
          </div>
        </div>

        {/* Plan & Requirements Preview */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Plan & Requirements</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Selected Plan</span><span className="font-medium text-foreground">{plan.label} – ${plan.price.toLocaleString()}</span></div>
            {step2Data.projectionPeriod && <div className="flex justify-between"><span className="text-muted-foreground">Projection Period</span><span className="font-medium text-foreground">{step2Data.projectionPeriod === "5years" ? "5 Years" : "3 Years"}</span></div>}
            {addOns.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Add-ons</span>
                <span className="font-medium text-foreground text-right">{addonsSource.filter(a => addOns.includes(a.id)).map(a => a.label).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Total */}
        <div className="border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Order Total</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GST (10%)</span><span className="text-foreground">${gst}</span></div>
            <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-[hsl(var(--cta))]">${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit (50%)</span>
              <span className="font-bold text-[hsl(var(--cta))]">${deposit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Estimated Delivery</span>
        </div>
        <p className="text-sm font-bold text-[hsl(var(--cta))]">
          {isRush ? "3-4 business days" : "5-8 business days"}
        </p>
      </div>

      {/* What Happens Next */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-sm text-foreground">What Happens After Payment</span>
        </div>
        <ol className="space-y-2">
          {[
            { label: "Kickoff Call (24 hours)", desc: "We'll schedule a consultation to understand your requirements" },
            { label: "Information Gathering (2-3 days)", desc: "Our team collects financial data and business details" },
            { label: "Plan Development", desc: "We create your comprehensive business plan with financial projections" },
            { label: "Delivery & Revisions (30 days)", desc: "Receive your plan and request unlimited revisions" },
          ].map((s, i) => (
            <li key={i} className="flex gap-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">{i + 1}</span>
              <div><span className="font-semibold text-foreground">{s.label}</span><br /><span className="text-muted-foreground">{s.desc}</span></div>
            </li>
          ))}
        </ol>
      </div>

      {/* Terms checkbox */}
      <div className="p-3 border border-border rounded-xl mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => onAgree(!agreed)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${
              agreed ? "bg-foreground border-foreground" : "border-border bg-background"
            }`}
          >
            {agreed && <Check className="w-3 h-3 text-background" />}
          </div>
          <span className="text-xs text-muted-foreground">
            I agree to the <span className="text-[hsl(var(--cta))] underline cursor-pointer">Terms & Conditions</span> and authorize a 50% deposit payment of ${deposit.toLocaleString()} to commence work
          </span>
        </label>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!agreed || isSubmitting}
          className="btn-cta flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          {isSubmitting ? "Processing…" : `Pay $${deposit.toLocaleString()} (50% Deposit)`}
        </button>
      </div>
    </div>
  );
};

// ─── Landing: Pricing Cards ───────────────────────────────────────────────────
const PricingLanding: React.FC<{ plans: PlanItem[]; onSelect: (plan: typeof PLANS[0]) => void }> = ({ plans, onSelect }) => (
  <div className="min-h-screen bg-background">
    <div className="py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          Fixed Pricing for Bank Loans & Funding
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          Transparent pricing based on your business stage. Perfect for bank loan applications and investor presentations.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl overflow-hidden border-2 bg-card shadow-sm transition-shadow hover:shadow-md ${
                plan.recommended ? "border-cta" : "border-border"
              }`}
            >
              {plan.recommended && (
                <div className="bg-cta text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase">
                  Most Popular for Bank Loans
                </div>
              )}

              <div className="p-6 flex flex-col flex-grow">
                <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-cta" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-0.5">{plan.label}</h3>
                <p className="text-sm text-muted-foreground mb-2">{plan.subtitle}</p>

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4 self-start">
                  <Calendar className="w-3 h-3" />
                  {plan.badge}
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-foreground">${plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground ml-1">+ GST</span>
                </div>
                <p className="text-xs text-primary mb-5">5-8 business days delivery</p>

                {/* Features */}
                <ul className="space-y-2 flex-grow mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    window.open(`${baseUrl}/business-plan?plan=${plan.id}`, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-cta text-white hover:opacity-90"
                >
                  Order Your Business Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        50% deposit required to commence • Balance due upon delivery • 30-day unlimited revisions
      </p>
    </div>
  </div>
);

// Map years in business → plan
const YEARS_TO_PLAN: Record<string, string> = {
  prelaunch: "startup",
  "1-3": "growth",
  "3plus": "established",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BusinessPlanCheckoutPage: React.FC = () => {
  const { plans: apiPlans, addons: apiAddons } = useTieredPricing("business_plan");

  // Merge API pricing with local icon map
  const dynamicPlans = useMemo(() => buildPlans(apiPlans), [apiPlans]);
  const dynamicAddons = useMemo(() => apiAddons.length > 0 ? apiAddons : ADDONS, [apiAddons]);

  const searchParams = new URLSearchParams(window.location.search);
  const planParam = searchParams.get("plan");
  const planFromUrl = planParam ? dynamicPlans.find((p) => p.id === planParam) ?? null : null;

  const [initialPlan, setInitialPlan] = useState<typeof PLANS[0] | null>(planFromUrl);
  const [step, setStep] = useState(1);

  // Update initialPlan when API data loads — always sync with latest dynamic prices
  useEffect(() => {
    if (initialPlan) {
      const updated = dynamicPlans.find((p) => p.id === initialPlan.id);
      if (updated && updated.price !== initialPlan.price) setInitialPlan(updated);
    } else if (planParam) {
      const match = dynamicPlans.find((p) => p.id === planParam);
      if (match) setInitialPlan(match);
    }
  }, [dynamicPlans, planParam, initialPlan]);

  const [step1, setStep1] = useState({ purpose: "", businessName: "", abn: "", industry: "", yearsInBusiness: "", fundingAmount: "" });
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  const [step2, setStep2] = useState({ projectionPeriod: "", purpose2: "" });
  const [addOns, setAddOns] = useState<string[]>([]);

  const [step3, setStep3] = useState({ name: "", email: "", phone: "" });
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save state to sessionStorage for Try Again
  useEffect(() => {
    const key = `checkout_state_${window.location.pathname}`;
    try {
      sessionStorage.setItem(key, JSON.stringify({ step1, step2, step3, addOns, step, agreed }));
      sessionStorage.setItem("checkout_return_url", window.location.href);
    } catch { /* quota exceeded */ }
  }, [step1, step2, step3, addOns, step, agreed]);

  // Dynamically derive plan from yearsInBusiness; fall back to landing page selection
  const selectedPlan = useMemo(() => {
    if (step1.yearsInBusiness) {
      const planId = YEARS_TO_PLAN[step1.yearsInBusiness];
      const matched = dynamicPlans.find((p) => p.id === planId);
      if (matched) return matched;
    }
    return initialPlan;
  }, [step1.yearsInBusiness, initialPlan, dynamicPlans]);

  const update1 = (k: string, v: string) => {
    setStep1((p) => ({ ...p, [k]: v }));
    if (k === "abn") {
      const err = validateABNOptional(v);
      setStep1Errors((prev) => err ? { ...prev, abn: err } : (() => { const n = { ...prev }; delete n.abn; return n; })());
    }
  };
  const update2 = (k: string, v: string) => setStep2((p) => ({ ...p, [k]: v }));
  const update3 = (k: string, v: string) => {
    setStep3((p) => ({ ...p, [k]: v }));
    if (k === "email") {
      const err = validateEmail(v);
      setStep3Errors((prev) => err ? { ...prev, email: err } : (() => { const n = { ...prev }; delete n.email; return n; })());
    } else if (k === "phone") {
      const err = validatePhone(v);
      setStep3Errors((prev) => err ? { ...prev, phone: err } : (() => { const n = { ...prev }; delete n.phone; return n; })());
    }
  };
  const toggleAddOn = (id: string) =>
    setAddOns((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!step1.purpose) e.purpose = "Please select a purpose";
    if (!step1.businessName.trim()) e.businessName = "Business name is required";
    const abnErr = validateABNOptional(step1.abn);
    if (abnErr) e.abn = abnErr;
    if (!step1.industry) e.industry = "Please select your industry";
    if (!step1.yearsInBusiness) e.yearsInBusiness = "Please select years in business";
    setStep1Errors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!step3.name.trim()) e.name = "Name is required";
    const emailErr = validateEmail(step3.email);
    if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(step3.phone);
    if (phoneErr) e.phone = phoneErr;
    setStep3Errors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep3() || !selectedPlan) return;
    if (!agreed) { toast.error("Please agree to the Terms & Conditions"); return; }

    setIsSubmitting(true);
    const { addOnTotal, subtotal, gst, total, deposit } = calcPricing(selectedPlan, addOns, dynamicAddons);

    try {
      await submitCheckout({
        serviceKey: "business_plan",
        customer: { ...step3 },
        selections: { plan: selectedPlan.id, ...step1, ...step2, addOns },
        pricing: { planPrice: selectedPlan.price, addOnTotal, subtotal, gst, total, deposit },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  if (!initialPlan) {
    return <PricingLanding plans={dynamicPlans} onSelect={(plan) => { setInitialPlan(plan); setStep(1); }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckoutLoader visible={isSubmitting} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Business Plan</h1>
            <p className="text-sm text-muted-foreground">Complete your details below</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
            {step === 1 && (
              <Step1BusinessInfo
                plan={selectedPlan}
                data={step1}
                onChange={update1}
                errors={step1Errors}
                onNext={() => { if (validateStep1()) setStep(2); }}
              />
            )}
            {step === 2 && (
              <Step2Requirements
                plan={selectedPlan}
                data={step2}
                onChange={update2}
                addOns={addOns}
                onToggleAddOn={toggleAddOn}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                addonsSource={dynamicAddons}
              />
            )}
            {step === 3 && (
              <Step3ReviewPay
                plan={selectedPlan}
                addOns={addOns}
                step1Data={step1}
                step2Data={step2}
                contactData={step3}
                onChange={update3}
                errors={step3Errors}
                agreed={agreed}
                onAgree={setAgreed}
                isSubmitting={isSubmitting}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                addonsSource={dynamicAddons}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary plan={selectedPlan} addOns={addOns} addonsSource={dynamicAddons} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanCheckoutPage;
