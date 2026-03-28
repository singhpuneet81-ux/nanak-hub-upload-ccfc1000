import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  FTPageHeader,
  FTStepper,
  FTOrderSummary,
  FTStepTrustDetails,
  FTStepAppointorBeneficiaries,
  FTStepDirectorsShareholders,
  FTStepAddons,
  FTStepPackage,
  FTStepReviewPay,
} from "@/components/checkout/family-trust";

const FamilyTrustCheckoutContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStep = Math.min(Math.max(Number(searchParams.get("step")) || 1, 1), 6);
  const [currentStep, setCurrentStep] = useState(initialStep);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FTStepTrustDetails onNext={handleNext} />;
      case 2:
        return <FTStepAppointorBeneficiaries onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <FTStepDirectorsShareholders onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <FTStepAddons onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <FTStepPackage onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <FTStepReviewPay onBack={handleBack} />;
      default:
        return <FTStepTrustDetails onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FTPageHeader />
      <FTStepper currentStep={currentStep} onStepClick={handleGoToStep} />

      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8 pb-28 md:pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className={`w-full lg:w-[380px] ${currentStep < 6 ? 'hidden lg:block' : ''}`}>
            <FTOrderSummary />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="h-12 px-5 rounded-2xl font-medium text-sm bg-card text-foreground border border-border hover:bg-secondary active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          <button
            onClick={currentStep < 6 ? handleNext : undefined}
            className="flex-1 h-12 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200"
            style={{
              background: "linear-gradient(180deg, hsl(24, 95%, 55%) 0%, hsl(24, 95%, 50%) 100%)",
            }}
          >
            {currentStep < 6 ? "Continue" : "Complete & Pay"}
            {currentStep < 6 && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const FamilyTrustCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider>
      <FamilyTrustCheckoutContent />
    </CheckoutFlowProvider>
  );
};
