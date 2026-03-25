import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { OptionCard } from "@/components/checkout/OptionCard";
import { Counter } from "@/components/checkout/Counter";
import { ButtonGroup } from "@/components/checkout/Buttons";
import { payrollOptions, payrollFeatures, PAYROLL_PRICE_PER_STAFF } from "@/config/payroll.config";
import { formatCurrencyShort } from "@/config/pricing.config";
import { X, Users } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  X: <X size={20} />,
  Users: <Users size={20} />,
};

export const StepPayroll: React.FC = () => {
  const { selections, updateSelections, nextStep, prevStep } = useCheckout();

  const handleOptionSelect = (optionId: string) => {
    if (optionId === "no_payroll") {
      updateSelections({ payrollEnabled: false, staffCount: 1 });
    } else {
      updateSelections({ payrollEnabled: true });
    }
  };

  return (
    <div className="content-card animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Payroll Services</h2>
      <p className="text-muted-foreground mb-6">
        Are you looking to hire staff or manage payroll?
      </p>

      {/* Payroll Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {payrollOptions.map((option) => {
          const isSelected = option.id === "no_payroll" 
            ? !selections.payrollEnabled 
            : selections.payrollEnabled;
          
          return (
            <OptionCard
              key={option.id}
              selected={isSelected}
              onClick={() => handleOptionSelect(option.id)}
              title={option.name}
              subtitle={option.subtitle}
              icon={iconMap[option.icon]}
            >
              {option.id === "no_payroll" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Perfect for solo founders and contractors
                </p>
              )}
              {option.id === "yes_payroll" && (
                <p className="text-sm text-primary font-medium mt-2">
                  +{formatCurrencyShort(PAYROLL_PRICE_PER_STAFF)}/yr per staff member
                </p>
              )}
            </OptionCard>
          );
        })}
      </div>

      {/* Staff Counter - Compact inline design matching reference */}
      {selections.payrollEnabled && (
        <div className="py-4 px-5 bg-secondary rounded-xl mb-6 animate-fade-in">
          <h3 className="text-center font-semibold text-foreground text-sm mb-0.5">
            How many staff members?
          </h3>
          <p className="text-center text-xs text-muted-foreground mb-3">
            You can always adjust this later
          </p>

          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              onClick={() => selections.staffCount > 1 && updateSelections({ staffCount: selections.staffCount - 1 })}
              disabled={selections.staffCount <= 1}
            >
              <span className="text-base font-medium leading-none">−</span>
            </button>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground leading-none">{selections.staffCount}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Staff member{selections.staffCount !== 1 ? "s" : ""}
              </p>
            </div>
            
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              onClick={() => selections.staffCount < 50 && updateSelections({ staffCount: selections.staffCount + 1 })}
              disabled={selections.staffCount >= 50}
            >
              <span className="text-base font-medium leading-none">+</span>
            </button>
          </div>

          <p className="text-center text-xs font-medium text-primary mt-2">
            +{formatCurrencyShort(PAYROLL_PRICE_PER_STAFF * selections.staffCount)}/yr
          </p>
        </div>
      )}

      {/* What's Included */}
      {selections.payrollEnabled && (
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mb-6 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What's included: </span>
            {payrollFeatures.join(", ")}.
          </p>
        </div>
      )}

      <ButtonGroup
        onBack={prevStep}
        onContinue={nextStep}
        continueText="Continue to Review"
      />
    </div>
  );
};
