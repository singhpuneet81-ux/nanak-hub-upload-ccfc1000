import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Shield,
  Users,
  Lock,
  Info,
  Zap,
  BarChart2,
  FileText,
  Building2,
  User,
} from "lucide-react";
import { submitCheckout } from "@/utils/submitCheckout";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { TPBBadge } from "@/components/checkout/shared/TPBBadge";
import { useTieredPricing } from "@/hooks/useTieredPricing";

// ─── Plans (static fallback) ─────────────────────────────────────────────────
const STATIC_PLANS = [
  {
    id: "snapshot",
    name: "Financial Snapshot Review",
    subtitle: "Essential Review",
    price: 500,
    delivery: "3-5 business days",
    badge: null as string | null,
    recommended: false,
    bestFor: "Small acquisitions, early-stage evaluation\nIdeal when you want a second opinion before making an offer",
    includes: [
      "2 year financial statement analysis",
      "Revenue & profit trend review",
      "Expense and margin analysis",
      "Basic cash flow review",
      "Working capital health check",
      "Industry ratio comparison",
      "Risk flag summary report",
      "30 min strategy call",
    ],
    notIncluded: ["No legal contract review", "No tax structuring advice", "No negotiation modelling"],
    btnClass: "border-2 border-primary text-primary hover:bg-primary/5",
    btnLabel: "Get Financial Review →",
  },
  {
    id: "comprehensive",
    name: "Comprehensive Financial DD",
    subtitle: "Full Analysis & Valuation",
    price: 1500,
    delivery: "5-7 business days",
    badge: "RECOMMENDED" as string | null,
    recommended: true,
    bestFor: "Serious buyers ready to negotiate",
    includes: [
      "3-5 year deep financial analysis",
      "Normalised earnings adjustment (EBITDA correction)",
      "Valuation using EBITDA multiple, revenue multiple, DCF",
      "Tax risk exposure analysis",
      "Owner add-backs review",
      "Cash flow sustainability modelling",
      "Break-even sensitivity modelling",
      "Financial risk heat map",
      "Negotiation support insights",
      "Written valuation opinion report",
      "60-min strategic advisory call",
    ],
    notIncluded: ["No legal contract drafting", "No legal review of sale agreement", "No compliance certification"],
    btnClass: "bg-[hsl(var(--cta))] hover:opacity-90 text-white",
    btnLabel: "Get Comprehensive Review →",
  },
];

type DDPlan = typeof STATIC_PLANS[number];
const PLANS = STATIC_PLANS;

const DD_STYLE_MAP: Record<string, Partial<DDPlan>> = {
  snapshot: {
    bestFor: "Small acquisitions, early-stage evaluation\nIdeal when you want a second opinion before making an offer",
    notIncluded: ["No legal contract review", "No tax structuring advice", "No negotiation modelling"],
    btnClass: "border-2 border-primary text-primary hover:bg-primary/5",
    btnLabel: "Get Financial Review →",
  },
  comprehensive: {
    bestFor: "Serious buyers ready to negotiate",
    notIncluded: ["No legal contract drafting", "No legal review of sale agreement", "No compliance certification"],
    btnClass: "bg-[hsl(var(--cta))] hover:opacity-90 text-white",
    btnLabel: "Get Comprehensive Review →",
  },
};

function buildDDPlans(apiPlans: ReturnType<typeof useTieredPricing>["plans"]): DDPlan[] {
  return apiPlans.map((ap) => {
    const styles = DD_STYLE_MAP[ap.id] || {};
    const staticMatch = STATIC_PLANS.find((s) => s.id === ap.id);
    return {
      ...staticMatch!,
      ...styles,
      name: ap.label,
      subtitle: ap.subtitle,
      price: ap.price,
      delivery: ap.delivery,
      badge: ap.badge,
      recommended: ap.recommended,
      includes: ap.features,
    };
  });
}

const INDUSTRIES = [
  { value: "cafe_restaurant", label: "Cafe / Restaurant" },
  { value: "retail", label: "Retail" },
  { value: "trades_construction", label: "Trades & Construction" },
  { value: "professional_services", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "technology_it", label: "Technology / IT" },
  { value: "beauty_salon", label: "Beauty / Salon" },
  { value: "automotive", label: "Automotive" },
  { value: "education_training", label: "Education / Training" },
  { value: "real_estate", label: "Real Estate" },
  { value: "transport_logistics", label: "Transport / Logistics" },
  { value: "other", label: "Other (please specify)" },
];

