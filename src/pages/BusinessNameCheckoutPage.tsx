import React from "react";
import { CheckoutFlowProvider, useCheckout } from "@/context/CheckoutFlowProvider";
import {
  BNPageHeader,
  BNStepper,
  BNOrderSummary,
  BNStepYourDetails,
  BNStepRegistrationTerm,
  BNStepPlanSelection,
  BNStepPayroll,
  BNStepReviewPay,
} from "@/components/checkout/business-name";

const BusinessNameCheckoutContent: React.FC = () => {
  const { currentStep, setStep, updateSelections, customer, selections } = useCheckout();

  const isSoleTrader = customer.businessStructure === "Sole Trader";
  const hasAccounting = selections.package === "registration_plus_accounting";

  // Determine which steps to show:
  // Sole Trader: always registration only → Details, Reg Term, Review & Pay
  // Other + registration_only: Details, Reg Term, Plan Selection, Review & Pay
  // Other + registration_plus_accounting: Details, Reg Term, Plan Selection, Payroll, Review & Pay

  const showPlanSelection = !isSoleTrader && selections.package !== "registration_only";
  const showPayroll = !isSoleTrader && hasAccounting;

  // Build ordered step definitions
  const stepDefs = React.useMemo(() => {
    const steps: { label: string; internalStep: number; component: React.FC }[] = [];
    let step = 1;
    steps.push({ label: "Your Details", internalStep: step++, component: BNStepYourDetails });
    steps.push({ label: "Registration Term", internalStep: step++, component: BNStepRegistrationTerm });
    if (showPlanSelection) {
      steps.push({ label: "Plan Selection", internalStep: step++, component: BNStepPlanSelection });
    }
    if (showPayroll) {
      steps.push({ label: "Payroll", internalStep: step++, component: BNStepPayroll });
    }
    steps.push({ label: "Review & Pay", internalStep: step++, component: BNStepReviewPay });
    return steps;
  }, [showPlanSelection, showPayroll]);

  // Ensure we start at step 1 and clear default registration term for this flow
  React.useEffect(() => {
    if (currentStep === 0) {
      setStep(1);
    }
    updateSelections({ registrationTerm: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStep = () => {
    const stepDef = stepDefs.find((s) => s.internalStep === currentStep);
    if (stepDef) {
      const Component = stepDef.component;
      return <Component />;
    }
    return <BNStepYourDetails />;
  };

  // Map visual step index to internal step
  const handleStepperClick = (visualStep: number) => {
    const mapped = stepDefs[visualStep - 1];
    if (mapped) setStep(mapped.internalStep);
  };

  // Map internal step to visual step for the stepper
  const visualCurrentStep = (() => {
    const idx = stepDefs.findIndex((s) => s.internalStep === currentStep);
    return idx >= 0 ? idx + 1 : 1;
  })();

  return (
    <div className="min-h-screen bg-background">
      <BNPageHeader />
      <BNStepper
        currentStep={visualCurrentStep}
        onStepClick={handleStepperClick}
        steps={stepDefs.map((s) => s.label)}
      />

      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="checkout-content-pad bg-card sm:rounded-xl sm:border sm:border-border p-4 sm:p-6 sm:shadow-sm">
              {renderStep()}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className={`lg:col-span-1 ${visualCurrentStep < stepDefs.length ? 'hidden lg:block' : ''}`}>
            <BNOrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessNameCheckoutPage: React.FC = () => {
  return (
    <CheckoutFlowProvider
      initialServiceId="business-name-registration"
      initialCategoryId="setups-registrations"
    >
      <BusinessNameCheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default BusinessNameCheckoutPage;
