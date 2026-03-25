import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { packages, revenueBrackets, accountingPlans, getPricing, getAnnualSavings } from "@/config/plans.config";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, FileText, Shield, Check, TrendingUp, Sparkles } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";

export const BNStepPlanSelection: React.FC = () => {
  const { selections, updateSelections, nextStep, prevStep } = useCheckout();
  const { packages: pricingPackages } = usePricingPackages();
  const pricing = pricingPackages.business_name;

  const selectedPackage = selections.package;
  const selectedBracket = selections.revenueBracket;
  const billingFrequency = selections.billingFrequency || "annual";
  const selectedPlan = selections.accountingPlan;

  const showAccountingConfig =
  selectedPackage === "registration_plus_accounting";

const showPlanSelection =
  showAccountingConfig &&
  Boolean(selectedBracket) &&
  Boolean(billingFrequency);

  const handlePackageSelect = (packageId: string) => {
    if (packageId === "registration_only") {
      updateSelections({
        package: packageId,
        revenueBracket: "",
        billingFrequency: null,
        accountingPlan: "",
      });
    } else {
      updateSelections({
        package: packageId,
        billingFrequency: billingFrequency || "annual",
        revenueBracket: selectedBracket || "",
        accountingPlan: selectedPlan || "",
      });
    }
  };

  const handleContinue = () => {
    if (selectedPackage === "registration_only") {
      nextStep();
    } else if (selectedPackage && selectedBracket && billingFrequency && selectedPlan) {
      nextStep();
    }
  };

  const isValid = selectedPackage === "registration_only" || 
    (selectedPackage && selectedBracket && billingFrequency && selectedPlan);

  // Calculate savings for display
  const currentSavings = selectedBracket && selectedPlan && billingFrequency === "annual"
    ? getAnnualSavings(selectedBracket, selectedPlan)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Choose Your Package</h2>
        <p className="text-muted-foreground mt-1">Registration only or bundle with ongoing accounting services</p>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Registration Only */}
        <div
          onClick={() => handlePackageSelect("registration_only")}
          className={cn(
            "relative rounded-xl border-2 p-5 cursor-pointer transition-all",
            selectedPackage === "registration_only"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              selectedPackage === "registration_only"
                ? "bg-primary border-primary"
                : "border-border"
            )}>
              {selectedPackage === "registration_only" && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Registration Only</h3>
              <p className="text-sm text-muted-foreground">Just the essentials</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {pricing.foundation.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[hsl(142_71%_45%)]/10 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[hsl(142_71%_45%)]" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration + Accounting */}
        <div
          onClick={() => handlePackageSelect("registration_plus_accounting")}
          className={cn(
            "relative rounded-xl border-2 p-5 cursor-pointer transition-all",
            selectedPackage === "registration_plus_accounting"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          {/* Recommended Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[hsl(142_71%_45%)] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              Recommended
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              selectedPackage === "registration_plus_accounting"
                ? "bg-primary border-primary"
                : "border-border"
            )}>
              {selectedPackage === "registration_plus_accounting" && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Registration + Accounting</h3>
              <p className="text-sm text-muted-foreground">Complete solution</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {["Everything in Registration Only", ...pricing.accounting.includes].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[hsl(142_71%_45%)]/10 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[hsl(142_71%_45%)]" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

     {/* Accounting Configuration – Step 2 */}
{showAccountingConfig && (
  <div className="space-y-6 pt-4">
          {/* Revenue & Billing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Annual Revenue Bracket</label>
              <select
                value={selectedBracket}
                onChange={(e) => updateSelections({ revenueBracket: e.target.value })}
                className="w-full h-11 px-4 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select bracket</option>
                {revenueBrackets.map((bracket) => (
                  <option key={bracket.id} value={bracket.id}>{bracket.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Billing Frequency</label>
              <div className="flex h-11 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => updateSelections({ billingFrequency: "monthly" })}
                  className={cn(
                    "flex-1 rounded-md text-sm font-medium transition-colors",
                    billingFrequency === "monthly"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => updateSelections({ billingFrequency: "annual" })}
                  className={cn(
                    "flex-1 rounded-md text-sm font-medium transition-colors",
                    billingFrequency === "annual"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Annual
                </button>
              </div>
            </div>
          </div>

          {/* Savings Banner */}
          {currentSavings > 0 && (
            <div className="bg-[hsl(142_76%_94%)] rounded-lg px-4 py-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[hsl(142_71%_35%)]" />
              <span className="text-sm font-medium text-[hsl(142_71%_35%)]">
                Save ${currentSavings}/year with annual billing
              </span>
            </div>
          )}

        {/* Plan Selection – Step 3 */}
{showPlanSelection && (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-foreground">
      Select Your Plan
    </h3>
    <p className="text-sm text-muted-foreground">
      Pricing scales with your business size
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {accountingPlans.map((plan) => {
        const isSelected = selectedPlan === plan.id;
        const price = selectedBracket
          ? getPricing(
              selectedBracket,
              plan.id,
              billingFrequency as "monthly" | "annual"
            )
          : plan.annualPrice;

        return (
          <div
            key={plan.id}
            onClick={() => updateSelections({ accountingPlan: plan.id })}
            className={cn(
              "relative rounded-xl border-2 p-5 cursor-pointer transition-all",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[hsl(var(--cta))] text-white text-xs font-medium px-3 py-1 rounded-full disabled:opacity-50">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="absolute top-4 right-4">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                isSelected
                  ? "bg-primary border-primary"
                  : "border-border"
              )}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>

            <h4 className="font-semibold text-foreground">{plan.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{plan.subtitle}</p>

            <div className="mb-4">
              <span className="text-2xl font-bold text-foreground">
                ${price}
              </span>
              <span className="text-sm text-muted-foreground">
                /{billingFrequency === "annual" ? "yr" : "mo"}
              </span>
            </div>

            <div className="space-y-2">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

        </div>
      )}

      {/* Navigation */}
      <div className="checkout-nav flex gap-4">
        <button
          onClick={prevStep}
          className="flex-1 h-12 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="flex-1 h-12 bg-[hsl(var(--cta))] hover:bg-[hsl(var(--cta))]/90 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payroll
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