const STATES = [
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
];

const REVENUE_CONSISTENCY = [
  { value: "stable", label: "Yes, revenue is stable" },
  { value: "growing", label: "Growing year over year" },
  { value: "declining", label: "Declining year over year" },
  { value: "volatile", label: "Volatile/unpredictable" },
];

const DOCUMENTS = [
  { id: "financial_statements", label: "2-3 years financial statements" },
  { id: "bas_lodgements", label: "BAS lodgements" },
  { id: "bank_statements", label: "Bank statements" },
  { id: "lease_agreement", label: "Lease agreement" },
  { id: "employee_payroll", label: "Employee payroll summary" },
  { id: "asset_list", label: "Asset list" },
  { id: "stock_valuation", label: "Stock valuation" },
  { id: "none_yet", label: "None yet" },
];

const STEP_LABELS = [
  { key: "Business", label: "Business" },
  { key: "Financials", label: "Financials" },
  { key: "Documents", label: "Documents" },
  { key: "Package", label: "Package" },
  { key: "Contact", label: "Contact" },
  { key: "Payment", label: "Payment" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

// ─── Stepper ──────────────────────────────────────────────────────────────────
const Stepper: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-start justify-center gap-0 mb-8">
    {STEP_LABELS.map((s, i) => {
      const idx = i + 1;
      const done = step > idx;
      const active = step === idx;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                ${
                  done
                    ? "bg-blue-600 border-blue-600 text-white"
                    : active
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                }`}
            >
              {done ? <CheckCircle size={18} /> : idx}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium text-center ${active ? "text-blue-600" : done ? "text-blue-600" : "text-gray-400"}`}
            >
              {s.label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 mt-5 ${done ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
const OrderSummary: React.FC<{ plan: (typeof PLANS)[0] }> = ({ plan }) => {
  const total = plan.price;

  return (
    <div className="rounded-xl overflow-hidden border border-border sticky top-6">
      <div className="bg-primary text-primary-foreground px-5 py-4 rounded-t-xl">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="bg-card p-5 space-y-4">
        <div className="flex justify-between items-start text-sm">
          <div>
            <p className="font-semibold text-foreground">{plan.name}</p>
            <p className="text-muted-foreground text-xs">{plan.delivery}</p>
          </div>
          <span className="font-bold text-foreground">{fmt(plan.price)}</span>
        </div>

        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-[hsl(var(--cta))]">{fmt(total)}</span>
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
              <p className="text-xs text-[hsl(142_71%_45%)]">{plan.delivery}</p>
            </div>
          </div>
        </div>

        <TPBBadge />
      </div>
    </div>
  );
};

// ─── Shared Input / Select components ────────────────────────────────────────
const SoftInput: React.FC<{
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
}> = ({ label, required, placeholder, value, onChange, error, prefix }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-muted-foreground text-sm font-medium">{prefix}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-11 ${prefix ? "pl-7" : "pl-3"} pr-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-colors
          ${error ? "border-red-400" : "border-border"} text-foreground placeholder:text-muted-foreground`}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SoftSelect: React.FC<{
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}> = ({ label, required, value, onChange, error, options, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 pl-3 pr-8 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-colors appearance-none
          ${error ? "border-red-400" : "border-border"} ${!value ? "text-muted-foreground" : "text-foreground"}`}
      >
        <option value="">{placeholder || "Select..."}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronRight
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none"
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Toggle pill: Yes / No / Not Sure
const TriToggle: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  tooltip?: string;
}> = ({ label, value, onChange, options = ["Yes", "No", "Not Sure"], tooltip }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {tooltip && (
        <div className="relative group">
          <Info size={14} className="text-muted-foreground cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-64 bg-gray-800 text-white text-xs rounded-lg p-2.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`h-10 rounded-lg text-sm font-medium border transition-all
            ${
              value === opt
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-foreground border-border hover:border-blue-300"
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

// ─── Step 1: Business ─────────────────────────────────────────────────────────
const Step1Business: React.FC<{
  form: any;
  setForm: (f: any) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ form, setForm, errors, setErrors, onNext, onBack }) => {
  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.businessName.trim()) e.businessName = "Business name is required";
    if (!form.industry) e.industry = "Please select an industry";
    if (!form.state) e.state = "Please select a state";
    if (!form.askingPrice.trim()) e.askingPrice = "Asking price is required";
    if (!form.broker) e.broker = "Please select an option";
    if (!form.saleType) e.saleType = "Please select a sale type";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 md:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Business Overview</h2>

      <div className="space-y-5">
        <SoftInput
          label="Business Name"
          required
          placeholder="Enter the name of the business you intend to purchase"
          value={form.businessName}
          onChange={(v) => update("businessName", v)}
          error={errors.businessName}
        />

        <SoftSelect
          label="Industry"
          required
          placeholder="Select industry"
          value={form.industry}
          onChange={(v) => update("industry", v)}
          options={INDUSTRIES}
          error={errors.industry}
        />

        {/* Other Industry Field */}
        {form.industry === "other" && (
          <SoftInput
            label="Please specify your industry"
            required
            placeholder="e.g. Agriculture, Mining, etc."
            value={form.otherIndustry || ""}
            onChange={(v) => update("otherIndustry", v)}
            error={errors.otherIndustry}
          />
        )}

        <SoftSelect
          label="Location (State)"
          required
          placeholder="Select state"
          value={form.state}
          onChange={(v) => update("state", v)}
          options={STATES}
          error={errors.state}
        />

        <SoftInput
          label="Asking Price"
          required
          placeholder="0"
          value={form.askingPrice}
          onChange={(v) => update("askingPrice", v.replace(/[^0-9]/g, ""))}
          error={errors.askingPrice}
          prefix="$"
        />

        <TriToggle
          label="Is there a broker involved?"
          value={form.broker}
          onChange={(v) => {
            update("broker", v);
            setErrors({ ...errors, broker: "" });
          }}
          options={["Yes", "No", "Not Sure"]}
        />
        {errors.broker && <p className="text-xs text-red-500 -mt-3">{errors.broker}</p>}

        <TriToggle
          label="Sale Type"
          value={form.saleType}
          onChange={(v) => {
            update("saleType", v);
            setErrors({ ...errors, saleType: "" });
          }}
          options={["Asset sale", "Share sale", "Not sure"]}
          tooltip="Asset sale: buying the business assets only. Share sale: buying shares in the company itself."
        />
        {errors.saleType && <p className="text-xs text-red-500 -mt-3">{errors.saleType}</p>}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={() => {
            if (validate()) onNext();
          }}
          className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 2: Financials ───────────────────────────────────────────────────────
const Step2Financials: React.FC<{
  form: any;
  setForm: (f: any) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ form, setForm, errors, setErrors, onNext, onBack }) => {
  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.revenue.trim()) e.revenue = "Revenue is required";
    if (!form.netProfit.trim()) e.netProfit = "Net profit is required";
    if (!form.revenueConsistency) e.revenueConsistency = "Please select an option";
    if (!form.customerConcentration) e.customerConcentration = "Please select an option";
    if (!form.businessLoans) e.businessLoans = "Please select an option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canContinue =
    form.revenue.trim() &&
    form.netProfit.trim() &&
    form.revenueConsistency &&
    form.customerConcentration &&
    form.businessLoans;

  return (
    <div className="bg-white rounded-xl border border-border p-6 md:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Financial Details</h2>

      <div className="space-y-5">
        <SoftInput
          label="Last 2-3 Years Revenue (Average)"
          required
          placeholder="0"
          value={form.revenue}
          onChange={(v) => update("revenue", v.replace(/[^0-9]/g, ""))}
          error={errors.revenue}
          prefix="$"
        />

        <SoftInput
          label="Last 2-3 Years Net Profit (Average)"
          required
          placeholder="0"
          value={form.netProfit}
          onChange={(v) => update("netProfit", v.replace(/[^0-9]/g, ""))}
          error={errors.netProfit}
          prefix="$"
        />

        <SoftSelect
          label="Is revenue consistent year to year?"
          required
          placeholder="Select option"
          value={form.revenueConsistency}
          onChange={(v) => update("revenueConsistency", v)}
          options={REVENUE_CONSISTENCY}
          error={errors.revenueConsistency}
        />

        <TriToggle
          label="Any major customer concentration?"
          value={form.customerConcentration}
          onChange={(v) => {
            update("customerConcentration", v);
            setErrors({ ...errors, customerConcentration: "" });
          }}
          options={["Yes", "No", "Not Sure"]}
          tooltip="This means: is more than 30-50% of revenue from just one or two customers? High concentration = high risk if they leave."
        />
        {errors.customerConcentration && <p className="text-xs text-red-500 -mt-3">{errors.customerConcentration}</p>}

        <TriToggle
          label="Any existing business loans?"
          value={form.businessLoans}
          onChange={(v) => {
            update("businessLoans", v);
            setErrors({ ...errors, businessLoans: "" });
          }}
          options={["Yes", "No", "Not Sure"]}
        />
        {errors.businessLoans && <p className="text-xs text-red-500 -mt-3">{errors.businessLoans}</p>}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={() => {
            if (validate()) onNext();
          }}
          disabled={!canContinue}
          className={`flex items-center gap-1 px-6 py-2 rounded-2xl text-sm font-semibold transition-colors
            ${
              canContinue ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 3: Documents ────────────────────────────────────────────────────────
const Step3Documents: React.FC<{
  form: any;
  setForm: (f: any) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ form, setForm, onNext, onBack }) => {
  const toggleDoc = (id: string) => {
    const current: string[] = form.documents || [];
    const updated = current.includes(id)
      ? current.filter((d) => d !== id)
      : id === "none_yet"
        ? ["none_yet"]
        : [...current.filter((d) => d !== "none_yet"), id];
    setForm({ ...form, documents: updated });
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 md:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">What Documents Do You Have?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Select all documents you can provide (don't worry if you don't have everything)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {DOCUMENTS.map((doc) => {
          const selected = (form.documents || []).includes(doc.id);
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => toggleDoc(doc.id)}
              className={`flex items-center gap-3 px-4 py-3 border rounded-lg text-left transition-all
                ${
                  selected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-border bg-white text-foreground hover:border-blue-200"
                }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0
                ${selected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
              >
                {selected && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className="text-sm font-medium">{doc.label}</span>
            </button>
          );
        })}
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Note:</span> We'll request these documents after payment. Don't worry if you
          don't have everything - we'll work with what's available.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 4: Package ──────────────────────────────────────────────────────────

const Step4Package: React.FC<{
  selectedPlan: (typeof PLANS)[0];
  allPlans: DDPlan[];
  onPlanChange: (plan: (typeof PLANS)[0]) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selectedPlan, allPlans, onPlanChange, onNext, onBack }) => {
  // Build step4 packages from dynamic plans
  const step4Packages = allPlans.map((p) => ({
    id: p.id,
    name: p.subtitle || p.name,
    price: p.price,
    delivery: p.delivery,
    recommended: p.recommended,
    features: p.includes.slice(0, p.recommended ? 4 : 3),
  }));

  return (
    <div className="bg-white rounded-xl border border-border p-6 md:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Select Your Package</h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {step4Packages.map((pkg) => {
          const isSelected = selectedPlan.id === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => {
                const fullPlan = allPlans.find((p) => p.id === pkg.id)!;
                onPlanChange(fullPlan);
              }}
              className={`relative text-left rounded-xl border-2 p-5 transition-all
                ${
                  isSelected
                    ? pkg.recommended
                      ? "border-orange-400 bg-orange-50"
                      : "border-blue-500 bg-blue-50"
                    : "border-border bg-white hover:border-gray-300"
                }`}
            >
              {pkg.recommended && (
                <span className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                  RECOMMENDED
                </span>
              )}
              {/* Radio indicator */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-base font-bold text-foreground">{pkg.name}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${isSelected ? (pkg.recommended ? "border-orange-500" : "border-blue-600") : "border-gray-300"}`}
                >
                  {isSelected && (
                    <div className={`w-2.5 h-2.5 rounded-full ${pkg.recommended ? "bg-orange-500" : "bg-blue-600"}`} />
                  )}
                </div>
              </div>

              <p
                className={`text-3xl font-extrabold mb-3 ${isSelected && pkg.recommended ? "text-foreground" : "text-foreground"}`}
              >
                {fmt(pkg.price)}
              </p>

              <ul className="space-y-1.5 mb-4">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle size={14} className="text-[hsl(var(--success))] shrink-0" />
                    <span className={i === 0 ? "font-medium" : ""}>{f}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted-foreground">{pkg.delivery}</p>
            </button>
          );
        })}
      </div>

      {/* Important Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-2">
        <Lock size={14} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-700">
          <span className="font-semibold">Important:</span> This service provides financial analysis and valuation
          guidance only. We do not provide legal advice or contract review. Seek independent legal advice before
          purchase.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 5: Contact ─────────────────────────────────────────────────────────
const Step5Contact: React.FC<{
  form: any;
  setForm: (f: any) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ form, setForm, errors, setErrors, onNext, onBack }) => {
  const update = (k: string, v: string) => {
    setForm({ ...form, [k]: v });
    // Real-time validation
    let error: string | null = null;
    if (k === "email") {
      if (!v.trim()) error = "Email address is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) error = "Please enter a valid email address";
    } else if (k === "phone") {
      if (!v.trim()) error = "Phone number is required";
      else if (!/^\+?\d[\d\s\-]{6,14}$/.test(v.trim())) error = "Please enter a valid phone number";
    } else if (k === "fullName") {
      if (!v.trim()) error = "Full name is required";
    }
    setErrors({ ...errors, [k]: error || "" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName?.trim()) e.fullName = "Full name is required";
    if (!form.email?.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address";
    if (!form.phone?.trim()) e.phone = "Phone number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 md:p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Users size={24} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Your Contact Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We'll use these details to send your <span className="text-blue-600">financial review</span>
        </p>
      </div>

      <div className="space-y-5">
        <SoftInput
          label="Full Name"
          required
          placeholder="John Smith"
          value={form.fullName || ""}
          onChange={(v) => update("fullName", v)}
          error={errors.fullName}
        />
        <SoftInput
          label="Email Address"
          required
          placeholder="john@example.com"
          value={form.email || ""}
          onChange={(v) => update("email", v)}
          error={errors.email}
        />
        <SoftInput
          label="Phone Number"
          required
          placeholder="04XX XXX XXX"
          value={form.phone || ""}
          onChange={(v) => update("phone", v)}
          error={errors.phone}
        />
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Shield size={15} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Privacy Guarantee:</span> Your information is confidential and will only be
            used to deliver your financial review and contact you about this service.
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={() => {
            if (validate()) onNext();
          }}
          className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Step 6: Payment ──────────────────────────────────────────────────────────
const Step6Payment: React.FC<{
  plan: (typeof PLANS)[0];
  businessForm: any;
  financialsForm: any;
  documentsForm: any;
  contactForm: any;
  onBack: () => void;
}> = ({ plan, businessForm, financialsForm, documentsForm, contactForm, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save state for Try Again
  useEffect(() => {
    const key = `checkout_state_${window.location.pathname}`;
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({ businessForm, financialsForm, documentsForm, contactForm, step: 6 }),
      );
      sessionStorage.setItem("checkout_return_url", window.location.href);
    } catch {
      /* quota exceeded */
    }
  }, [businessForm, financialsForm, documentsForm, contactForm]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitCheckout({
        serviceKey: "business_due_diligence",
        customer: {
          email: contactForm.email || null,
          fullName: contactForm.fullName,
          phone: contactForm.phone,
          businessName: businessForm.businessName,
          industry: industryLabel,
          state: businessForm.state,
          askingPrice: businessForm.askingPrice,
          broker: businessForm.broker,
          saleType: businessForm.saleType,
        },
        selections: {
          package: plan.name,
          revenue: financialsForm.revenue,
          netProfit: financialsForm.netProfit,
          revenueConsistency: financialsForm.revenueConsistency,
          customerConcentration: financialsForm.customerConcentration,
          businessLoans: financialsForm.businessLoans,
          documents: documentsForm.documents,
        },
        pricing: {
          packagePrice: plan.price,
          total: plan.price,
          delivery: plan.delivery,
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  const industryLabel =
    INDUSTRIES.find((i) => i.value === businessForm.industry)?.label ||
    (businessForm.industry === "other" ? businessForm.otherIndustry || "Other" : businessForm.industry);

  return (
    <div className="bg-card rounded-xl border border-border p-6 md:p-8">
      <CheckoutLoader visible={isSubmitting} />

      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle size={30} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Review Your Order</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirm details before proceeding to payment</p>
      </div>

      {/* Selected Package */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Selected Package</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-base font-bold text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{plan.delivery}</p>
          </div>
          <span className="text-xl font-extrabold text-[hsl(var(--cta))]">{fmt(plan.price)}</span>
        </div>
      </div>

      {/* Business Details */}
      <div className="border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Business Details</h3>
        </div>
        <div className="ml-11 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Business Name</span>
            <span className="font-medium text-foreground">{businessForm.businessName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Industry</span>
            <span className="font-medium text-foreground">{industryLabel || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">State</span>
            <span className="font-medium text-foreground">{businessForm.state || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Asking Price</span>
            <span className="font-medium text-foreground">${businessForm.askingPrice || "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Broker Involved</span>
            <span className="font-medium text-foreground">{businessForm.broker || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sale Type</span>
            <span className="font-medium text-foreground">{businessForm.saleType || "—"}</span>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div className="border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Financial Details</h3>
        </div>
        <div className="ml-11 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue</span>
            <span className="font-medium text-foreground">${financialsForm.revenue || "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Net Profit</span>
            <span className="font-medium text-foreground">${financialsForm.netProfit || "0"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue Consistency</span>
            <span className="font-medium text-foreground">{financialsForm.revenueConsistency || "—"}</span>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Contact Person</h3>
        </div>
        <div className="ml-11 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{contactForm.fullName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{contactForm.email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium text-foreground">{contactForm.phone || "—"}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-green-500" /> Secure Payment
        </span>
        <span className="flex items-center gap-1.5">
          <Lock size={13} className="text-green-500" /> Confidential
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-green-500" /> Accountant-Led
        </span>
      </div>

      <p className="text-center text-xs text-muted-foreground mb-4">
        By proceeding, you agree to our terms and privacy policy
      </p>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-full font-semibold text-base transition-colors"
      >
        <Lock size={16} />
        {isSubmitting ? "Processing…" : "Proceed to Secure Payment →"}
      </button>

      {/* Back */}
      <div className="flex justify-start mt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
      </div>
    </div>
  );
};

// ─── Pricing Landing ──────────────────────────────────────────────────────────
const PricingLanding: React.FC<{ plans: DDPlan[]; onSelect: (plan: (typeof PLANS)[0]) => void }> = ({ plans, onSelect }) => {
  const handleSelect = (plan: (typeof PLANS)[0]) => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/business-due-diligence?plan=${plan.id}`, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-4xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold mb-4">
            <Shield size={13} /> Clear, Fixed Pricing
          </span>
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Review Packages</h1>
          <p className="text-muted-foreground">
            Professional <span className="text-orange-500 font-medium">financial analysis</span> and{" "}
            <span className="text-blue-600 font-medium">valuation</span> before you buy
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 ${plan.recommended ? "border-orange-400" : "border-border"} shadow-sm overflow-hidden flex flex-col relative`}
            >
              {plan.recommended && (
                <div className="bg-orange-500 text-white text-xs font-bold tracking-widest text-center py-2 px-4">
                  ✦ RECOMMENDED
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                {/* Icon + title */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.recommended ? "bg-orange-50" : "bg-blue-50"}`}
                >
                  {plan.recommended ? (
                    <BarChart2 size={26} className="text-orange-500" />
                  ) : (
                    <FileText size={26} className="text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-1">{plan.subtitle}</p>
                <h2 className="text-xl font-bold text-foreground mb-3">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground">{fmt(plan.price)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{plan.delivery}</p>

                {/* Best For */}
                <div
                  className={`rounded-lg p-3 mb-4 text-xs ${plan.recommended ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}
                >
                  <p className="font-semibold mb-0.5">Best For:</p>
                  <p>{plan.bestFor}</p>
                </div>

                {plan.recommended && (
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Everything in Essential, plus:</p>
                )}

                {/* Includes */}
                <ul className="space-y-2 mb-4 flex-1">
                  {plan.includes.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={14} className="text-[hsl(var(--success))] shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Not included */}
                <ul className="space-y-1.5 mb-5">
                  {plan.notIncluded.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0 mt-0.5 text-gray-400">✗</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Delivery badge */}
                <div className="border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 bg-green-50">
                  <Clock size={13} className="text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Delivered in {plan.delivery}</span>
                </div>

                <button
                  onClick={() => handleSelect(plan)}
                  className={`w-full h-12 flex items-center justify-center rounded-2xl font-semibold text-sm transition-colors ${plan.btnClass}`}
                >
                  {plan.btnLabel}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-white border border-border rounded-xl p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Lock size={14} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-1">Important Notice</p>
            <p className="text-sm font-semibold text-muted-foreground">
              This service provides financial analysis and valuation guidance only.
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              We do not provide legal advice, contract review, or legal due diligence. Clients are advised to seek
              independent legal review before purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const defaultBusiness = {
  businessName: "",
  industry: "",
  state: "",
  askingPrice: "",
  broker: "",
  saleType: "",
};
const defaultFinancials = {
  revenue: "",
  netProfit: "",
  revenueConsistency: "",
  customerConcentration: "",
  businessLoans: "",
};
const defaultDocuments = { documents: [] as string[] };
const defaultContact = { fullName: "", email: "", phone: "" };

export default function BusinessDueDiligencePage() {
  const { plans: apiPlans } = useTieredPricing("business_due_diligence");
  const dynamicPlans = useMemo(() => buildDDPlans(apiPlans), [apiPlans]);

  const searchParams = new URLSearchParams(window.location.search);
  const planParam = searchParams.get("plan");
  const planFromUrl = planParam ? (dynamicPlans.find((p) => p.id === planParam) ?? null) : null;

  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(planFromUrl);
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

  const [businessForm, setBusinessForm] = useState({ ...defaultBusiness });
  const [financialsForm, setFinancialsForm] = useState({ ...defaultFinancials });
  const [documentsForm, setDocumentsForm] = useState({ ...defaultDocuments });
  const [contactForm, setContactForm] = useState({ ...defaultContact });

  const [errors1, setErrors1] = useState<Record<string, string>>({});
  const [errors2, setErrors2] = useState<Record<string, string>>({});
  const [errors5, setErrors5] = useState<Record<string, string>>({});

  const handleSelectPlan = (plan: (typeof PLANS)[0]) => {
    setSelectedPlan(plan);
    setStep(1);
  };

  if (!selectedPlan) {
    return <PricingLanding plans={dynamicPlans} onSelect={handleSelectPlan} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Page title */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-10 h-10 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Business Acquisition Review</h1>
            <p className="text-sm text-blue-600 mt-1">Complete the details to get your financial review started</p>
          </div>
        </div>

        {/* Stepper */}
        <Stepper step={step} />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Main form */}
          <div>
            {step === 1 && (
              <Step1Business
                form={businessForm}
                setForm={setBusinessForm}
                errors={errors1}
                setErrors={setErrors1}
                onNext={() => setStep(2)}
                onBack={() => setSelectedPlan(null)}
              />
            )}
            {step === 2 && (
              <Step2Financials
                form={financialsForm}
                setForm={setFinancialsForm}
                errors={errors2}
                setErrors={setErrors2}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <Step3Documents
                form={documentsForm}
                setForm={setDocumentsForm}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <Step4Package
                selectedPlan={selectedPlan}
                allPlans={dynamicPlans}
                onPlanChange={setSelectedPlan}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <Step5Contact
                form={contactForm}
                setForm={setContactForm}
                errors={errors5}
                setErrors={setErrors5}
                onNext={() => setStep(6)}
                onBack={() => setStep(4)}
              />
            )}
            {step === 6 && (
              <Step6Payment
                plan={selectedPlan}
                businessForm={businessForm}
                financialsForm={financialsForm}
                documentsForm={documentsForm}
                contactForm={contactForm}
                onBack={() => setStep(5)}
              />
            )}
          </div>

          {/* Order Summary */}
          <OrderSummary plan={selectedPlan} />
        </div>
      </div>
    </div>
  );
}
