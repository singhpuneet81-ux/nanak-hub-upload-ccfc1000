import React, { useEffect } from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import { ABNPageHeader } from "@/components/checkout/abn/ABNPageHeader";
import { ABNStepper } from "@/components/checkout/abn/ABNStepper";
import { ABNOrderSummary } from "@/components/checkout/abn/ABNOrderSummary";
import { ABNStepYourDetails } from "@/components/checkout/abn/ABNStepYourDetails";
import { ABNStepAddons } from "@/components/checkout/abn/ABNStepAddons";
import { ABNStepReviewPay } from "@/components/checkout/abn/ABNStepReviewPay";
import { SummaryMobile } from "@/components/checkout/OrderSummary";

const ABNCheckoutContent: React.FC = () => {
  const { currentStep, setStep } = useCheckout();

  // Normalize legacy step=0 links to first actual ABN step
  useEffect(() => {
    if (currentStep === 0) {
      setStep(1);
    }
  }, [currentStep, setStep]);

  // Map internal steps to ABN steps (1-3, no Package step)
  const abnStep = (() => {
    if (currentStep <= 1) return 1; // Your Details
    if (currentStep === 2) return 2; // Add-ons
    return 3; // Review & Pay
  })();

  const renderStep = () => {
    switch (abnStep) {
      case 1:
        return <ABNStepYourDetails />;
      case 2:
        return <ABNStepAddons />;
      case 3:
        return <ABNStepReviewPay />;
      default:
        return <ABNStepYourDetails />;
    }
  };

  const handleStepClick = (step: number) => {
    if (step === 1) setStep(1);
    else if (step === 2) setStep(2);
    else setStep(3);
  };

  return (
    <div className="min-h-screen bg-background">
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
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Step Content */}
          <div className="flex-1 min-w-0">{renderStep()}</div>

          {/* Right: Order Summary (Desktop) */}
          <div className={`w-[340px] shrink-0 ${abnStep < 3 ? 'hidden lg:block' : ''}`}>
            <ABNOrderSummary />
          </div>
        </div>
      </main>

      {/* Mobile Summary Bar */}
      <SummaryMobile />
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
