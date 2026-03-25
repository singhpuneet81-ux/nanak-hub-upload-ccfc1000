import React from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import { ITRPageHeader } from "@/components/checkout/individual-tax/ITRPageHeader";
import { BDLStepPackageBuilder } from "@/components/checkout/bundle/BDLStepPackageBuilder";
import { BDLStepYourDetails } from "@/components/checkout/bundle/BDLStepYourDetails";
import { BDLStepDeclaration } from "@/components/checkout/bundle/BDLStepDeclaration";
import { BDLStepper } from "@/components/checkout/bundle/BDLStepper";
import { BDLOrderSummary } from "@/components/checkout/bundle/BDLOrderSummary";
import { HelpCircle } from "lucide-react";

const BDLCheckoutContent: React.FC = () => {
  const { currentStep, setStep } = useCheckout();

  if (currentStep === 0) {
    return <BDLStepPackageBuilder />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <BDLStepYourDetails />;
      case 2: return <BDLStepDeclaration />;
      default: return <BDLStepYourDetails />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <ITRPageHeader
          title="Bundle Tax Return"
          subtitle="Discounted tax returns across multiple income streams"
        />
      </div>

      {/* Stepper */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <BDLStepper currentStep={currentStep} onStepClick={(s) => setStep(s)} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderStep()}</div>
          <div className={`w-[340px] shrink-0 ${currentStep < 2 ? 'hidden lg:block' : ''}`}>
            <BDLOrderSummary />
          </div>
        </div>
      </main>

      <BDLMobileSummary />
    </div>
  );
};

const BDLMobileSummary: React.FC = () => {
  const { customer } = useCheckout();
  const total = customer.bdlTotal || 0;
  return (
    <div className="checkout-mobile-summary lg:hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <p className="text-sm text-muted-foreground">Total (inc GST)</p>
          <p className="text-xl font-bold text-foreground">${total}</p>
        </div>
        <button className="btn-help px-4 w-auto">
          <HelpCircle size={16} />
          Help
        </button>
      </div>
    </div>
  );
};

const BundleCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider initialServiceId="bundled-tax-return" initialCategoryId="tax-services">
      <BDLCheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default BundleCheckoutPage;
