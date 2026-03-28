import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { formatCurrency } from "@/config/pricing.config";
import { cn } from "@/lib/utils";
import {
  Check, User, Building2, FileText, CreditCard, Clock,
  CheckCircle2, PenTool, Lock, Upload
} from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { FileUpload } from "@/components/checkout/abn/FileUpload";

const TIMELINE_STEPS = [
  { day: "Day 1", title: "Application Submitted", description: "Your SMSF setup documents are prepared" },
  { day: "Day 2-4", title: "ASIC & ATO Registration", description: "Corporate trustee and SMSF registered" },
  { day: "Day 5-6", title: "Setup Complete", description: "All documents delivered, fund ready to operate" },
];



export const SMSFStepReviewPay: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customer, updateCustomer, prevStep } = useCheckout();
  const { packages } = usePricingPackages();
  const SMSF_BASE_PRICE = packages.smsf.foundation.price;
  const BARE_TRUST_PRICE = packages.bare_trust.foundation.price;
  const BARE_TRUST_BUNDLE_PRICE = 1500;
  const ASIC_FEE = 611;
  const memberCount = customer.smsfMemberCount || 1;
  const bareTrustSelected = customer.smsfBareTrust || false;

  // Match OrderSummary calculation exactly
  const { subtotal, gst, total } = useMemo(() => {
    const gstableAmount = SMSF_BASE_PRICE + (bareTrustSelected ? BARE_TRUST_BUNDLE_PRICE : 0);
    const g = Math.round(gstableAmount / 11);
    return { subtotal: gstableAmount + ASIC_FEE, gst: g, total: gstableAmount + ASIC_FEE + g };
  }, [bareTrustSelected, SMSF_BASE_PRICE]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");

      const members: Record<string, any>[] = [];
      for (let i = 0; i < memberCount; i++) {
        members.push(customer[`smsfMember${i}`] || {});
      }

      await submitCheckout({
        serviceKey: "smsf",
        customer: {
          email: customer.smsfEmail,
          phone: customer.smsfPhone,
          fundName: customer.smsfFundName,
          trusteeCompanyName: customer.smsfTrusteeCompanyName,
          memberCount,
          members,
          bareTrust: bareTrustSelected,
          signature: customer.smsfSignature,
          signatoryName: customer.smsfSignatoryName,
        },
        selections: {},
        pricing: {
          smsfSetup: SMSF_BASE_PRICE,
          bareTrust: bareTrustSelected ? BARE_TRUST_PRICE : 0,
          bareTrustSavings: bareTrustSelected ? 500 : 0,
          subtotal,
          gst,
          total,
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <h2 className="text-2xl font-bold text-foreground">Review & Pay</h2>
        <p className="text-muted-foreground mt-1">Review your SMSF setup details before payment</p>
      </div>

      {/* SMSF Details */}
      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">SMSF Details</h3>
        </div>
        <div className="ml-11 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fund Name</span>
            <span className="font-medium text-foreground">{customer.smsfFundName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trustee Company</span>
            <span className="font-medium text-foreground">{customer.smsfTrusteeCompanyName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Number of Members</span>
            <span className="font-medium text-foreground">{memberCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contact Email</span>
            <span className="font-medium text-foreground">{customer.smsfEmail || "—"}</span>
          </div>
        </div>
      </div>

      {/* Members Summary */}
      {Array.from({ length: memberCount }).map((_, i) => {
        const m = customer[`smsfMember${i}`] || {};
        return (
          <div key={i} className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Member {i + 1}</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">
                  {[m.title, m.firstName, m.middleName, m.lastName].filter(Boolean).join(" ") || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{m.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="font-medium text-foreground">{m.dateOfBirth || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DIN Status</span>
                <span className="font-medium text-foreground">
                  {m.hasDIN === "yes" ? `Has DIN: ${m.dinNumber || "—"}` : "Will apply"}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add-ons */}
      {bareTrustSelected && (
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Add-ons</h3>
          </div>
          <div className="ml-11 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground">Bare Trust / Holding Trust</span>
              <div className="text-right">
                <span className="text-muted-foreground line-through text-xs mr-2">$2,000</span>
                <span className="font-medium text-foreground">{formatCurrency(BARE_TRUST_PRICE)}</span>
              </div>
            </div>
            <p className="text-xs text-[hsl(142_71%_35%)] mt-1">Save $500 bundle discount</p>
          </div>
        </div>
      )}

      {/* Order Total */}
      <div className="border border-border rounded-xl p-5">

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">SMSF Setup with Corporate Trustee</span>
            <span className="text-foreground">{formatCurrency(SMSF_BASE_PRICE)}</span>
          </div>
          {bareTrustSelected && (
            <div className="flex justify-between">
              <div>
                <span className="text-muted-foreground">Bare Trust / Holding Trust</span>
                <p className="text-xs text-[hsl(142_71%_35%)]">Save $500</p>
              </div>
              <span className="text-foreground">{formatCurrency(BARE_TRUST_PRICE)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">{formatCurrency(gst)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-[hsl(var(--cta))]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-muted/30 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">What Happens Next?</h3>
        </div>
        <div className="relative">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={index} className="flex gap-4 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                {index < TIMELINE_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
              </div>
              <div className="pb-4">
                <p className="text-xs font-medium text-primary">{step.day}</p>
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ID Proof Upload for each member */}
      <div className="content-card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">ID Verification</h3>
        </div>
        <p className="text-sm text-muted-foreground">Please upload a valid Driver License or Passport for each member</p>
        {Array.from({ length: memberCount }).map((_, i) => {
          const m = customer[`smsfMember${i}`] || {};
          const memberName = [m.firstName, m.lastName].filter(Boolean).join(" ") || `Member ${i + 1}`;
          return (
            <FileUpload
              key={i}
              label={`${memberName} – Driver License or Passport`}
              required
              value={customer[`smsfMemberIdProof${i}`] || null}
              onChange={(file) => updateCustomer({ [`smsfMemberIdProof${i}`]: file })}
            />
          );
        })}
      </div>

      {/* Signature (text-input only) */}
      <div className="content-card">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PenTool className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">
                Your Signature <span className="text-destructive">*</span>
              </label>
            </div>
            <input
              type="text"
              value={customer.smsfSignature || ""}
              onChange={(e) =>
                updateCustomer({ smsfSignature: e.target.value.replace(/\b\w/g, (c: string) => c.toUpperCase()) })
              }
              placeholder="Type your full name as signature"
              className={cn(
                "w-full h-11 px-4 border rounded-lg text-sm bg-background italic",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                customer.smsfSignature ? "border-primary" : "border-border"
              )}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
              <Lock className="w-3 h-3" />
              By typing your name, you are providing a legal electronic signature
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Signatory Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={customer.smsfSignatoryName || ""}
              onChange={(e) => updateCustomer({ smsfSignatoryName: e.target.value })}
              placeholder="Enter your full legal name for verification"
              className="w-full h-11 px-4 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">This must match the name on your identification documents</p>
          </div>
        </div>
      </div>

      {/* Declaration */}
      {customer.smsfSignature && (
        <div className="flex items-start gap-3 p-4 bg-[hsl(142_76%_94%)] border border-[hsl(142_71%_85%)] rounded-xl">
          <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-[hsl(142_71%_35%)]">Declaration Accepted</p>
            <p className="text-[hsl(142_71%_45%)]">Signed by {customer.smsfSignatoryName || customer.smsfSignature}</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !(customer.smsfSignature || "").trim() ||
            !(customer.smsfSignatoryName || "").trim() ||
            Array.from({ length: memberCount }).some((_, i) => !customer[`smsfMemberIdProof${i}`])
          }
          className="flex-1"
        >
          Complete & Pay 
        </PrimaryButton>
      </div>
    </div>
    </>
  );
};
