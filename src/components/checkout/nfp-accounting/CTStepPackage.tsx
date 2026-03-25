import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/* Charitable Trust Pricing Config                                      */
/* ------------------------------------------------------------------ */

const BASE_ANNUAL_PRICE = 2200; // $2,200/yr
const CORPORATE_TRUSTEE_FEE = 400; // +$400/yr

const REVENUE_RANGES = [
  { id: "under-100k", label: "Under $100K" },
  { id: "100k-250k", label: "$100K - $250K" },
  { id: "250k-500k", label: "$250K - $500K" },
  { id: "500k-1m", label: "$500K - $1M" },
  { id: "1m-plus", label: "Over $1M" },
];

const BASE_COMPLIANCE_FEATURES = [
  "Trust financial statements",
  "Trustee reporting",
  "ACNC reporting (if applicable)",
  "Income tax return or exemption review",
  "Trust compliance review",
  "Beneficiary distributions",
  "Priority support",
];

const TRUSTEE_OPTIONS = [
  { id: "individual", label: "Individual Trustee", sub: "Personal trustees managing the trust", price: 0, priceLabel: "Included" },
  { id: "corporate", label: "Corporate Trustee", sub: "Company acting as trustee (additional ASIC compliance)", price: CORPORATE_TRUSTEE_FEE, priceLabel: `+$${CORPORATE_TRUSTEE_FEE}/yr` },
];

const AUDIT_OPTIONS = [
  { id: "none", label: "No Audit Required", sub: "Standard financial statements only", price: 0, priceLabel: "Included" },
  { id: "financial_review", label: "Financial Review", sub: "Limited assurance engagement", price: 1500, priceLabel: "+$1,500/yr" },
  { id: "statutory_audit", label: "Statutory Audit", sub: "Full audit engagement with auditor's report", price: 3800, priceLabel: "+$3,800/yr" },
];

const ADDITIONAL_SERVICES = [
  { id: "grant_acquittal", label: "Grant Acquittal Reporting", sub: "End-of-grant financial reports", price: 550 },
  { id: "board_governance", label: "Board Governance Advisory", sub: "Quarterly trustee reviews", price: 1300 },
  { id: "financial_controller", label: "Financial Controller Support", sub: "Monthly financial management", price: 2800 },
  { id: "policy_docs", label: "Policy Documentation", sub: "Financial policies & procedures", price: 900 },
  { id: "internal_controls", label: "Internal Controls Review", sub: "Annual controls assessment", price: 1100 },
];

interface Props {
  onProceed: () => void;
}

