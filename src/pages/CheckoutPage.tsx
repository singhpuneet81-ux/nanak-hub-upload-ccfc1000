import React from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { StepperHeader } from "@/components/checkout/StepperHeader";
import { SummarySidebar, SummaryMobile } from "@/components/checkout/OrderSummary";
import { StepPricing } from "@/components/checkout/steps/StepPricing";
import { StepYourDetails } from "@/components/checkout/steps/StepYourDetails";
import { StepRegistrationTerm } from "@/components/checkout/steps/StepRegistrationTerm";
import { StepPlanSelection } from "@/components/checkout/steps/StepPlanSelection";
import { StepPayroll } from "@/components/checkout/steps/StepPayroll";
import { StepReviewPay } from "@/components/checkout/steps/StepReviewPay";

const CheckoutContent: React.FC = () => {
  const { currentStep, serviceName, setStep } = useCheckout();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPricing />;
      case 1:
        return <StepYourDetails />;
      case 2:
        return <StepRegistrationTerm />;
      case 3:
        return <StepPlanSelection />;
      case 4:
        return <StepPayroll />;
      case 5:
        return <StepReviewPay />;
      default:
        return <StepPricing />;
    }
  };

  // Step 0 (Pricing) has a different layout - no sidebar
  const isPricingStep = currentStep === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <CheckoutHeader serviceName={serviceName} /> */}

      {/* Stepper - hide on step 0, sticky at top */}
      {!isPricingStep && (
        <div className="bg-card border-b border-border sticky top-0 z-40">
          <StepperHeader currentStep={currentStep} onStepClick={setStep} />
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 md:px-8 ${isPricingStep ? 'py-6' : 'py-6 pb-28 lg:pb-8 checkout-content-pad'}`}>
        {isPricingStep ? (
          <div className="max-w-4xl mx-auto">
            {renderStep()}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Step Content */}
            <div className="flex-1 min-w-0">
              {renderStep()}
            </div>

            {/* Right: Order Summary (Desktop) */}
            <div className="hidden lg:block w-[340px] shrink-0">
              <SummarySidebar />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Summary Bar - hide on step 0 */}
      {!isPricingStep && <SummaryMobile />}
    </div>
  );
};

interface CheckoutPageProps {
  serviceId?: string;
  categoryId?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  serviceId = "business-name-registration",
  categoryId = "setups-registrations",
}) => {
  return (
    <CheckoutFlowProvider initialServiceId={serviceId} initialCategoryId={categoryId}>
      <CheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default CheckoutPage;
