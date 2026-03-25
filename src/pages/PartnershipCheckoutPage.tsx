import React from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import {
  PRPageHeader,
  PRStepper,
  PRStepBasics,
  PRStepPartners,
  PRStepTaxSetup,
  PRStepAddons,
  PRStepContact,
  PRStepReviewPay,
  PROrderSummary,
} from "@/components/checkout/partnership";
import { SummaryMobile } from "@/components/checkout/OrderSummary";
import { Briefcase, Users, FileText, Star, UserCheck, CreditCard } from "lucide-react";

const STEPS = [
  { label: "Basics", icon: <Briefcase className="w-4 h-4" /> },
  { label: "Partners", icon: <Users className="w-4 h-4" /> },
  { label: "Tax Setup", icon: <FileText className="w-4 h-4" /> },
  { label: "Add-ons", icon: <Star className="w-4 h-4" /> },
  { label: "Contact", icon: <UserCheck className="w-4 h-4" /> },
  { label: "Review & Pay", icon: <CreditCard className="w-4 h-4" /> },
];

const PartnershipCheckoutContent: React.FC = () => {
  const { currentStep, setStep } = useCheckout();

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <PRStepBasics />;
      case 1: return <PRStepPartners />;
      case 2: return <PRStepTaxSetup />;
      case 3: return <PRStepAddons />;
      case 4: return <PRStepContact />;
      case 5: return <PRStepReviewPay />;
      default: return <PRStepBasics />;
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setStep(stepIndex);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <PRPageHeader />
      </div>

      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <PRStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderStep()}</div>
          <div className={`w-[340px] shrink-0 ${currentStep < 5 ? 'hidden lg:block' : ''}`}>
            <PROrderSummary />
          </div>
        </div>
      </main>

      <SummaryMobile />
    </div>
  );
};

export const PartnershipCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider initialServiceId="partnership-registration" initialCategoryId="setups-registrations">
      <PartnershipCheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default PartnershipCheckoutPage;
