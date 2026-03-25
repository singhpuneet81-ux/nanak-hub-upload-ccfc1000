import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { OptionCard } from "@/components/checkout/OptionCard";
import { ButtonGroup } from "@/components/checkout/Buttons";
import { ToggleGroup } from "@/components/checkout/ToggleGroup";
import { SoftSelect } from "@/components/checkout/FormInputs";
import { packages, revenueBrackets, accountingPlans, getPricing, getAnnualSavings } from "@/config/plans.config";
import { formatCurrency, formatCurrencyShort } from "@/config/pricing.config";
import { Check, FileText, Calculator } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText size={24} />,
  Calculator: <Calculator size={24} />,
};

export const StepPlanSelection: React.FC = () => {
  const { selections, updateSelections, nextStep, prevStep, isStepValid } = useCheckout();

  const showAccountingOptions = selections.package === "registration_plus_accounting";

  const revenueBracketOptions = [
    { value: "", label: "Select Revenue Bracket" },
    ...revenueBrackets.map((b) => ({ value: b.id, label: b.label })),
  ];

  const getDisplayPrice = (planId: string) => {
    if (!selections.revenueBracket) {
      const plan = accountingPlans.find((p) => p.id === planId);
      return selections.billingFrequency === "annual"
        ? plan?.annualPrice ?? 0
        : plan?.monthlyPrice ?? 0;
    }
    return getPricing(
      selections.revenueBracket,
      planId,
      selections.billingFrequency || "monthly"
    );
  };

  const currentSavings = selections.revenueBracket && selections.accountingPlan
    ? getAnnualSavings(selections.revenueBracket, selections.accountingPlan)
    : 0;

  return (
    <div className="content-card animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Package</h2>
      <p className="text-muted-foreground mb-6">
        Select the package that best fits your needs
      </p>

      {/* Package Selection - Always shown first */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {packages.map((pkg) => (
          <OptionCard
            key={pkg.id}
            selected={selections.package === pkg.id}
            onClick={() => updateSelections({ 
              package: pkg.id,
              // Reset accounting options when switching packages
              ...(pkg.id === "registration_only" ? {
                revenueBracket: "",
                billingFrequency: null,
                accountingPlan: "",
              } : {})
            })}
            title={pkg.name}
            subtitle={pkg.subtitle}
            highlighted={pkg.isRecommended}
            badge={pkg.isRecommended ? { text: "RECOMMENDED", variant: "popular" } : undefined}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {iconMap[pkg.icon]}
              </div>
            </div>
            <ul className="space-y-2">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="text-[hsl(var(--success))] mt-0.5 shrink-0" size={16} />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </OptionCard>
        ))}
      </div>

      {/* Accounting Options - Only shown when Registration + Accounting is selected */}
      {showAccountingOptions && (
        <>
          {/* Revenue Bracket & Billing Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 p-5 bg-secondary rounded-xl animate-fade-in">
            <div>
              <label className="form-label">Annual Revenue Bracket</label>
              <SoftSelect
                options={revenueBracketOptions}
                value={selections.revenueBracket}
                onChange={(e) => updateSelections({ revenueBracket: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Billing Frequency</label>
              <ToggleGroup
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual" },
                ]}
                value={selections.billingFrequency || "monthly"}
                onChange={(value) => 
                  updateSelections({ billingFrequency: value as "monthly" | "annual" })
                }
              />
            </div>
          </div>

          {/* Plan Selection - Only appears AFTER revenue bracket is selected */}
          {selections.revenueBracket && (
            <div className="mb-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-1">Select Your Plan</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Pricing scales with your business size
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {accountingPlans.map((plan) => {
                  const price = getDisplayPrice(plan.id);
                  const isMonthly = selections.billingFrequency !== "annual";
                  
                  return (
                    <OptionCard
                      key={plan.id}
                      selected={selections.accountingPlan === plan.id}
                      onClick={() => updateSelections({ accountingPlan: plan.id })}
                      title={plan.name}
                      subtitle={plan.subtitle}
                      price={formatCurrencyShort(isMonthly ? price : price / 12)}
                      priceLabel="/mo"
                      highlighted={plan.isPopular}
                      badge={
                        plan.isPopular
                          ? { text: "MOST POPULAR", variant: "popular" }
                          : undefined
                      }
                      footnote={plan.footnote}
                    >
                      <ul className="space-y-2 mt-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="text-[hsl(var(--success))] mt-0.5 shrink-0" size={16} />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </OptionCard>
                  );
                })}
              </div>

              {/* Annual Savings Strip - shown below plans when annual is selected */}
              {selections.billingFrequency === "annual" && currentSavings > 0 && (
                <div className="mt-5">
                  <div className="savings-strip">
                    <span>↗</span>
                    Save {formatCurrency(currentSavings)}/year with annual billing
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ButtonGroup
        onBack={prevStep}
        onContinue={nextStep}
        continueText="Continue to Payroll"
        continueDisabled={!isStepValid(3)}
      />
    </div>
  );
};
