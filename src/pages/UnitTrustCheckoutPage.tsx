import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UTPageHeader,
  UTStepper,
  UTOrderSummary,
  UTStepTrustDetails,
  UTStepUnitholders,
  UTStepTrustee,
  UTStepAddons,
  UTStepPackage,
  UTStepPayment,
} from "@/components/checkout/unit-trust";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";

const UnitTrustCheckoutPageContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStep = Math.min(Math.max(Number(searchParams.get("step")) || 1, 1), 6);
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    goToStep(currentStep + 1);
  };

  const handleBack = () => {
    goToStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <UTStepTrustDetails onNext={handleNext} />;
      case 2:
        return <UTStepUnitholders onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <UTStepTrustee onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <UTStepAddons onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <UTStepPackage onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <UTStepPayment onBack={handleBack} goToStep={goToStep} />;
      default:
        return <UTStepTrustDetails onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UTPageHeader />
      <UTStepper currentStep={currentStep} onStepClick={goToStep} />

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 checkout-content-pad">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="checkout-content-pad bg-card sm:rounded-xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className={`lg:col-span-1 ${currentStep < 6 ? 'hidden lg:block' : ''}`}>
            <UTOrderSummary showAccountingDetails={currentStep >= 5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const UnitTrustCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider>
      <UnitTrustCheckoutPageContent />
    </CheckoutFlowProvider>
  );
};

export default UnitTrustCheckoutPage;
