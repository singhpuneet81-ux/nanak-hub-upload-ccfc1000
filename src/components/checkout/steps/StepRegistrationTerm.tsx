import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { OptionCard } from "@/components/checkout/OptionCard";
import { ButtonGroup } from "@/components/checkout/Buttons";
import { registrationTerms } from "@/config/terms.config";
import { formatCurrencyShort } from "@/config/pricing.config";
import { Calendar, Info } from "lucide-react";

export const StepRegistrationTerm: React.FC = () => {
  const { selections, updateSelections, nextStep, prevStep, isStepValid } = useCheckout();

  return (
    <div className="content-card animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Choose Registration Term</h2>
      <p className="text-muted-foreground mb-6">
        Select how long you'd like to register your business name
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {registrationTerms.map((term) => (
          <OptionCard
            key={term.id}
            selected={selections.registrationTerm === term.id}
            onClick={() => updateSelections({ registrationTerm: term.id })}
            title={term.label}
            subtitle={term.duration}
            features={term.features}
            price={formatCurrencyShort(term.asicFee)}
            priceLabel="ASIC fee"
            icon={<Calendar size={20} />}
            badge={
              term.isRecommended
                ? { text: "Recommended", variant: "recommended" }
                : undefined
            }
            savingsText={term.savingsText}
          />
        ))}
      </div>

      {/* Info box */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
        <Info className="text-primary shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="font-medium text-foreground text-sm">ASIC Registration Included</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Your business name will be officially registered with ASIC (Australian Securities and Investments Commission).
          </p>
        </div>
      </div>

      <ButtonGroup
        onBack={prevStep}
        onContinue={nextStep}
        continueText="Continue to Plan Selection"
        continueDisabled={!isStepValid(2)}
      />
    </div>
  );
};
