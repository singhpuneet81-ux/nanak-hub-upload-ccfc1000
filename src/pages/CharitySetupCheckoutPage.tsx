import React, { useState, useEffect, useMemo } from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import { formatCurrency } from "@/config/pricing.config";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { SummaryMobile } from "@/components/checkout/OrderSummary";
import { useSearchParams } from "react-router-dom";
import {
  CSPageHeader,
  CSStepper,
  CSOrderSummary,
  CSStepChooseStructure,
  CSStepCharityDetails,
  CSStepRegisteredAddress,
  CSStepTrustees,
  CSStepContactPayment,
} from "@/components/checkout/charity-setup";
import {
  CLGPageHeader,
  CLGStepper,
  CLGOrderSummary,
  CLGStepCompanyDetails,
  CLGStepRegisteredAddress as CLGStepAddress,
  CLGStepDirectors,
  CLGStepMembers,
  CLGStepAdditionalDetails,
  CLGStepReviewPay,
} from "@/components/checkout/charity-setup/clg";
import {
  IAPageHeader,
  IAStepper,
  IAOrderSummary,
  IAStepAssociationDetails,
  IAStepRegisteredAddress as IAStepAddress,
  IAStepPrimaryContact,
  IAStepCommitteeMembers,
  IAStepRegistrationDetails,
  IAStepReviewPay,
} from "@/components/checkout/charity-setup/ia";

/** Sub-flow for Company Limited by Guarantee (6 steps) */
const CLGFlow: React.FC<{ onBackToStructure: () => void }> = ({ onBackToStructure }) => {
  const [step, setStep] = useState(1);

  const goNext = () => {
    setStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    if (step === 1) {
      onBackToStructure();
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goToStep = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <CLGStepCompanyDetails onNext={goNext} />;
      case 2: return <CLGStepAddress onNext={goNext} onBack={goBack} />;
      case 3: return <CLGStepDirectors onNext={goNext} onBack={goBack} />;
      case 4: return <CLGStepMembers onNext={goNext} onBack={goBack} />;
      case 5: return <CLGStepAdditionalDetails onNext={goNext} onBack={goBack} />;
      case 6: return <CLGStepReviewPay onBack={goBack} />;
      default: return <CLGStepCompanyDetails onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <CLGPageHeader />
      </div>

      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <CLGStepper currentStep={step} onStepClick={goToStep} />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderStep()}</div>
          <div className={`w-[340px] shrink-0 ${step < 6 ? 'hidden lg:block' : ''}`}>
            <CLGOrderSummary />
          </div>
        </div>
      </main>

      <SummaryMobile />
    </div>
  );
};

/** Sub-flow for Incorporated Association (6 steps) */
const IAFlow: React.FC<{ onBackToStructure: () => void }> = ({ onBackToStructure }) => {
  const [step, setStep] = useState(1);

  const goNext = () => {
    setStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    if (step === 1) {
      onBackToStructure();
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goToStep = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <IAStepAssociationDetails onNext={goNext} />;
      case 2: return <IAStepAddress onNext={goNext} onBack={goBack} />;
      case 3: return <IAStepPrimaryContact onNext={goNext} onBack={goBack} />;
      case 4: return <IAStepCommitteeMembers onNext={goNext} onBack={goBack} />;
      case 5: return <IAStepRegistrationDetails onNext={goNext} onBack={goBack} />;
      case 6: return <IAStepReviewPay onBack={goBack} />;
      default: return <IAStepAssociationDetails onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <IAPageHeader />
      <IAStepper currentStep={step} onStepClick={goToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>
          <div className={`w-full lg:w-[380px] ${step < 6 ? 'hidden lg:block' : ''}`}>
            <IAOrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Main content with structure selection → sub-flow routing */
const CharitySetupCheckoutContent: React.FC = () => {
  const { customer } = useCheckout();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCLGFlow, setShowCLGFlow] = useState(false);
  const [showIAFlow, setShowIAFlow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { packages } = usePricingPackages();

  useEffect(() => {
    const structure = searchParams.get("structure");
    if (structure === "clg") setShowCLGFlow(true);
    if (structure === "ia") setShowIAFlow(true);
  }, []);

  const charityStructure = customer?.charityStructure as string | undefined;

  const CHARITY_STRUCTURES: Record<string, { name: string; price: number }> = {
    incorporated_association: { name: "Incorporated Association", price: packages.charity_ia?.foundation?.price ?? 0 },
    company_limited_guarantee: { name: "Company Limited by Guarantee", price: packages.charity_clg?.foundation?.price ?? 0 },
    charitable_trust: { name: "Charitable Trust", price: packages.charity?.foundation?.price ?? 0 },
  };

  const total = charityStructure ? (CHARITY_STRUCTURES[charityStructure]?.price || 0) : 0;
  const isContinueDisabled = currentStep === 1 ? !charityStructure : false;

  const handleNext = () => {
    if (currentStep === 1) {
      if (customer?.charityStructure === "company_limited_guarantee") {
        setShowCLGFlow(true);
        return;
      }
      if (customer?.charityStructure === "incorporated_association") {
        setShowIAFlow(true);
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
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

  const handleMobileContinue = () => {
    handleNext();
  };

  const mobileButtonText = currentStep === 5
    ? `Complete & Pay ${total > 0 ? formatCurrency(total) : ""}`
    : "Continue";

  if (showCLGFlow) {
    return (
      <CLGFlow
        onBackToStructure={() => {
          setShowCLGFlow(false);
          setCurrentStep(1);
        }}
      />
    );
  }

  if (showIAFlow) {
    return (
      <IAFlow
        onBackToStructure={() => {
          setShowIAFlow(false);
          setCurrentStep(1);
        }}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CSStepChooseStructure onNext={handleNext} />;
      case 2:
        return <CSStepCharityDetails onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <CSStepRegisteredAddress onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <CSStepTrustees onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <CSStepContactPayment onBack={handleBack} />;
      default:
        return <CSStepChooseStructure onNext={handleNext} />;
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <CSPageHeader />
      <CSStepper currentStep={currentStep} onStepClick={handleGoToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>
          <div className={`w-full lg:w-[380px] ${currentStep < 5 ? 'hidden lg:block' : ''}`}>
            <CSOrderSummary />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav Bar */}
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
            onClick={handleMobileContinue}
            disabled={isContinueDisabled}
            className="flex-1 h-12 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(180deg, hsl(24, 95%, 55%) 0%, hsl(24, 95%, 50%) 100%)",
            }}
          >
            {mobileButtonText}
            {currentStep < 5 && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CharitySetupCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider>
      <CharitySetupCheckoutContent />
    </CheckoutFlowProvider>
  );
};
