import { useServiceResolver } from "@/hooks/useServiceResolver";
import { useCheckoutState } from "@/hooks/useCheckoutState";
import Stepper from "./Stepper";
import StepDetails from "./StepDetails";
import StepPackages from "./StepPackages";
import StepReview from "./StepReview";

const STEPS = [
  { label: "Your Details", description: "Personal information" },
  { label: "Package", description: "Choose your plan" },
  { label: "Review & Pay", description: "Confirm and submit" },
];

const CheckoutEngine = () => {
  const serviceKey = useServiceResolver();
  const {
    state,
    config,
    pricingSummary,
    setFormField,
    setPackageType,
    setAccountingPackage,
    toggleAddOn,
    nextStep,
    prevStep,
  } = useCheckoutState(serviceKey);

  const handleSubmit = async () => {
    const { submitCheckout } = await import("@/utils/submitCheckout");
    await submitCheckout({
      serviceKey,
      customer: state.formData,
      selections: {
        packageType: state.selectedPackageType,
        accountingPackage: state.selectedAccountingPackage,
        addOns: state.selectedAddOns,
      },
      pricing: pricingSummary,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Service Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          {config.displayName}
        </h1>
        <p className="text-muted-foreground mt-1">{config.description}</p>
      </div>

      <Stepper currentStep={state.currentStep} steps={STEPS} />

      {state.currentStep === 1 && (
        <StepDetails
          config={config}
          formData={state.formData}
          onFieldChange={setFormField}
          onNext={nextStep}
        />
      )}

      {state.currentStep === 2 && (
        <StepPackages
          config={config}
          selectedPackageType={state.selectedPackageType}
          selectedAccountingPackage={state.selectedAccountingPackage}
          selectedAddOns={state.selectedAddOns}
          onPackageTypeChange={setPackageType}
          onAccountingPackageChange={setAccountingPackage}
          onToggleAddOn={toggleAddOn}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {state.currentStep === 3 && (
        <StepReview
          config={config}
          state={state}
          pricingSummary={pricingSummary}
          onPrev={prevStep}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default CheckoutEngine;
