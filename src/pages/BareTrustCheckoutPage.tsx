import React from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import {
  BTPageHeader,
  BTStepper,
  BTOrderSummary,
  BTStepQualification,
  BTStepProperty,
  BTStepSMSFDetails,
  BTStepTrustee,
  BTStepLoanInfo,
  BTStepDeclarations,
  BTStepPayment,
} from "@/components/checkout/bare-trust";
import { SummaryMobile } from "@/components/checkout/OrderSummary";
import { ClipboardCheck, Home, Building2, Landmark, TrendingUp, FileText, CreditCard } from "lucide-react";

const STEPS = [
  { label: "Qualification", icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: "Property", icon: <Home className="w-4 h-4" /> },
  { label: "SMSF Details", icon: <Building2 className="w-4 h-4" /> },
  { label: "Trustee", icon: <Landmark className="w-4 h-4" /> },
  { label: "Loan Info", icon: <TrendingUp className="w-4 h-4" /> },
  { label: "Declarations", icon: <FileText className="w-4 h-4" /> },
  { label: "Payment", icon: <CreditCard className="w-4 h-4" /> },
];

const BareTrustCheckoutContent: React.FC = () => {
  const { currentStep, setStep } = useCheckout();

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <BTStepQualification />;
      case 1: return <BTStepProperty />;
      case 2: return <BTStepSMSFDetails />;
      case 3: return <BTStepTrustee />;
      case 4: return <BTStepLoanInfo />;
      case 5: return <BTStepDeclarations />;
      case 6: return <BTStepPayment />;
      default: return <BTStepQualification />;
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
        <BTPageHeader />
      </div>

      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <BTStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderStep()}</div>
          <div className="hidden lg:block w-[340px] shrink-0">
            <BTOrderSummary />
          </div>
        </div>
      </main>

      <SummaryMobile />
    </div>
  );
};

export const BareTrustCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider initialServiceId="bare-trust-setup" initialCategoryId="setups-registrations">
      <BareTrustCheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default BareTrustCheckoutPage;
