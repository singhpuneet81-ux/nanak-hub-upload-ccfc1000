import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";
import {
  PRPageHeader,
  PRStepper,
  PROrderSummary,
  PRStepPackage,
  PRStepAddons,
  PRStepBusinessDetails,
  PRStepTaxAgent,
  PRStepPayment,
} from "@/components/checkout/payroll-services";
import { PRPricingLanding } from "@/components/checkout/payroll-services/PRPricingLanding";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { calculatePRPrice, PR_TIERS } from "@/components/checkout/payroll-services/prPricing";


const PayrollServicesContent: React.FC = () => {
  const [step, setStep] = useState(1);
  const [searchParams] = useSearchParams();
  const { updateCustomer } = useCheckout();

  // Pre-select tier from URL param
  useEffect(() => {
    const tierParam = searchParams.get("tier");
    if (tierParam !== null) {
      const idx = parseInt(tierParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx <= 2) {
        const tier = PR_TIERS[idx];
        if (tier) updateCustomer({ prTierIdx: idx, prTier: tier.name });
      }
    }
  }, []);

  const goNext = () => { setStep((s) => Math.min(s + 1, 5)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goBack = () => { setStep((s) => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goToStep = (s: number) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const renderStep = () => {
    switch (step) {
      case 1: return <PRStepPackage onNext={goNext} />;
      case 2: return <PRStepAddons onNext={goNext} onBack={goBack} />;
      case 3: return <PRStepBusinessDetails onNext={goNext} onBack={goBack} />;
      case 4: return <PRStepTaxAgent onNext={goNext} onBack={goBack} />;
      case 5: return <PRStepPayment onBack={goBack} />;
      default: return <PRStepPackage onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      
      <PRStepper currentStep={step} onStepClick={goToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>
          <div className={`w-full lg:w-[380px] ${step < 5 ? 'hidden lg:block' : ''}`}>
            <PROrderSummary />
          </div>
        </div>
      </div>
      <PRMobileSummary currentStep={step} />
    </div>
  );
};

const PRMobileSummary: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const { customer } = useCheckout();

  const tierId = (customer.prTier as string) || "growth";
  const billing = (customer.prBilling as "monthly" | "annual") || "annual";

  const result = calculatePRPrice({
    tierId,
    billing,
    weeklyPayRuns: !!customer.prWeeklyPayRuns,
    extraEmployees: (customer.prExtraEmployees as number) || 0,
    paydaySuper: !!customer.prPaydaySuper,
    termination: !!customer.prTermination,
    backPay: !!customer.prBackPay,
    healthCheck: !!customer.prHealthCheck,
  });

  const total = result.total;
  const suffix = result.isAnnual ? "/yr" : "/mo";
  const tier = PR_TIERS.find((t) => t.id === tierId) ?? PR_TIERS[1];

  if (currentStep >= 5) return null;

  return (
    <div className="checkout-mobile-summary lg:hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{tier.name} plan</p>
          <p className="text-lg font-bold text-foreground">
            ${(total - result.onetimeTotal).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{suffix}</span>
            {result.onetimeTotal > 0 && <span className="text-sm"> + ${result.onetimeTotal}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export const PayrollServicesCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isCheckout = searchParams.get("checkout") === "1";

  if (!isCheckout) {
    return <PRPricingLanding />;
  }

  return (
    <CheckoutFlowProvider>
      <PayrollServicesContent />
    </CheckoutFlowProvider>
  );
};

export default PayrollServicesCheckoutPage;
