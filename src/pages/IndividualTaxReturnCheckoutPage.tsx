import React from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import { ITRPageHeader } from "@/components/checkout/individual-tax/ITRPageHeader";
import { ITRStepper } from "@/components/checkout/individual-tax/ITRStepper";
import { ITROrderSummary } from "@/components/checkout/individual-tax/ITROrderSummary";
import { ITRStepYourDetails } from "@/components/checkout/individual-tax/ITRStepYourDetails";
import { ITRStepDeclaration } from "@/components/checkout/individual-tax/ITRStepDeclaration";
import { ITRStepPlanSelection } from "@/components/checkout/individual-tax/ITRStepPlanSelection";
import { HelpCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { calcIncomeStreamsTotal } from "@/components/checkout/individual-tax/ITRIncomeStreams";

const ITRCheckoutContent: React.FC = () => {
  const { currentStep, setStep, customer } = useCheckout();
  const [searchParams] = useSearchParams();

  // If no plan selected yet, show plan selection (step 0)
  const hasPlan = !!customer.itrPlan || !!searchParams.get("plan");

  // Plan initialization handled by wrapper component

  // Map internal steps
  const itrStep = (() => {
    if (currentStep === 0) return 0; // Plan Selection
    if (currentStep === 1) return 1; // Your Details
    return 2; // Declaration
  })();

  const renderStep = () => {
    if (itrStep === 0 && !hasPlan) return <ITRStepPlanSelection />;
    switch (itrStep) {
      case 0:
        return <ITRStepPlanSelection />;
      case 1:
        return <ITRStepYourDetails />;
      case 2:
        return <ITRStepDeclaration />;
      default:
        return <ITRStepPlanSelection />;
    }
  };

  const handleStepClick = (step: number) => {
    setStep(step);
  };

  // Show full layout with stepper & sidebar only when in checkout steps (1-3)
  const inCheckout = itrStep >= 1;

  if (!inCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <ITRStepPlanSelection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <ITRPageHeader />
      </div>

      {/* Stepper */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ITRStepper currentStep={itrStep} onStepClick={handleStepClick} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Step Content */}
          <div className="flex-1 min-w-0">{renderStep()}</div>

          {/* Right: Order Summary (Desktop) */}
          <div className={`w-[340px] shrink-0 ${itrStep < 2 ? 'hidden lg:block' : ''}`}>
            <ITROrderSummary />
          </div>
        </div>
      </main>

      {/* Mobile Summary Bar */}
      <ITRMobileSummary />
    </div>
  );
};

const ITR_PRICES: Record<string, number> = { essential: 99, premium: 149 };

const ITRMobileSummary: React.FC = () => {
  const { customer } = useCheckout();
  const plan = customer.itrPlan || "premium";
  const returnCount = (customer.itrReturnCount as number) || 1;
  const basePrice = (ITR_PRICES[plan] || 149) * returnCount;
  const strategicTaxPrice = customer.strategicTaxPlanning ? 150 : 0;
  const streamsTotal = calcIncomeStreamsTotal(customer);
  const total = basePrice + (customer.itrAbnPrice || 0) + (customer.itrBasTotal || 0) + strategicTaxPrice + streamsTotal;
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

const IndividualTaxReturnCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider initialServiceId="individual-tax-return" initialCategoryId="tax-services">
      <ITRCheckoutContentWrapper />
    </CheckoutFlowProvider>
  );
};

/** Wrapper that initializes plan from URL */
const ITRCheckoutContentWrapper: React.FC = () => {
  const { updateCustomer, customer, setStep } = useCheckout();
  const [searchParams] = useSearchParams();
  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const checkout = searchParams.get("checkout");
    const urlPlan = searchParams.get("plan");
    const urlCount = searchParams.get("count");
    if (checkout === "1" && urlPlan && (urlPlan === "essential" || urlPlan === "premium")) {
      updateCustomer({
        itrPlan: urlPlan,
        itrReturnCount: urlCount ? parseInt(urlCount, 10) || 1 : 1,
      });
      setStep(1);
    }
  }, []);

  return <ITRCheckoutContent />;
};

export default IndividualTaxReturnCheckoutPage;
