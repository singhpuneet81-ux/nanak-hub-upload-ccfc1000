import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart2, FileText, Shield, Clock, CheckCircle,
  DollarSign, Building2, Calendar, TrendingUp, Users,
  Briefcase, Scale, ChevronRight, ChevronLeft, Lock,
  AlertCircle, Sparkles, User,
} from "lucide-react";
import { submitCheckout } from "@/utils/submitCheckout";
import { validateABN } from "@/utils/validation";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { TPBBadge } from "@/components/checkout/shared/TPBBadge";
import { useTieredPricing } from "@/hooks/useTieredPricing";


// ─── Plans ────────────────────────────────────────────────────────────────────
const STATIC_PLANS = [
  {
    id: "appraisal",
    name: "Appraisal Report",
    subtitle: "Estimate of business value for internal use and general purposes",
    price: 1399,
    delivery: "7-10 business days delivery",
    badge: null as string | null,
    icon: <FileText size={28} className="text-blue-500" />,
    iconBg: "bg-blue-50",
    features: [
      "Short-form Business Appraisal Report",
      "Estimate of business value",
      "Industry benchmarking analysis",
      "Pre-release discussion with experts",
      "Business & industry risk assessment",
    ],
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
    borderClass: "border-border",
    badgeBg: "",
  },
  {
    id: "standard",
    name: "Standard Business Valuation",
    subtitle: "Comprehensive report for sale, divorce, disputes, or court proceedings",
    price: 3159,
    delivery: "7-10 business days delivery",
    badge: "MOST POPULAR · COURT ACCEPTED" as string | null,
    icon: <BarChart2 size={28} className="text-orange-500" />,
    iconBg: "bg-orange-50",
    features: [
      "Detailed Business Valuation Report",
      "Comprehensive financial statement analysis",
      "Detailed industry & market analysis",
      "Pre-release discussion with experts",
      "Risk analysis & adjustment factors",
      "Court-acceptable documentation",
      "Multiple valuation methodologies",
    ],
    btnClass: "bg-[hsl(var(--cta))] hover:opacity-90 text-white",
    borderClass: "border-orange-400",
    badgeBg: "bg-orange-500",
  },
];

type ValuationPlan = typeof STATIC_PLANS[number];
const PLANS = STATIC_PLANS;

// Icon/style map for merging API data
const PLAN_STYLE_MAP: Record<string, Partial<ValuationPlan>> = {
  appraisal: {
    icon: <FileText size={28} className="text-blue-500" />,
    iconBg: "bg-blue-50",
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
    borderClass: "border-border",
    badgeBg: "",
  },
  standard: {
    icon: <BarChart2 size={28} className="text-orange-500" />,
    iconBg: "bg-orange-50",
    btnClass: "bg-[hsl(var(--cta))] hover:opacity-90 text-white",
    borderClass: "border-orange-400",
    badgeBg: "bg-orange-500",
  },
};

function buildValuationPlans(apiPlans: ReturnType<typeof useTieredPricing>["plans"]): ValuationPlan[] {
  return apiPlans.map((ap) => {
    const styles = PLAN_STYLE_MAP[ap.id] || {};
    const staticMatch = STATIC_PLANS.find((s) => s.id === ap.id);
    return {
      ...staticMatch!,
      ...styles,
      name: ap.label,
      subtitle: ap.subtitle,
      price: ap.price,
      delivery: ap.delivery,
      badge: ap.badge,
      features: ap.features,
      recommended: ap.recommended,
    };
  });
}

