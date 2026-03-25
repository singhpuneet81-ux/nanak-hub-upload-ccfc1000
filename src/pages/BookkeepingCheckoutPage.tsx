import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";
import {
  BKPageHeader,
  BKStepper,
  BKOrderSummary,
  BKStepPackage,
  BKStepAddons,
  BKStepBusinessDetails,
  BKStepTaxAgent,
  BKStepPayment,
} from "@/components/checkout/bookkeeping";
import { BKPricingLanding } from "@/components/checkout/bookkeeping/BKPricingLanding";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { calculateBKPrice, BK_TIERS } from "@/components/checkout/bookkeeping/bkPricing";


const PREMIUM_CATCH_UP_FEE = 599;
const REGISTERED_OFFICE_FEE = 300;
const TAX_PLANNING_FEE = 299;

const BookkeepingContent: React.FC = () => {
  const [step, setStep] = useState(1);
  const [searchParams] = useSearchParams();
  const { updateCustomer } = useCheckout();

  // Pre-select tier from URL param
  useEffect(() => {
    const tierParam = searchParams.get("tier");
    if (tierParam !== null) {
      const idx = parseInt(tierParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx <= 2) {
        const tier = BK_TIERS[idx];
        if (tier) updateCustomer({ bkTierIdx: idx, bkTier: tier.name });
      }
    }
  }, []);

  const goNext = () => { setStep((s) => Math.min(s + 1, 5)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goBack = () => { setStep((s) => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goToStep = (s: number) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const renderStep = () => {
    switch (step) {
      case 1: return <BKStepPackage onNext={goNext} />;
      case 2: return <BKStepAddons onNext={goNext} onBack={goBack} />;
      case 3: return <BKStepBusinessDetails onNext={goNext} onBack={goBack} />;
      case 4: return <BKStepTaxAgent onNext={goNext} onBack={goBack} />;
      case 5: return <BKStepPayment onBack={goBack} />;
      default: return <BKStepPackage onNext={goNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      
      <BKStepper currentStep={step} onStepClick={goToStep} />
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="checkout-content-pad bg-card sm:rounded-2xl sm:border sm:border-border p-4 sm:p-6 md:p-8">
              {renderStep()}
            </div>
          </div>
          <div className={`w-full lg:w-[380px] ${step < 5 ? 'hidden lg:block' : ''}`}>
            <BKOrderSummary />
          </div>
        </div>
      </div>
      <BKMobileSummary currentStep={step} />
    </div>
  );
};

const BKMobileSummary: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const { customer } = useCheckout();

  const tierId = (customer.bkTier as string) || "growth";
  const billing = (customer.bkBilling as "monthly" | "annual") || "annual";
  const employees = (customer.bkEmployees as number) || 0;

  const result = calculateBKPrice({
    tierId,
    billing,
    employees,
    extraFeeds: !!customer.bkExtraFeeds,
    catchUp: !!customer.bkCatchUp,
    ias: !!customer.bkIas,
    jobTracking: !!customer.bkJobTracking,
  });

  const premiumCatchUp = (customer.bkPremiumCatchUp as string) || "up_to_date";
  const premiumTotal =
    (premiumCatchUp === "need_support" ? PREMIUM_CATCH_UP_FEE : 0) +
    (customer.bkRegisteredOffice ? REGISTERED_OFFICE_FEE : 0) +
    (customer.bkTaxPlanning ? TAX_PLANNING_FEE : 0);

  const total = result.total + premiumTotal;
  const suffix = result.isAnnual ? "/yr" : "/mo";
  const tier = BK_TIERS.find((t) => t.id === tierId) ?? BK_TIERS[1];

  if (currentStep >= 5) return null;

  return (
    <div className="checkout-mobile-summary lg:hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{tier.name} plan</p>
          <p className="text-lg font-bold text-foreground">${total.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{suffix}</span></p>
        </div>
      </div>
    </div>
  );
};

export const BookkeepingCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isCheckout = searchParams.get("checkout") === "1";

  if (!isCheckout) {
    return <BKPricingLanding />;
  }

  return (
    <CheckoutFlowProvider>
      <BookkeepingContent />
    </CheckoutFlowProvider>
  );
};

export default BookkeepingCheckoutPage;
