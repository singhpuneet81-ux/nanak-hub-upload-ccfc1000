import React, { useState } from "react";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";
import {
  ASICPageHeader,
  ASICStepper,
  ASICOrderSummary,
  ASICStepCompanyDetails,
  ASICStepPackageSelection,
  ASICStepAddons,
  ASICStepReviewComplete,
} from "@/components/checkout/asic-agent";

const ASICAgentContent: React.FC = () => {
  const [step, setStep] = useState(1);

  const goNext = () => {
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goToStep = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <ASICStepCompanyDetails onNext={goNext} />;
      case 2: return <ASICStepPackageSelection onNext={goNext} onBack={goBack} />;
      case 3: return <ASICStepAddons onNext={goNext} onBack={goBack} />;
      case 4: return <ASICStepReviewComplete onBack={goBack} />;
      default: return <ASICStepCompanyDetails onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ASICStepper currentStep={step} onStepClick={goToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8 pb-32 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div className="px-4 sm:px-0">
              <ASICPageHeader />
            </div>
            <div className="bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>
          <div className={`w-full lg:w-[380px] shrink-0 ${step < 4 ? 'hidden lg:block' : ''}`}>
            <ASICOrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ASICAgentCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider>
      <ASICAgentContent />
    </CheckoutFlowProvider>
  );
};

export default ASICAgentCheckoutPage;
