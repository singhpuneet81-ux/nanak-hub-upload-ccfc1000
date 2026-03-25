import React, { useMemo } from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import {
  SMSFPageHeader,
  SMSFStepper,
  SMSFStepSetup,
  SMSFStepMember,
  SMSFStepAddons,
  SMSFStepReviewPay,
  SMSFOrderSummary,
} from "@/components/checkout/smsf";
import { SummaryMobile } from "@/components/checkout/OrderSummary";
import { CircleDot, User, Star, Lock } from "lucide-react";

const SMSFCheckoutContent: React.FC = () => {
  const { currentStep, setStep, customer } = useCheckout();
  const memberCount = customer.smsfMemberCount || 1;

  // Dynamic steps based on member count
  const steps = useMemo(() => {
    const s = [
      { label: "SMSF Setup", icon: <CircleDot className="w-4 h-4" /> },
    ];
    for (let i = 0; i < memberCount; i++) {
      s.push({ label: `Member ${i + 1}`, icon: <User className="w-4 h-4" /> });
    }
    s.push({ label: "Add-ons", icon: <Star className="w-4 h-4" /> });
    s.push({ label: "Review & Pay", icon: <Lock className="w-4 h-4" /> });
    return s;
  }, [memberCount]);

  const totalSteps = steps.length; // setup + N members + addons + review
  const addonsStepIndex = 1 + memberCount; // after all member steps
  const reviewStepIndex = addonsStepIndex + 1;

  const renderStep = () => {
    if (currentStep === 0) {
      return <SMSFStepSetup />;
    }
    if (currentStep >= 1 && currentStep <= memberCount) {
      const memberIndex = currentStep - 1;
      return (
        <SMSFStepMember
          key={memberIndex}
          memberIndex={memberIndex}
          onNext={() => setStep(currentStep + 1)}
          onBack={() => setStep(currentStep - 1)}
        />
      );
    }
    if (currentStep === addonsStepIndex) {
      return <SMSFStepAddons />;
    }
    return <SMSFStepReviewPay />;
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setStep(stepIndex);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <SMSFPageHeader />
      </div>

      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <SMSFStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderStep()}</div>
          <div className={`w-[340px] shrink-0 ${currentStep < reviewStepIndex ? 'hidden lg:block' : ''}`}>
            <SMSFOrderSummary />
          </div>
        </div>
      </main>

      <SummaryMobile />
    </div>
  );
};

export const SMSFCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider initialServiceId="smsf-setup" initialCategoryId="setups-registrations">
      <SMSFCheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default SMSFCheckoutPage;