const PURPOSES = [
  { id: "selling", label: "Selling Business", sub: "Sale preparation", icon: <DollarSign size={18} className="text-orange-500" /> },
  { id: "divorce", label: "Divorce Settlement", sub: "Asset division", icon: <Scale size={18} className="text-orange-500" /> },
  { id: "partnership", label: "Partnership Dispute", sub: "Buy-sell agreement", icon: <FileText size={18} className="text-orange-500" /> },
  { id: "capital", label: "Raising Capital", sub: "Investor/lender", icon: <TrendingUp size={18} className="text-orange-500" /> },
  { id: "tax", label: "Tax Planning", sub: "CGT & succession", icon: <BarChart2 size={18} className="text-orange-500" /> },
  { id: "strategic", label: "Strategic Planning", sub: "Internal use", icon: <Briefcase size={18} className="text-orange-500" /> },
];

const INDUSTRIES = [
  "Retail & Consumer Goods", "Hospitality & Food Service", "Professional Services",
  "Construction & Trades", "Healthcare & Medical", "Technology & Software",
  "Manufacturing", "Transport & Logistics", "Agriculture & Primary Industry",
  "Financial Services", "Education & Training", "Real Estate & Property", "Other",
];

const YEARS_OPTIONS = [
  { value: "prelaunch", label: "Pre-launch / Start-up" },
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10plus", label: "10+ years" },
];

const REVENUE_OPTIONS = [
  { value: "under250k", label: "Under $250,000" },
  { value: "250k-500k", label: "$250,000 – $500,000" },
  { value: "500k-1m", label: "$500,000 – $1,000,000" },
  { value: "1m-2m", label: "$1,000,000 – $2,000,000" },
  { value: "2m-5m", label: "$2,000,000 – $5,000,000" },
  { value: "5mplus", label: "$5,000,000+" },
];

const RUSH_FEE = 800;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

// ─── Pricing Landing ──────────────────────────────────────────────────────────
const PricingLanding: React.FC<{ plans: ValuationPlan[]; onSelect: (plan: typeof PLANS[0]) => void }> = ({ plans, onSelect }) => (
  <div className="min-h-screen bg-[#f7f8fa]">
    <div className="max-w-4xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Transparent Fixed Pricing</h1>
        <p className="text-muted-foreground">Professional reports prepared by certified valuers with 15+ years experience</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border-2 ${plan.borderClass} shadow-sm overflow-hidden flex flex-col`}
          >
            {plan.badge && (
              <div className={`${plan.badgeBg} text-white text-xs font-bold tracking-widest text-center py-2 px-4`}>
                {plan.badge}
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                {plan.icon}
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{plan.name}</h2>
              <p className="text-sm text-blue-600 mb-4">{plan.subtitle}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-foreground">{fmt(plan.price)}</span>
                <span className="text-muted-foreground text-sm">+ GST</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">{plan.delivery}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                    <span className={i === 0 ? "font-semibold" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  const baseUrl = window.location.origin;
                  window.open(`${baseUrl}/business-valuation-checkout?plan=${plan.id}`, "_blank", "noopener,noreferrer");
                }}
                className={`w-full h-12 flex items-center justify-center rounded-2xl font-semibold text-sm transition-colors ${plan.btnClass}`}
              >
                Order {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom valuation note */}
      <div className="mt-8 bg-white border border-border rounded-xl p-5 flex items-start gap-3">
        <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Need a Custom Valuation?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            For complex businesses, listed companies, or specialised industries, we offer custom valuation services.{" "}
            <a href="/" className="text-orange-500 font-medium hover:underline">Contact us for a quote →</a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Stepper ──────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Business Info", "Documentation", "Review & Pay"];

const Stepper: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEP_LABELS.map((label, i) => {
      const idx = i + 1;
      const done = step > idx;
      const active = step === idx;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                ${done ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] text-white" : active ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] text-white" : "bg-card border-border text-muted-foreground"}`}
            >
              {done ? <CheckCircle size={18} /> : idx}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${active || done ? "text-[hsl(var(--cta))]" : "text-muted-foreground"} ${!active ? "hidden sm:block" : ""}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-5 ${step > idx ? "bg-[hsl(var(--cta))]" : "bg-border"}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
