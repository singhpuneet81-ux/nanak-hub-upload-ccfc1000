import React, { useState } from "react";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";
import { SMAPageHeader, SMAStepper, SMAOrderSummary, SMAStepPackage, SMAStepAddons, SMAStepDetails, SMAStepTaxAgent, SMAStepPayment } from "@/components/checkout/smsf-accounting";

const SMSFAccountingContent: React.FC = () => {
  const [step, setStep] = useState(1);
  const goNext = () => { setStep((s) => Math.min(s + 1, 5)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goBack = () => { setStep((s) => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goToStep = (s: number) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const renderStep = () => {
    switch (step) {
      case 1: return <SMAStepPackage onNext={goNext} />;
      case 2: return <SMAStepAddons onNext={goNext} onBack={goBack} />;
      case 3: return <SMAStepDetails onNext={goNext} onBack={goBack} />;
      case 4: return <SMAStepTaxAgent onNext={goNext} onBack={goBack} />;
      case 5: return <SMAStepPayment onBack={goBack} />;
      default: return <SMAStepPackage onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SMAPageHeader />
      <SMAStepper currentStep={step} onStepClick={goToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1"><div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">{renderStep()}</div></div>
          <div className={`w-full lg:w-[380px] ${step < 5 ? 'hidden lg:block' : ''}`}><SMAOrderSummary /></div>
        </div>
      </div>
    </div>
  );
};

export const SMSFAccountingCheckoutPage: React.FC = () => (<CheckoutFlowProvider><SMSFAccountingContent /></CheckoutFlowProvider>);
export default SMSFAccountingCheckoutPage;
