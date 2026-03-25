import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { BackButton, PrimaryButton } from "@/components/checkout/Buttons";
import { formatCurrency } from "@/config/pricing.config";
import { cn } from "@/lib/utils";
import { CreditCard, Check, CheckCircle2, Clock, Lock, PenTool, Shield, AlertTriangle, Info } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

const TIMELINE = [
  { label: "Within 5 minutes:", text: "Confirmation email with order summary" },
  { label: "Within 24 hours:", text: "Senior accountant reviews your details" },
  { label: "Within 2-3 business days:", text: "Bare Trust deed prepared and sent for e-signing" },
  { label: "Before settlement:", text: "We coordinate to ensure trust is in place on time" },
];

export const BTStepPayment: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customer, updateCustomer, prevStep } = useCheckout();
  const { packages } = usePricingPackages();
  const BT_PRICE = packages.bare_trust.foundation.price;

  const { subtotal, gst, total } = useMemo(() => {
    const sub = Math.round((BT_PRICE / 1.1) * 100) / 100;
    const g = Math.round((BT_PRICE - sub) * 100) / 100;
    return { subtotal: sub, gst: g, total: BT_PRICE };
  }, [BT_PRICE]);

  const allDeclarationsAccepted =
    (customer.btDeclarations || []).length >= 3 && (customer.btDeclarations || []).every(Boolean);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "bare_trust",
        customer: {
          propertyBySmsf: customer.btPropertyBySmsf,
          borrowingToAcquire: customer.btBorrowingToAcquire,
          propertyAddress: customer.btPropertyAddress,
          propertyState: customer.btPropertyState,
          contractExchangeDate: customer.btContractExchangeDate,
          settlementDate: customer.btSettlementDate,
          contractSigned: customer.btContractSigned,
          smsfName: customer.btSmsfName,
          smsfAbn: customer.btSmsfAbn,
          smsfEstablished: customer.btSmsfEstablished,
          trusteeCompanyName: customer.btTrusteeCompanyName,
          directors: customer.btDirectors,
          shareholders: customer.btShareholders,
          address: {
            line1: customer.btAddressLine1,
            line2: customer.btAddressLine2,
            city: customer.btCity,
            state: customer.btState,
            postcode: customer.btPostcode,
          },
          lenderName: customer.btLenderName,
          loanType: customer.btLoanType,
          loanAmount: customer.btLoanAmount,
          limitedRecourse: customer.btLimitedRecourse,
          cardholderName: customer.btCardholderName,
          signature: customer.btSignature,
        },
        selections: {},
        pricing: {
          bareTrustSetup: BT_PRICE,
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
      {/* Header */}
      <div className="content-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Review & Payment</h2>
            <p className="text-sm text-muted-foreground">Complete your Bare Trust setup order</p>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          What happens next?
        </h4>
        <ul className="mt-3 space-y-2">
          {TIMELINE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-[hsl(142_71%_35%)] shrink-0 mt-0.5" />
              <span>
                <strong>{item.label}</strong> {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Declaration */}
      <div className="content-card">
        <p className="text-sm font-semibold text-foreground mb-3">
          By proceeding with this order, I confirm that:
        </p>
        <ul className="space-y-2.5 text-sm text-muted-foreground list-disc list-inside leading-relaxed">
          <li>The Bare Trust is being established to hold a single asset under an SMSF Limited Recourse Borrowing Arrangement (LRBA).</li>
          <li>The beneficial ownership of the asset will remain with the SMSF.</li>
          <li>All information provided is true and complete.</li>
          <li>This service includes trust deed preparation and compliance setup only. No legal, lending, or financial advice is being provided.</li>
          <li>I understand lender-specific changes may incur additional fees.</li>
          <li>I authorise Nanak Accountants & Associates to prepare the Bare Trust documentation.</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-3 italic">
          By typing my name below, I provide my legal electronic signature and request you to proceed.
        </p>
      </div>

      {/* Signature */}
      <div className="content-card">
        <div className="flex items-center gap-2 mb-2">
          <PenTool className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">
            Your Signature <span className="text-destructive">*</span>
          </label>
        </div>
        <input
          type="text"
          value={customer.btSignature || ""}
          onChange={(e) =>
            updateCustomer({ btSignature: e.target.value.replace(/\b\w/g, (c: string) => c.toUpperCase()) })
          }
          placeholder="Type your full name as signature"
          className={cn(
            "w-full h-11 px-4 border rounded-lg text-sm bg-background italic",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            customer.btSignature ? "border-primary" : "border-border",
          )}
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
          <Lock className="w-3 h-3" />
          By typing your name, you are providing a legal electronic signature
        </p>
      </div>

      {/* Declarations warning */}
      {!allDeclarationsAccepted && (
        <p className="text-sm text-destructive text-center font-medium">
          Please accept all declarations in the previous step to proceed
        </p>
      )}

      {/* Footer CTA */}
      <div className="bg-primary text-primary-foreground rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Complete Your Bare Trust Setup</h3>
            <p className="text-sm opacity-90">Your Bare Trust will be established within 2-3 business days</p>
            <div className="flex items-center gap-4 mt-2 text-xs opacity-80">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> 256-bit encryption
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> PCI compliant
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BackButton
              onClick={prevStep}
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            />
            <PrimaryButton
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !allDeclarationsAccepted ||
                !(customer.btSignature || "").trim()
              }
            >
              <Check className="w-4 h-4" />
              Pay {formatCurrency(total)} & Submit
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Legal */}
      <p className="text-xs text-center text-muted-foreground">
        By completing payment, you agree to our terms of service and privacy policy. Amount shown is in AUD and includes
        GST.
      </p>
    </div>
    </>
  );
};
