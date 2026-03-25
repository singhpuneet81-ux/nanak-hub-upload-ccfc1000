import React from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import { ITRPageHeader } from "@/components/checkout/individual-tax/ITRPageHeader";
import { STRStepper } from "@/components/checkout/sole-trader/STRStepper";
import { STROrderSummary } from "@/components/checkout/sole-trader/STROrderSummary";
import { STRStepYourDetails } from "@/components/checkout/sole-trader/STRStepYourDetails";
import { STRStepDeclaration } from "@/components/checkout/sole-trader/STRStepDeclaration";
import { STRStepPlanSelection } from "@/components/checkout/sole-trader/STRStepPlanSelection";
import { HelpCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const STRCheckoutContent: React.FC = () => {
  const { currentStep, setStep, customer } = useCheckout();
  const [searchParams] = useSearchParams();

  const hasPlan = !!customer.strPlan || !!searchParams.get("plan");

  // Step 0 = plan selection, step 1 = your details, step 2 = declaration
  const strStep = currentStep;

  const renderStep = () => {
    if (strStep === 0 && !hasPlan) return <STRStepPlanSelection />;
    switch (strStep) {
      case 0:
        return <STRStepPlanSelection />;
      case 1:
        return <STRStepYourDetails />;
      case 2:
        return <STRStepDeclaration />;
      default:
        return <STRStepPlanSelection />;
    }
  };

  const handleStepClick = (step: number) => {
    setStep(step);
  };

  const inCheckout = strStep >= 1;

  if (!inCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <STRStepPlanSelection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <ITRPageHeader
          title="Sole Trader Tax Return"
          subtitle="Expert tax returns for sole traders and self-employed professionals"
        />
      </div>

      {/* Stepper */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <STRStepper currentStep={strStep} onStepClick={handleStepClick} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderStep()}</div>
          <div className={`w-[340px] shrink-0 ${strStep < 2 ? 'hidden lg:block' : ''}`}>
            <STROrderSummary />
          </div>
        </div>
      </main>

      <STRMobileSummary />
    </div>
  );
};

const STR_PRICES: Record<string, number> = { essential: 120, premium: 170 };

const STRMobileSummary: React.FC = () => {
  const { customer, currentStep, setStep } = useCheckout();
  const plan = customer.strPlan || "premium";
  const price = (plan === "essential" ? customer.strEssentialPrice : customer.strPremiumPrice) || STR_PRICES[plan] || 149;
  const isLastStep = currentStep === 2;

  const handleProceed = () => {
    if (!isLastStep) {
      setStep(currentStep + 1);
    }
  };

  return (
    <div className="checkout-mobile-summary lg:hidden">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="shrink-0">
          <p className="text-sm text-muted-foreground">Total (inc GST)</p>
          <p className="text-xl font-bold text-[hsl(var(--cta))]">${price}</p>
        </div>
        {!isLastStep && (
          <button
            onClick={handleProceed}
            className="flex-1 max-w-[220px] h-12 rounded-xl bg-[hsl(var(--cta))] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Proceed to Checkout →
          </button>
        )}
      </div>
    </div>
  );
};

const SoleTraderCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider initialServiceId="sole-trader-tax-return" initialCategoryId="tax-services">
      <STRCheckoutContentWrapper />
    </CheckoutFlowProvider>
  );
};

const STRCheckoutContentWrapper: React.FC = () => {
  const { updateCustomer, setStep } = useCheckout();
  const [searchParams] = useSearchParams();
  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const urlPlan = searchParams.get("plan");
    if (urlPlan && (urlPlan === "essential" || urlPlan === "premium")) {
      updateCustomer({ strPlan: urlPlan });
      setStep(1);
    }
  }, []);

  return <STRCheckoutContent />;
};

export default SoleTraderCheckoutPage;
