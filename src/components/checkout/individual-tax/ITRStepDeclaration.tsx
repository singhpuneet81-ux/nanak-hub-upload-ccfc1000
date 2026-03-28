import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { ShieldAlert, Settings } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const TIMELINE = [
  { title: "Accountant Contact", desc: "Your dedicated registered accountant will contact you within 24-48 hours to discuss your tax situation." },
  { title: "ATO Data Prefill", desc: "We prefill all your income, employer, and tax information directly from the ATO using your TFN – no manual data entry needed!" },
  { title: "Draft Preparation", desc: "Your accountant prepares your tax return draft, maximizing deductions and ensuring compliance." },
  { title: "Review & Sign Online", desc: "We send you the draft for review. Once you're happy, sign it electronically through our secure portal." },
  { title: "Lodge & Confirmation", desc: "We lodge your return to the ATO and send you a confirmation of lodgement. Done!" },
];

const DECLARATIONS = [
  "The information I have provided is true and correct",
  "I authorize Nanak Accountants & Associates to access my ATO records using my TFN",
  "I understand a registered tax accountant will prepare and lodge my tax return",
  "I agree to review and sign the draft return before lodgement",
  "I have read and agree to the Terms of Service and Privacy Policy",
];

export const ITRStepDeclaration: React.FC = () => {
  const { customer, updateCustomer, prevStep } = useCheckout();
  const { packages } = usePricingPackages();
  const apiBasePrice = packages.individual_tax_return.foundation.price;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plan = customer.itrPlan || "premium";
  const price = plan === "essential" ? apiBasePrice : Math.round(apiBasePrice * 1.5);

  const handleDeclarationChange = (accepted: boolean) => {
    updateCustomer({ declarationAccepted: accepted });
  };

  const isValid = () => {
    return customer.declarationAccepted === true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      const gst = Math.round(price / 11);
      await submitCheckout({
        serviceKey: "individual_tax_return",
        customer: { ...customer },
        selections: { package: customer.itrPlan || "premium" },
        pricing: {
          subtotal: price,
          gst,
          total: price,
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
      <div className="content-card animate-fade-in">
        {/* Step Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Settings className="w-3.5 h-3.5" />
            STEP 2 OF 2
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Declaration & What to Expect</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review our service process and agree to the terms
          </p>
        </div>

        {/* How Our Service Works */}
        <div className="mb-6">
          <h3 className="font-bold text-foreground mb-4">How Our Service Works</h3>
          <div className="space-y-4">
            {TIMELINE.map((item, i) => (
              <div key={i} className="checkout-nav flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOT e-Tax Software Banner */}
        <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-[hsl(var(--cta))] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[hsl(var(--cta))]">This is NOT an e-Tax Online Service</p>
              <p className="text-xs text-[hsl(var(--cta)/0.8)] mt-1">
                Your tax return is prepared by a qualified, registered tax accountant – not automated software. You'll receive expert advice, personalized deduction strategies, and full ATO compliance assurance.
              </p>
            </div>
          </div>
        </div>

        {/* Declaration Checkbox */}
        <div className="border border-border rounded-xl p-5 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={customer.declarationAccepted || false}
              onChange={(e) => handleDeclarationChange(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <p className="font-medium text-foreground mb-2">I declare that:</p>
              <ul className="space-y-1.5">
                {DECLARATIONS.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                ))}
              </ul>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
          <BackButton onClick={prevStep} className="sm:w-32" />
          <PrimaryButton onClick={handleSubmit} disabled={!isValid() || isSubmitting} className="flex-1">
            Complete & Pay
          </PrimaryButton>
        </div>
      </div>
    </>
  );
};
