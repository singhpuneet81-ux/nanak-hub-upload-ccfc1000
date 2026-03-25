import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import {
  CRPageHeader,
  CRStepper,
  CROrderSummary,
  CRStepCompanyDetails,
  CRStepDirectors,
  CRStepShareholders,
  CRStepAddons,
  CRStepPackage,
  CRStepReviewPay,
} from "@/components/checkout/company";

const CompanyRegistrationContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { updateCustomer } = useCheckout();
  const initialStep = Math.min(Math.max(Number(searchParams.get("step")) || 1, 1), 6);
  const [step, setStep] = useState(initialStep);

  // Pre-select package from URL param
  React.useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg === "registration_only" || pkg === "registration_plus_accounting") {
      updateCustomer({ crPackage: pkg });
    }
  }, []);

  const goNext = () => {
    setStep((s) => Math.min(s + 1, 6));
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
      case 1: return <CRStepCompanyDetails onNext={goNext} />;
      case 2: return <CRStepDirectors onNext={goNext} onBack={goBack} />;
      case 3: return <CRStepShareholders onNext={goNext} onBack={goBack} />;
      case 4: return <CRStepAddons onNext={goNext} onBack={goBack} />;
      case 5: return <CRStepPackage onNext={goNext} onBack={goBack} />;
      case 6: return <CRStepReviewPay onBack={goBack} onGoToStep={goToStep} />;
      default: return <CRStepCompanyDetails onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CRPageHeader />
      <CRStepper currentStep={step} onStepClick={goToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>
          <div className={`w-full lg:w-[380px] ${step < 6 ? 'hidden lg:block' : ''}`}>
            <CROrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompanyRegistrationCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider>
      <CompanyRegistrationContent />
    </CheckoutFlowProvider>
  );
};
