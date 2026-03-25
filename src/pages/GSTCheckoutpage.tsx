
import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckoutFlowProvider,
  useCheckout,
} from "@/context/CheckoutFlowProvider";

import { GSTPageHeader } from "@/components/checkout/gst/GSTPageHeader";
import { GSTStepper } from "@/components/checkout/gst/GSTStepper";
import { GSTOrderSummary } from "@/components/checkout/gst/GSTOrderSummary";
import { GSTStepPricing } from "@/components/checkout/gst/GSTStepPricing";
import { GSTStepPackage } from "@/components/checkout/gst/GSTStepPackage";
import { GSTStepAddons } from "@/components/checkout/gst/GSTStepAddons";
import { GSTStepReviewPay } from "@/components/checkout/gst/GSTStepReviewPay";
import { GSTStepYourDetails } from "@/components/checkout/gst/GSTStepYourDetails";
import { SummaryMobile } from "@/components/checkout/OrderSummary";

interface StepDef {
  key: string;
  label: string;
  component: React.FC;
}

const GSTCheckoutContent: React.FC = () => {
  const { currentStep, setStep, selections, updateSelections, customer } = useCheckout();
  const [searchParams] = useSearchParams();

  // Auto-select package from query param
  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg && !selections.package) {
      updateSelections({ package: pkg });
    }
  }, [searchParams]);

  const hasSelectedPackage = selections.package !== "";
  const isSoleTrader = customer.businessStructure === "sole_trader";

  // Dynamic steps based on entity type
  const stepDefs = useMemo<StepDef[]>(() => {
    const steps: StepDef[] = [
      { key: "details", label: "Your Details", component: GSTStepYourDetails },
      { key: "addons", label: "Add-Ons", component: GSTStepAddons },
      { key: "review", label: "Review & Pay", component: GSTStepReviewPay },
    ];

    return steps;
  }, []);

  // Clamp currentStep to valid range
  const maxStep = stepDefs.length;
  const safeStep = Math.max(1, Math.min(currentStep, maxStep));

  const activeStepDef = stepDefs[safeStep - 1];
  const ActiveComponent = activeStepDef?.component || GSTStepYourDetails;

  const handleStepClick = (step: number) => {
    if (step < safeStep) setStep(step);
  };

  // Build stepper steps for display
  const stepperSteps = stepDefs.map((s) => s.label);

  if (!hasSelectedPackage) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <GSTStepPricing />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <GSTPageHeader />
      </div>

      {/* Stepper */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <GSTStepper
            currentStep={safeStep}
            onStepClick={handleStepClick}
            steps={stepperSteps}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 lg:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <ActiveComponent />
          </div>
          <div className={`w-[340px] shrink-0 ${safeStep < stepDefs.length ? 'hidden lg:block' : ''}`}>
            <GSTOrderSummary />
          </div>
        </div>
      </main>

      <SummaryMobile />
    </div>
  );
};

interface GSTCheckoutPageProps {
  serviceId?: string;
  categoryId?: string;
}

export const GSTCheckoutPage: React.FC<GSTCheckoutPageProps> = ({
  serviceId = "gst-registration",
  categoryId = "setups-registrations",
}) => {
  return (
    <CheckoutFlowProvider
      initialServiceId={serviceId}
      initialCategoryId={categoryId}
    >
      <GSTCheckoutContent />
    </CheckoutFlowProvider>
  );
};

export default GSTCheckoutPage;