export const CTStepPackage: React.FC<Props> = ({ onProceed }) => {
  const { customer, updateCustomer } = useCheckout();

  const billing = (customer.ctBilling as "annual" | "monthly") || "annual";
  const revenue = (customer.ctRevenue as string) || "";
  const dgrEnabled = !!customer.ctDGR;
  const trusteeType = (customer.ctTrusteeType as string) || "individual";
  const auditOption = (customer.ctAudit as string) || "none";
  const additionalServices = (customer.ctAdditionalServices as string[]) || [];
  const [showAdditional, setShowAdditional] = useState(false);

  const discountRate = billing === "annual" ? 0.10 : 0;

  // Calculate base price
  const basePrice = Math.round(BASE_ANNUAL_PRICE * (1 - discountRate));
  const monthlyBase = Math.round(BASE_ANNUAL_PRICE / 12);

  // Trustee fee
  const trusteeFee = trusteeType === "corporate" ? Math.round(CORPORATE_TRUSTEE_FEE * (1 - discountRate)) : 0;

  // Audit fee
  const auditEntry = AUDIT_OPTIONS.find((a) => a.id === auditOption);
  const auditFee = auditEntry ? Math.round(auditEntry.price * (1 - discountRate)) : 0;

  // Additional services
  const addOnTotal = additionalServices.reduce((sum, id) => {
    const svc = ADDITIONAL_SERVICES.find((s) => s.id === id);
    return sum + (svc ? svc.price : 0);
  }, 0);

  const total = basePrice + trusteeFee + auditFee + addOnTotal;
  const monthlyTotal = Math.round(total / 12);

  const toggleAdditionalService = (id: string) => {
    const current = additionalServices;
    const updated = current.includes(id)
      ? current.filter((s: string) => s !== id)
      : [...current, id];
    updateCustomer({ ctAdditionalServices: updated });
  };

  const handleProceed = () => {
    updateCustomer({
      ctBilling: billing,
      ctRevenue: revenue,
      ctDGR: dgrEnabled,
      ctTrusteeType: trusteeType,
      ctAudit: auditOption,
      ctAdditionalServices: additionalServices,
      ctBasePrice: basePrice,
      ctTrusteeFee: trusteeFee,
      ctAuditFee: auditFee,
      ctAddOnTotal: addOnTotal,
      ctTotal: total,
    });
    onProceed();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--cta)/0.1)] flex items-center justify-center">
            <span className="text-[hsl(var(--cta))] text-xl">♡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Charitable Trust Accounting</h1>
            <p className="text-sm text-muted-foreground">Configure your trust compliance package</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Billing Frequency */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-sm font-medium text-muted-foreground mb-3">Billing Frequency</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateCustomer({ ctBilling: "annual" })}
                  className={cn(
                    "rounded-xl p-4 text-center transition-all border-2",
                    billing === "annual"
                      ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.02)]"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <p className="font-bold text-foreground">Annual Billing</p>
                  <p className="text-sm text-[hsl(var(--success))] font-medium">Save 10%</p>
                </button>
                <button
                  onClick={() => updateCustomer({ ctBilling: "monthly" })}
                  className={cn(
                    "rounded-xl p-4 text-center transition-all border-2",
                    billing === "monthly"
                      ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.02)]"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <p className="font-bold text-foreground">Monthly Billing</p>
                  <p className="text-sm text-muted-foreground">Flexible payments</p>
                </button>
              </div>
            </div>

            {/* Base Package */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <span className="inline-block text-[10px] font-bold text-white bg-[hsl(var(--cta))] px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wide disabled:opacity-50">
                Required Base Package
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Charitable Trust Annual Compliance</h3>
                  <p className="text-sm text-muted-foreground">Complete compliance for charitable trusts</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    ${billing === "annual" ? basePrice.toLocaleString() : monthlyBase.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">/{billing === "annual" ? "year" : "month"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {BASE_COMPLIANCE_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--cta))] shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Annual Revenue */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <label className="block text-sm font-bold text-foreground mb-2">
                Annual Revenue <span className="text-destructive">*</span>
              </label>
              <Select value={revenue} onValueChange={(v) => updateCustomer({ ctRevenue: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_RANGES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">Determines complexity of trust reporting requirements</p>
            </div>

            {/* DGR Status */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">DGR Status (Deductible Gift Recipient)</h3>
                  <p className="text-sm text-muted-foreground">Endorsed for tax-deductible donations?</p>
                </div>
                <button
                  onClick={() => updateCustomer({ ctDGR: !dgrEnabled })}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    dgrEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                    dgrEnabled ? "translate-x-6" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>

            {/* Trustee Type */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-3">
                Trustee Type <span className="text-destructive">*</span>
              </h3>
              <div className="space-y-2">
                {TRUSTEE_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => updateCustomer({ ctTrusteeType: opt.id })}
                    className={cn(
                      "flex items-center justify-between rounded-lg p-4 cursor-pointer transition-all",
                      trusteeType === opt.id
                        ? "border-2 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.02)]"
                        : "border border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        trusteeType === opt.id ? "border-[hsl(var(--cta))]" : "border-muted-foreground/40"
                      )}>
                        {trusteeType === opt.id && <div className="w-2 h-2 rounded-full bg-[hsl(var(--cta))] disabled:opacity-50" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.sub}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      opt.price === 0 ? "text-[hsl(var(--success))]" : "text-foreground"
                    )}>
                      {opt.priceLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit / Review */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-3">Audit / Review Requirement</h3>
              <div className="space-y-2">
                {AUDIT_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => updateCustomer({ ctAudit: opt.id })}
                    className={cn(
                      "flex items-center justify-between rounded-lg p-4 cursor-pointer transition-all",
                      auditOption === opt.id
                        ? "border-2 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.02)]"
                        : "border border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        auditOption === opt.id ? "border-[hsl(var(--cta))]" : "border-muted-foreground/40"
                      )}>
                        {auditOption === opt.id && <div className="w-2 h-2 rounded-full bg-[hsl(var(--cta))] disabled:opacity-50" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.sub}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      opt.price === 0 ? "text-[hsl(var(--success))]" : "text-foreground"
                    )}>
                      {opt.priceLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Support Services */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setShowAdditional(!showAdditional)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-bold text-foreground">Additional Support Services</h3>
                  <p className="text-sm text-muted-foreground">Optional advisory and governance support</p>
                </div>
                {showAdditional ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showAdditional && (
                <div className="px-5 pb-5 space-y-2">
                  {ADDITIONAL_SERVICES.map((svc) => {
                    const isChecked = additionalServices.includes(svc.id);
                    return (
                      <div
                        key={svc.id}
                        onClick={() => toggleAdditionalService(svc.id)}
                        className="flex items-center justify-between rounded-lg p-3 border border-border hover:border-primary/30 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isChecked} onCheckedChange={() => toggleAdditionalService(svc.id)} />
                          <div>
                            <p className="font-medium text-foreground text-sm">{svc.label}</p>
                            <p className="text-xs text-muted-foreground">{svc.sub}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          ${svc.price.toLocaleString()}/yr
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cost Summary Sidebar */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
              <div className="p-5 space-y-4">
                <h2 className="text-lg font-bold text-foreground">Cost Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground">Base compliance</span>
                    <span className="font-medium text-foreground">${basePrice.toLocaleString()}</span>
                  </div>
                  {trusteeFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-foreground">Corporate trustee</span>
                      <span className="font-medium text-foreground">${trusteeFee.toLocaleString()}</span>
                    </div>
                  )}
                  {auditFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-foreground">{auditEntry?.label}</span>
                      <span className="font-medium text-foreground">${auditFee.toLocaleString()}</span>
                    </div>
                  )}
                  {addOnTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-foreground">Additional services</span>
                      <span className="font-medium text-foreground">${addOnTotal.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Total Annual Cost</span>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[hsl(var(--cta))]">${total.toLocaleString()}</p>
                      {billing === "monthly" && (
                        <p className="text-sm text-muted-foreground">${monthlyTotal}/month</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceed}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  <Shield size={16} />
                  Proceed Securely →
                </button>

                {/* Trust Badges */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                    <span className="text-muted-foreground">Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                    <span className="text-muted-foreground">No lock-in contracts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                    <span className="text-muted-foreground">30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