const OrderSummary: React.FC<{ plan: typeof PLANS[0]; rushDelivery: boolean }> = ({ plan, rushDelivery }) => {
  const subtotal = plan.price + (rushDelivery ? RUSH_FEE : 0);
  const gst = Math.round(subtotal * 0.1 * 10) / 10;
  const total = subtotal + gst;
  const deposit = Math.round(total / 2 * 100) / 100;
  const deliveryDays = rushDelivery ? "3-5" : "7-10";

  return (
    <div className="rounded-xl overflow-hidden border border-border sticky top-6">
      <div className="bg-primary text-primary-foreground px-5 py-4 rounded-t-xl">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>
      <div className="bg-card p-5 space-y-4">

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{plan.name}</span>
          <span className="font-medium">{fmt(plan.price)}</span>
        </div>
        {rushDelivery && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rush Delivery <span className="text-[hsl(var(--cta))] text-xs">(Add-on)</span></span>
            <span className="font-medium">{fmt(RUSH_FEE)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (10%)</span>
          <span className="font-medium">${gst.toFixed(1)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
          <span>Total</span>
          <span className="text-[hsl(var(--cta))]">${total.toFixed(1)}</span>
        </div>
      </div>

      {/* Deposit box */}
      <div className="bg-[hsl(var(--cta)/0.05)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-3 text-center">
        <p className="text-[10px] font-bold text-[hsl(var(--cta))] uppercase tracking-widest mb-1">Deposit Required to Start</p>
        <p className="text-2xl font-extrabold text-[hsl(var(--cta))]">{fmt(deposit)}</p>
        <p className="text-xs text-muted-foreground mt-1">Balance due upon report delivery</p>
      </div>

      {/* ABN-style trust badges */}
      <div className="space-y-2.5">
        <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
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

// ─── Soft Input / Select ──────────────────────────────────────────────────────
const SoftInput: React.FC<{
  label: string; required?: boolean; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
  icon?: React.ReactNode; type?: string;
}> = ({ label, required, placeholder, value, onChange, error, icon, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-11 ${icon ? "pl-9" : "pl-3"} pr-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors
          ${error ? "border-red-400" : "border-border"}`}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SoftSelect: React.FC<{
  label: string; required?: boolean; value: string;
  onChange: (v: string) => void; error?: string;
  options: { value: string; label: string }[];
  placeholder?: string; icon?: React.ReactNode;
}> = ({ label, required, value, onChange, error, options, placeholder, icon }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 ${icon ? "pl-9" : "pl-3"} pr-8 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors appearance-none
          ${error ? "border-red-400" : "border-border"} ${!value ? "text-muted-foreground" : "text-foreground"}`}
      >
        <option value="">{placeholder || "Select..."}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <ChevronRight size={16} className="rotate-90" />
      </span>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ─── Step 1: Business Info ────────────────────────────────────────────────────
const Step1: React.FC<{
  plan: typeof PLANS[0];
  form: any; setForm: (f: any) => void;
  errors: Record<string, string>; setErrors: (e: Record<string, string>) => void;
  onNext: () => void;
}> = ({ plan, form, setForm, errors, setErrors, onNext }) => {
  const update = (k: string, v: string) => {
    setForm({ ...form, [k]: v });
    if (k === "abn") {
      const err = validateABN(v);
      setErrors(err ? { ...errors, abn: err } : (() => { const n = { ...errors }; delete n.abn; return n; })());
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.purpose) e.purpose = "Please select a purpose";
    if (!form.businessName.trim()) e.businessName = "Business name is required";
    if (!form.abn.trim() || form.abn.replace(/\s/g, "").length !== 11) e.abn = "ABN must be 11 digits";
    if (!form.industry) e.industry = "Please select an industry";
    if (!form.yearsInBusiness) e.yearsInBusiness = "Please select years in business";
    if (!form.annualRevenue) e.annualRevenue = "Please select annual revenue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
          <BarChart2 size={28} className="text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Business Information</h2>
        <p className="text-sm text-orange-500 mt-1">
          {plan.name} – {fmt(plan.price)} + GST
        </p>
      </div>

      <div className="space-y-5">
        {/* Primary Purpose */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Primary Purpose of Valuation <span className="text-red-500">*</span>
          </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PURPOSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { update("purpose", p.id); setErrors({ ...errors, purpose: "" }); }}
                className={`flex items-center gap-3 p-3 border-2 rounded-xl text-left transition-all
                  ${form.purpose === p.id ? "border-orange-400 bg-orange-50" : "border-border bg-white hover:border-orange-200"}`}
              >
                {p.icon}
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.sub}</p>
                </div>
              </button>
            ))}
          </div>
          {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose}</p>}
        </div>

        <SoftInput
          label="Business Name" required
          placeholder="Enter your business name"
          value={form.businessName} onChange={(v) => update("businessName", v)}
          error={errors.businessName} icon={<Building2 size={16} />}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Australian Business Number (ABN) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">#</span>
            <input
              type="text"
              value={form.abn}
              onChange={(e) => update("abn", e.target.value)}
              placeholder="12 345 678 901"
              className={`w-full h-11 pl-7 pr-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors
                ${errors.abn ? "border-red-400" : "border-border"}`}
            />
          </div>
          <p className="text-xs text-orange-500 mt-1">Required for accurate business valuation</p>
          {errors.abn && <p className="text-xs text-red-500 mt-0.5">{errors.abn}</p>}
        </div>

        <SoftSelect
          label="Industry / Sector" required
          placeholder="Select your industry"
          value={form.industry} onChange={(v) => update("industry", v)}
          error={errors.industry}
          options={INDUSTRIES.map((i) => ({ value: i.toLowerCase().replace(/\s/g, "_"), label: i }))}
          icon={<Building2 size={16} />}
        />

        {/* Other Industry Field */}
        {form.industry === "other" && (
          <SoftInput
            label="Please specify your industry" required
            placeholder="e.g. Agriculture, Mining, etc."
            value={form.otherIndustry || ""} onChange={(v) => update("otherIndustry", v)}
            error={errors.otherIndustry}
            icon={<Briefcase size={16} />}
          />
        )}

        <SoftSelect
          label="Years in Business" required
          placeholder="Select years in operation"
          value={form.yearsInBusiness} onChange={(v) => update("yearsInBusiness", v)}
          error={errors.yearsInBusiness}
          options={YEARS_OPTIONS}
          icon={<Calendar size={16} />}
        />

        <SoftSelect
          label="Annual Revenue (Approximate)" required
          placeholder="Select annual revenue"
          value={form.annualRevenue} onChange={(v) => update("annualRevenue", v)}
          error={errors.annualRevenue}
          options={REVENUE_OPTIONS}
          icon={<DollarSign size={16} />}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={() => validate() && onNext()}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-semibold transition-colors"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 2: Financial Documentation ─────────────────────────────────────────
const Step2: React.FC<{
  plan: typeof PLANS[0];
  form: any; setForm: (f: any) => void;
  errors: Record<string, string>; setErrors: (e: Record<string, string>) => void;
  onNext: () => void; onBack: () => void;
}> = ({ form, setForm, errors, setErrors, onNext, onBack }) => {
  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.hasFinancials) e.hasFinancials = "Please select an option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
          <FileText size={28} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Financial Documentation</h2>
        <p className="text-sm text-muted-foreground mt-1">Help us prepare for an accurate valuation</p>
      </div>

      <div className="space-y-5">
        {/* Has Financials */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Do you have financial statements available? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "yes", label: "Yes, I Have Financials", sub: "Last 3 years available", icon: <CheckCircle size={18} className="text-green-500" /> },
              { id: "no", label: "Need Help with Financials", sub: "We'll guide you through it", icon: <Users size={18} className="text-blue-500" /> },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { update("hasFinancials", opt.id); setErrors({ ...errors, hasFinancials: "" }); }}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all
                  ${form.hasFinancials === opt.id ? "border-orange-400 bg-orange-50" : "border-border bg-white hover:border-orange-200"}`}
              >
                {opt.icon}
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
          {errors.hasFinancials && <p className="text-xs text-red-500 mt-1">{errors.hasFinancials}</p>}
        </div>

        {/* Documents we'll need */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-foreground">Documents We'll Need</p>
          </div>
          <ul className="space-y-1.5 text-xs text-blue-700">
            {[
              "Financial statements (P&L, Balance Sheet) for last 3 years",
              "Tax returns for last 3 years",
              "List of assets and liabilities",
              "Details of key revenue streams and contracts",
              "Employee information and operational details",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="shrink-0">✓</span> {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-blue-500 mt-2 italic">
            💡 Don't worry if you don't have everything – we'll collect these securely after your discovery call
          </p>
        </div>

        {/* Delivery Timeline */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Delivery Timeline</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "standard", label: "7-10 Business Days", sub: "Standard delivery", badge: "Included", icon: <Clock size={18} className="text-muted-foreground" /> },
              { id: "rush", label: "3-5 Business Days", sub: "Rush delivery", badge: `+${fmt(RUSH_FEE)}`, icon: <Sparkles size={18} className="text-orange-500" /> },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => update("delivery", opt.id)}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all relative
                  ${form.delivery === opt.id ? "border-orange-400 bg-orange-50" : "border-border bg-white hover:border-orange-200"}`}
              >
                {form.delivery === opt.id && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </span>
                )}
                {opt.icon}
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${opt.id === "standard" ? "text-green-600" : "text-orange-500"}`}>{opt.badge}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Additional Notes or Special Requirements (Optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any specific details we should know about your business or valuation requirements..."
            rows={4}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-colors resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={() => validate() && onNext()}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-semibold transition-colors"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 3: Review & Pay ─────────────────────────────────────────────────────
const Step3: React.FC<{
  plan: typeof PLANS[0];
  step1: any; step2: any;
  form: any; setForm: (f: any) => void;
  errors: Record<string, string>; setErrors: (e: Record<string, string>) => void;
  agreed: boolean; setAgreed: (v: boolean) => void;
  onBack: () => void; isSubmitting: boolean; onSubmit: () => void;
}> = ({ plan, step1, step2, form, setForm, errors, setErrors, agreed, setAgreed, onBack, isSubmitting, onSubmit }) => {
  const update = (k: string, v: string) => setForm({ ...form, [k]: v });
  const rushDelivery = step2.delivery === "rush";
  const subtotal = plan.price + (rushDelivery ? RUSH_FEE : 0);
  const gst = Math.round(subtotal * 0.1 * 10) / 10;
  const total = subtotal + gst;
  const deposit = Math.round(total / 2 * 100) / 100;
  const deliveryLabel = rushDelivery ? "Rush delivery: 3-5 business days" : "Standard delivery: 7-10 business days";
  const purposeLabel = PURPOSES.find(p => p.id === step1.purpose)?.label || step1.purpose;
  const industryRaw = step1.industry;
  const industryLabel = industryRaw === "other" ? (step1.otherIndustry || "Other") : (INDUSTRIES.find(i => i.toLowerCase().replace(/\s/g, "_") === industryRaw) || industryRaw);
  const yearsLabel = YEARS_OPTIONS.find(o => o.value === step1.yearsInBusiness)?.label || step1.yearsInBusiness;
  const revenueLabel = REVENUE_OPTIONS.find(o => o.value === step1.annualRevenue)?.label || step1.annualRevenue;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim() || form.phone.replace(/[\s\-+]/g, "").length < 8) e.phone = "Valid phone number is required";
    if (!agreed) e.agreed = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Review & Pay</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirm your details before proceeding to payment</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Contact Details */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Contact Details</h3>
          </div>
          <div className="space-y-4 ml-11">
            <SoftInput label="Contact Person Name" required placeholder="John Smith" value={form.name} onChange={(v) => update("name", v)} error={errors.name} icon={<Users size={16} />} />
            <SoftInput label="Email Address" required type="email" placeholder="john@example.com" value={form.email} onChange={(v) => update("email", v)} error={errors.email} icon={<FileText size={16} />} />
            <SoftInput label="Phone Number" required placeholder="04XX XXX XXX" value={form.phone} onChange={(v) => update("phone", v)} error={errors.phone} icon={<Building2 size={16} />} />
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
            <div className="flex justify-between"><span className="text-muted-foreground">Purpose</span><span className="font-medium text-foreground">{purposeLabel || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Business Name</span><span className="font-medium text-foreground">{step1.businessName || "—"}</span></div>
            {step1.abn && <div className="flex justify-between"><span className="text-muted-foreground">ABN</span><span className="font-medium text-foreground">{step1.abn}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span className="font-medium text-foreground">{industryLabel || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Years in Business</span><span className="font-medium text-foreground">{yearsLabel || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Annual Revenue</span><span className="font-medium text-foreground">{revenueLabel || "—"}</span></div>
          </div>
        </div>

        {/* Documentation Preview */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Documentation</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Financials Available</span><span className="font-medium text-foreground">{step2.hasFinancials === "yes" ? "Yes" : "Need Help"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-medium text-foreground">{deliveryLabel}</span></div>
            {step2.notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="font-medium text-foreground text-right max-w-[200px] truncate">{step2.notes}</span></div>}
          </div>
        </div>

        {/* Order Total */}
        <div className="border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Order Total</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{plan.name}</span><span className="text-foreground">{fmt(plan.price)}</span></div>
            {rushDelivery && <div className="flex justify-between"><span className="text-muted-foreground">Rush Delivery</span><span className="text-foreground">{fmt(RUSH_FEE)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GST (10%)</span><span className="text-foreground">${gst.toFixed(1)}</span></div>
            <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-[hsl(var(--cta))]">${total.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit (50%)</span>
              <span className="font-bold text-[hsl(var(--cta))]">{fmt(deposit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={18} className="text-green-500" />
          <p className="text-sm font-semibold text-foreground">What Happens After Payment</p>
        </div>
        <div className="space-y-3">
          {[
            { n: 1, title: "Discovery Call (24 hours)", desc: "We'll contact you to discuss your business and valuation requirements" },
            { n: 2, title: "Secure Document Collection (2-3 days)", desc: "Our team guides you through providing financial statements" },
            { n: 3, title: "Comprehensive Analysis (3-5 days)", desc: "Certified valuers perform detailed financial and industry analysis" },
            { n: 4, title: "Report Delivery & Discussion", desc: "Receive your valuation report with expert walkthrough" },
          ].map((s) => (
            <div key={s.n} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{s.n}</div>
              <div><p className="text-sm font-semibold text-foreground">{s.title}</p><p className="text-xs text-green-700">{s.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Agreement */}
      <div className="mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors({ ...errors, agreed: "" }); }} className="mt-1 w-4 h-4 rounded border-border accent-primary cursor-pointer" />
          <span className="text-sm text-foreground">
            I agree to the <span className="text-[hsl(var(--cta))] font-medium">Terms & Conditions</span> and authorize a 50% deposit payment of <span className="font-semibold">{fmt(deposit)}</span> to commence the business valuation
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-destructive mt-1">{errors.agreed}</p>}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={() => validate() && onSubmit()} disabled={isSubmitting} className="btn-cta">
          <Lock size={15} />
          {isSubmitting ? "Processing…" : `Pay ${fmt(deposit)} (50% Deposit)`}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BusinessValuationCheckoutPage: React.FC = () => {
  const { plans: apiPlans } = useTieredPricing("business_valuation");
  const dynamicPlans = useMemo(() => buildValuationPlans(apiPlans), [apiPlans]);

  const searchParams = new URLSearchParams(window.location.search);
  const planParam = searchParams.get("plan");
  const planFromUrl = planParam ? dynamicPlans.find((p) => p.id === planParam) ?? null : null;

  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(planFromUrl);
  const [step, setStep] = useState(1);

  // Update selectedPlan when API data loads — always sync with latest dynamic prices
  useEffect(() => {
    if (selectedPlan) {
      const updated = dynamicPlans.find((p) => p.id === selectedPlan.id);
      if (updated && updated.price !== selectedPlan.price) setSelectedPlan(updated);
    } else if (planParam) {
      const match = dynamicPlans.find((p) => p.id === planParam);
      if (match) setSelectedPlan(match);
    }
  }, [dynamicPlans, planParam, selectedPlan]);

  const [step1, setStep1] = useState({ purpose: "", businessName: "", abn: "", industry: "", yearsInBusiness: "", annualRevenue: "" });
  const [step2, setStep2] = useState({ hasFinancials: "", delivery: "standard", notes: "" });
  const [step3, setStep3] = useState({ name: "", email: "", phone: "" });

  const [errors1, setErrors1] = useState<Record<string, string>>({});
  const [errors2, setErrors2] = useState<Record<string, string>>({});
  const [errors3, setErrors3] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save state to sessionStorage for Try Again
  useEffect(() => {
    const key = `checkout_state_${window.location.pathname}`;
    try {
      sessionStorage.setItem(key, JSON.stringify({ step1, step2, step3, step, agreed }));
      sessionStorage.setItem("checkout_return_url", window.location.href);
    } catch { /* quota exceeded */ }
  }, [step1, step2, step3, step, agreed]);

  const rushDelivery = step2.delivery === "rush";

  const subtotal = useMemo(() => (selectedPlan?.price ?? 0) + (rushDelivery ? RUSH_FEE : 0), [selectedPlan, rushDelivery]);
  const gst = useMemo(() => Math.round(subtotal * 0.1 * 10) / 10, [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);
  const deposit = useMemo(() => Math.round(total / 2 * 100) / 100, [total]);

  const handleSubmit = async () => {
    if (isSubmitting || !selectedPlan) return;
    setIsSubmitting(true);
    try {
      await submitCheckout({
        serviceKey: "business_valuation",
        customer: { ...step3 },
        selections: { ...step1, ...step2, planId: selectedPlan.id, planName: selectedPlan.name },
        pricing: {
          planPrice: selectedPlan.price,
          rushFee: rushDelivery ? RUSH_FEE : 0,
          subtotal,
          gst,
          total,
          deposit,
        },
        meta: { rushDelivery },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  if (!selectedPlan) {
    return <PricingLanding plans={dynamicPlans} onSelect={(plan) => { setSelectedPlan(plan); setStep(1); }} />;
  }

  return (
  <div className="min-h-screen bg-background">
      <CheckoutLoader visible={isSubmitting} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Business Valuation</h1>
            <p className="text-sm text-muted-foreground">Complete your details below</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Step Content */}
          {step === 1 && (
            <Step1
              plan={selectedPlan}
              form={step1} setForm={setStep1}
              errors={errors1} setErrors={setErrors1}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              plan={selectedPlan}
              form={step2} setForm={setStep2}
              errors={errors2} setErrors={setErrors2}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3
              plan={selectedPlan}
              step1={step1} step2={step2}
              form={step3} setForm={setStep3}
              errors={errors3} setErrors={setErrors3}
              agreed={agreed} setAgreed={setAgreed}
              onBack={() => setStep(2)}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}

          {/* Order Summary */}
          <OrderSummary plan={selectedPlan} rushDelivery={rushDelivery} />
        </div>
      </div>
    </div>
  );
};

export default BusinessValuationCheckoutPage;
