import React, { useEffect, useMemo, useState } from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import { ABNPageHeader } from "@/components/checkout/abn/ABNPageHeader";
import { ABNStepper } from "@/components/checkout/abn/ABNStepper";
import { ABNOrderSummary } from "@/components/checkout/abn/ABNOrderSummary";
import { ABNStepYourDetails } from "@/components/checkout/abn/ABNStepYourDetails";
import { ABNStepAddons } from "@/components/checkout/abn/ABNStepAddons";
import { ABNStepReviewPay } from "@/components/checkout/abn/ABNStepReviewPay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/config/pricing.config";
import { buildABNLineItems } from "@/components/checkout/abn/pricing";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { validateEmail, validatePhone, validateTFNOptional, validateABNOptional } from "@/utils/validation";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

/** Replicates ABNStepYourDetails validation using context data */
function useABNStep1Valid() {
  const { customer } = useCheckout();

  return useMemo(() => {
    const required = [
      "businessStructure", "appliedBefore", "firstName", "lastName",
      "street", "city", "state", "postcode", "phone", "email",
      "occupation", "signature", "declarationAccepted",
    ];
    if (customer.occupation === "other") required.push("otherOccupation");
    if (customer.appliedBefore === "yes") required.push("previousABN");

    for (const key of required) {
      const value = customer[key];
      if (!value) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (typeof value === "boolean" && !value) return false;
    }
    if (!customer.idProof) return false;
    if (validateEmail(customer.email || "")) return false;
    if (validatePhone(customer.phone || "")) return false;
    if (validateTFNOptional(customer.tfn || "")) return false;
    if (customer.appliedBefore === "yes" && validateABNOptional(customer.previousABN || "")) return false;

    return true;
  }, [customer]);
}

const ABNCheckoutContent: React.FC = () => {
  const { currentStep, setStep, nextStep, prevStep, customer, selections } = useCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { packages } = usePricingPackages();
  const step1Valid = useABNStep1Valid();

  // Normalize legacy step=0 links to first actual ABN step
  useEffect(() => {
    if (currentStep === 0) {
      setStep(1);
    }
  }, [currentStep, setStep]);

  // Map internal steps to ABN steps (1-3)
  const abnStep = (() => {
    if (currentStep <= 1) return 1;
    if (currentStep === 2) return 2;
    return 3;
  })();

  const renderStep = () => {
    switch (abnStep) {
      case 1: return <ABNStepYourDetails />;
      case 2: return <ABNStepAddons />;
      case 3: return <ABNStepReviewPay />;
      default: return <ABNStepYourDetails />;
    }
  };

  const handleStepClick = (step: number) => {
    if (step === 1) setStep(1);
    else if (step === 2) setStep(2);
    else setStep(3);
  };

  // Calculate total for submit button text
  const dynamicBasePrice = packages.abn.foundation.price;
  const lineItems = useMemo(() => {
    return buildABNLineItems({ selections, customer, basePrice: dynamicBasePrice });
  }, [selections, customer, dynamicBasePrice]);

  const total = useMemo(() => {
    const sub = lineItems.reduce((sum, item) => sum + item.price, 0);
    const bnAddon = (customer.selectedAddons || []).includes("business_name");
    const bnTerm = (customer.businessNameTerm || "1yr") as string;
    const bnAsicFee = bnAddon ? (bnTerm === "3yr" ? 102 : 44) : 0;
    const taxableAmount = sub - bnAsicFee;
    const gstAmount = Math.round(taxableAmount * 0.1);
    return sub + gstAmount;
  }, [lineItems, customer]);

  // Mobile nav handlers
  const isContinueDisabled = abnStep === 1 ? !step1Valid : false;

  const handleMobileContinue = async () => {
    if (abnStep === 3) {
      // Submit
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const { submitCheckout } = await import("@/utils/submitCheckout");
        await submitCheckout({
          serviceKey: "abn",
          customer: { ...customer },
          selections: { ...selections },
          pricing: { lineItems, total },
        });
      } catch {
        setIsSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  const handleMobileBack = () => {
    prevStep();
  };

  const mobileButtonText = abnStep === 3
    ? `Complete & Pay ${formatCurrency(total)}`
    : "Continue";

  return (
    <div className="min-h-screen bg-background">
      <CheckoutLoader visible={isSubmitting} />

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <ABNPageHeader />
      </div>

      {/* Stepper */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ABNStepper currentStep={abnStep} onStepClick={handleStepClick} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 md:pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Step Content */}
          <div className="flex-1 min-w-0">{renderStep()}</div>

          {/* Right: Order Summary (Desktop + visible on step 3 mobile) */}
          <div className={`w-full lg:w-[340px] shrink-0 ${abnStep < 3 ? 'hidden lg:block' : ''}`}>
            <ABNOrderSummary />
          </div>
        </div>
      </main>

      {/* Unified Mobile Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          {/* Back button - only show from step 2+ */}
          {abnStep > 1 && (
            <button
              onClick={handleMobileBack}
              className="h-12 px-5 rounded-2xl font-medium text-sm bg-card text-foreground border border-border hover:bg-secondary active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}

          {/* Continue / Submit button */}
          <button
            onClick={handleMobileContinue}
            disabled={isContinueDisabled || isSubmitting}
            className="flex-1 h-12 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(180deg, hsl(24, 95%, 55%) 0%, hsl(24, 95%, 50%) 100%)",
            }}
          >
            {mobileButtonText}
            {abnStep < 3 && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ABNCheckoutPageProps {
  serviceId?: string;
  categoryId?: string;
}

export const ABNCheckoutPage: React.FC<ABNCheckoutPageProps> = ({
  serviceId = "abn-registration",
  categoryId = "setups-registrations",
}) => {
  return (
    <CheckoutFlowProvider initialServiceId={serviceId} initialCategoryId={categoryId}>
      <ABNCheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default ABNCheckoutPage;
