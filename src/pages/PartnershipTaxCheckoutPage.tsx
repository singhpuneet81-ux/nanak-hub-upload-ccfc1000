import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";
import { AccountingPricingLanding } from "@/components/checkout/shared/AccountingPricingLanding";
import { PTPageHeader, PTStepper, PTOrderSummary, PTStepPackage, PTStepAddons, PTStepDetails, PTStepTaxAgent, PTStepPayment } from "@/components/checkout/partnership-tax";

const PartnershipTaxContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const startAtCheckout = searchParams.get("checkout") === "1";
  const [step, setStep] = useState(startAtCheckout ? 1 : 0);
  const goNext = () => { setStep((s) => Math.min(s + 1, 5)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goBack = () => { setStep((s) => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goToStep = (s: number) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (step === 0) {
    return <AccountingPricingLanding serviceKey="partnership_tax" checkoutUrl="/partnership-tax" />;
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <PTStepPackage onNext={goNext} />;
      case 2: return <PTStepAddons onNext={goNext} onBack={goBack} />;
      case 3: return <PTStepDetails onNext={goNext} onBack={goBack} />;
      case 4: return <PTStepTaxAgent onNext={goNext} onBack={goBack} />;
      case 5: return <PTStepPayment onBack={goBack} />;
      default: return <PTStepPackage onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PTPageHeader />
      <PTStepper currentStep={step} onStepClick={goToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1"><div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">{renderStep()}</div></div>
          <div className={`w-full lg:w-[380px] ${step < 5 ? 'hidden lg:block' : ''}`}><PTOrderSummary /></div>
        </div>
      </div>
    </div>
  );
};

export const PartnershipTaxCheckoutPage: React.FC = () => (<CheckoutFlowProvider><PartnershipTaxContent /></CheckoutFlowProvider>);
export default PartnershipTaxCheckoutPage;
