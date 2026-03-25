
import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { formatCurrency } from "@/config/pricing.config";
import { 
  Check, 
  Building2, 
  User, 
  FileText, 
  Shield, 
  CreditCard,
  Clock,
  CheckCircle2
} from "lucide-react";

import {
  buildABNLineItems,
  LineItem,
  ACCOUNTING_PLANS,
  ANNUAL_DISCOUNT_MULTIPLIER,
} from "./pricing"; // same path as OrderSummary

import { usePricingPackages } from "@/hooks/usePricingPackages";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";


const TIMELINE_STEPS = [
  { day: "Day 1", title: "Application Submitted", description: "Your ABN application is lodged with the ATO" },
  { day: "Day 2-3", title: "Processing", description: "ATO reviews and processes your application" },
  { day: "Day 5-7", title: "ABN Issued", description: "Your ABN is registered and certificate sent" },
];

export const ABNStepReviewPay: React.FC = () => {
const { customer, selections, prevStep, getSubmissionPayload } = useCheckout();
const [isSubmitting, setIsSubmitting] = useState(false);
const { packages } = usePricingPackages();
const dynamicBasePrice = packages.abn.foundation.price;
const lineItems = useMemo<LineItem[]>(() => {
  return buildABNLineItems({ selections, customer, basePrice: dynamicBasePrice });
}, [selections, customer, dynamicBasePrice]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "abn",
        customer: { ...customer },
        selections: { ...selections },
        pricing: { lineItems, subtotal, gst, total },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  // Build services included list
  const servicesIncluded = lineItems.map(item => item.name);
  if (customer.selectedAddons?.includes("gst")) servicesIncluded.push("GST Registration");
  if (customer.selectedAddons?.includes("registered_office")) servicesIncluded.push("Registered Office Address");
  if (customer.selectedAddons?.includes("business_name")) servicesIncluded.push(`Business Name: ${customer.proposedBusinessName}`);


  const { subtotal, gst, total, annualSavings } = useMemo(() => {
  const sub = lineItems.reduce((sum, item) => sum + item.price, 0);
  // ASIC fees are GST-free - exclude BN ASIC fee from taxable amount
  const bnAddon = (customer.selectedAddons || []).includes("business_name");
  const bnTerm = (customer.businessNameTerm || "1yr") as string;
  const bnAsicFee = bnAddon ? (bnTerm === "3yr" ? 102 : 44) : 0;
  const taxableAmount = sub - bnAsicFee;
  const gstAmount = Math.round(taxableAmount * 0.1);
  const totalAmount = sub + gstAmount;

  let savings = 0;
  if (
    selections.package === "registration_plus_accounting" &&
    selections.billingFrequency === "annual" &&
    selections.accountingPlan
  ) {
    const base =
      ACCOUNTING_PLANS[selections.accountingPlan]?.monthlyPrice ?? 0;
    savings = Math.round(base * 12 * (1 - ANNUAL_DISCOUNT_MULTIPLIER));
  }

  return { subtotal: sub, gst: gstAmount, total: totalAmount, annualSavings: savings };
}, [lineItems, selections]);

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="content-card animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Review & Pay</h2>
        <p className="text-muted-foreground mt-1">
          One final step to get your ABN registered
        </p>
      </div>

      {/* Summary Sections */}
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
              <span className="font-medium text-foreground">{customer.businessStructure || "Sole Trader"}</span>
            </div>
            {customer.previousAbn && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous ABN</span>
                <span className="font-medium text-foreground">{customer.previousAbn}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Person */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Contact Person</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{customer.firstName} {customer.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{customer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-foreground">{customer.phone}</span>
            </div>
            {customer.street && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium text-foreground text-right">
                  {customer.street}, {customer.suburb} {customer.state} {customer.postcode}
                </span>
              </div>
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
              {servicesIncluded.map((service, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-foreground">{service}</span>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-medium text-foreground capitalize">{selections.billingFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground capitalize">{selections.accountingPlan}</span>
              </div>
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
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
              </div>
              {/* Content */}
              <div className="pb-4">
                <p className="text-xs font-medium text-primary">{step.day}</p>
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration Confirmation */}
      {customer.signature && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-green-800">Declaration Accepted</p>
            <p className="text-green-700">Signed by {customer.firstName} {customer.lastName}</p>
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
