import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { formatCurrency } from "@/config/pricing.config";
import {
  Check,
  Building2,
  MapPin,
  FileText,
  Shield,
  CreditCard,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";
import {
  ADDON_PRICES,
  BUSINESS_NAME_TERMS,
  BusinessNameTerm,
  getBusinessNamePrice,
} from "../abn/pricing";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

const GST_TURNOVER_LABELS: Record<string, string> = {
  "0-74999": "$0 – $74,999",
  "75000-149999": "$75,000 – $149,999",
  "150000-1999999": "$150,000 – $1,999,999",
  "2000000+": "$2 million+",
};

const TIMELINE_STEPS = [
  { day: "Day 1", title: "Application Submitted", description: "Your GST application is lodged with the ATO" },
  { day: "1–2 Business Days", title: "Processing", description: "ATO reviews and processes your registration" },
  { day: "1–2 Business Days", title: "GST Registered", description: "Your GST registration is confirmed and certificate sent" },
];

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const GSTStepReviewPay: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customer, selections, prevStep, getSubmissionPayload } = useCheckout();
  const { packages } = usePricingPackages();
  const gstBasePrice = packages.gst.foundation.price;

  // Build line items for pricing
  const { lineItems, subtotal, gst, total } = useMemo(() => {
    const items: { name: string; price: number }[] = [];

    // Base GST registration - dynamic from API
    items.push({ name: "GST Registration", price: gstBasePrice });

    // Add-ons
    const addons: string[] = customer.selectedAddons || [];
    if (addons.includes("business_name")) {
      const term = (customer.businessNameTerm || "1yr") as BusinessNameTerm;
      const price = getBusinessNamePrice(term);
      items.push({ name: `Business Name Registration (${BUSINESS_NAME_TERMS[term].label})`, price });
    }
    if (addons.includes("registered_office")) {
      items.push({ name: "Registered Office Address", price: ADDON_PRICES.registered_office });
    }

    const sub = items.reduce((sum, item) => sum + item.price, 0);
    // ASIC fees are GST-free - exclude BN ASIC fee
    const bnAddon = addons.includes("business_name");
    const bnTerm = (customer.businessNameTerm || "1yr") as BusinessNameTerm;
    const bnAsicFee = bnAddon ? (BUSINESS_NAME_TERMS[bnTerm]?.asicFee ?? 44) : 0;
    const gstAmount = Math.round((sub - bnAsicFee) * 0.1);
    return { lineItems: items, subtotal: sub, gst: gstAmount, total: sub + gstAmount };
  }, [customer]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "gst",
        customer: { ...customer },
        selections: { ...selections },
        pricing: { lineItems, subtotal, gst, total },
        meta: {
          selectedAddons: customer.selectedAddons || [],
          proposedBusinessName: customer.proposedBusinessName || null,
          businessNameTerm: customer.businessNameTerm || null,
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  const selectedAddons: string[] = customer.selectedAddons || [];

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="content-card animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Review & Pay</h2>
        <p className="text-muted-foreground mt-1">
          One final step to get your GST registered
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Business Structure */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Business Structure</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Structure Type</span>
              <span className="font-medium text-foreground capitalize">
                {customer.businessStructure?.replace(/_/g, " ") || "—"}
              </span>
            </div>
            {customer.abn && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ABN</span>
                <span className="font-medium text-foreground">{customer.abn}</span>
              </div>
            )}
            {customer.businessName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business/Trading Name</span>
                <span className="font-medium text-foreground">{customer.businessName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Address</h3>
          </div>
          <div className="ml-11 text-sm">
            <p className="font-medium text-foreground">
              {[customer.street, customer.city, customer.state, customer.postcode]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
          </div>
        </div>

        {/* GST Details */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">GST Registration Details</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration Date</span>
              <span className="font-medium text-foreground">{customer.gstStartDate || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lodgement Cycle</span>
              <span className="font-medium text-foreground capitalize">{customer.lodgementCycle || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accounting Basis</span>
              <span className="font-medium text-foreground capitalize">{customer.accountingBasis || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST Turnover</span>
              <span className="font-medium text-foreground">
                {GST_TURNOVER_LABELS[customer.gstTurnover] || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ID Proof */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Identity Verification</h3>
          </div>
          <div className="ml-11 text-sm">
            {customer.idProof instanceof File ? (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-foreground">{customer.idProof.name}</span>
                <span className="text-muted-foreground">({(customer.idProof.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <span className="text-muted-foreground">No file uploaded</span>
            )}
          </div>
        </div>

        {/* Services Included */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Services Included</h3>
          </div>
          <div className="ml-11">
            <ul className="space-y-2">
              {lineItems.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{item.name}</span>
                  </span>
                  <span className="text-foreground font-medium">{formatCurrency(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Compliance Package */}
        {selections.package === "registration_plus_accounting" && (
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Compliance Package</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium text-foreground">Registration + Accounting</span>
              </div>
              {selections.billingFrequency && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-medium text-foreground capitalize">{selections.billingFrequency}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Total */}
      <div className="border border-border rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Order Total</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="text-foreground">{formatCurrency(gst)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-[hsl(var(--cta))]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-muted/30 rounded-xl p-5 mb-6">
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
                {index < TIMELINE_STEPS.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
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

      {/* Declaration */}
      {customer.signature && (
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">Declaration Accepted</p>
            <p className="text-muted-foreground">Signed by: <span className="italic">{customer.signature}</span></p>
          </div>
        </div>
      )}

      {/* Buttons - desktop only, mobile uses unified bottom bar */}
      <div className="hidden md:flex gap-3">
        <BackButton onClick={prevStep} className="w-32" />
        <PrimaryButton onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
          Complete & Pay {formatCurrency(total)}
        </PrimaryButton>
      </div>
    </div>
    </>
  );
};
