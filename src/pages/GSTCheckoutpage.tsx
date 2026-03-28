
import React, { useEffect, useMemo, useState } from "react";
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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/config/pricing.config";
import {
  ADDON_PRICES,
  BUSINESS_NAME_TERMS,
  BusinessNameTerm,
  getBusinessNamePrice,
} from "@/components/checkout/abn/pricing";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { validateEmail, validatePhone, validateABN } from "@/utils/validation";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

interface StepDef {
  key: string;
  label: string;
  component: React.FC;
}

/** Replicates GSTStepYourDetails validation */
function useGSTStep1Valid() {
  const { customer } = useCheckout();
  return useMemo(() => {
    if (!customer.businessStructure) return false;
    const required = [
      "businessStructure", "firstName", "lastName", "phone", "email",
      "street", "suburb", "state", "postcode", "abn",
      "gstStartDate", "lodgementCycle", "accountingBasis", "gstTurnover",
      "idProof", "signature", "declarationAccepted",
    ];
    if (customer.businessStructure === "company") required.push("businessName");
    for (const key of required) {
      const value = customer[key];
      if (!value) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (typeof value === "boolean" && !value) return false;
    }
    if (validateEmail(customer.email || "")) return false;
    if (validatePhone(customer.phone || "")) return false;
    if (validateABN(customer.abn || "")) return false;
    return true;
  }, [customer]);
}

const GSTCheckoutContent: React.FC = () => {
  const { currentStep, setStep, nextStep, prevStep, selections, updateSelections, customer } = useCheckout();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { packages } = usePricingPackages();
  const step1Valid = useGSTStep1Valid();

  // Auto-select package from query param
  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg && !selections.package) {
      updateSelections({ package: pkg });
    }
  }, [searchParams]);

  const hasSelectedPackage = selections.package !== "";

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

  // Calculate total for mobile submit button
  const gstBasePrice = packages.gst?.foundation?.price ?? 0;
  const { total } = useMemo(() => {
    const items: { name: string; price: number }[] = [];
    items.push({ name: "GST Registration", price: gstBasePrice });
    const addons: string[] = customer.selectedAddons || [];
    if (addons.includes("business_name")) {
      const term = (customer.businessNameTerm || "1yr") as BusinessNameTerm;
      items.push({ name: "Business Name", price: getBusinessNamePrice(term) });
    }
    if (addons.includes("registered_office")) {
      items.push({ name: "Registered Office", price: ADDON_PRICES.registered_office });
    }
    const sub = items.reduce((s, i) => s + i.price, 0);
    const bnAddon = addons.includes("business_name");
    const bnTerm = (customer.businessNameTerm || "1yr") as BusinessNameTerm;
    const bnAsicFee = bnAddon ? (BUSINESS_NAME_TERMS[bnTerm]?.asicFee ?? 44) : 0;
    const gstAmount = Math.round((sub - bnAsicFee) * 0.1);
    return { total: sub + gstAmount };
  }, [customer, gstBasePrice]);

  // Mobile nav
  const isContinueDisabled = safeStep === 1 ? !step1Valid : false;

  const handleMobileContinue = async () => {
    if (safeStep === stepDefs.length) {
      // Submit on last step
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const { submitCheckout } = await import("@/utils/submitCheckout");
        await submitCheckout({
          serviceKey: "gst",
          customer: { ...customer },
          selections: { ...selections },
          pricing: { total },
        });
      } catch {
        setIsSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  const mobileButtonText = safeStep === stepDefs.length
    ? `Complete & Pay ${formatCurrency(total)}`
    : "Continue";

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
      <CheckoutLoader visible={isSubmitting} />

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
      <main className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 pb-28 md:pb-8 checkout-content-pad">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <ActiveComponent />
          </div>
          <div className={`w-full lg:w-[340px] shrink-0 ${safeStep < stepDefs.length ? 'hidden lg:block' : ''}`}>
            <GSTOrderSummary />
          </div>
        </div>
      </main>

      {/* Unified Mobile Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          {safeStep > 1 && (
            <button
              onClick={prevStep}
              className="h-12 px-5 rounded-2xl font-medium text-sm bg-card text-foreground border border-border hover:bg-secondary active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          <button
            onClick={handleMobileContinue}
            disabled={isContinueDisabled || isSubmitting}
            className="flex-1 h-12 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(180deg, hsl(24, 95%, 55%) 0%, hsl(24, 95%, 50%) 100%)",
            }}
          >
            {mobileButtonText}
            {safeStep < stepDefs.length && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
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
