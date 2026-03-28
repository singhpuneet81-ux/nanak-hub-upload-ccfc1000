import React, { useState, useEffect, useMemo } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { cn } from "@/lib/utils";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Shield,
  Check,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ApiRevenueBracket {
  id: string;
  label: string;
}

interface ApiPlan {
  id: string;
  name: string;
  badge?: string | null;
  tagline?: string;
  features: string[];
  tierPricing: Record<string, { standard: number; bundle: number }>;
}

interface ApiPackagePlans {
  revenueBrackets: ApiRevenueBracket[];
  plans: ApiPlan[];
}

interface FTStepPackageProps {
  onNext: () => void;
  onBack: () => void;
}

export const FTStepPackage: React.FC<FTStepPackageProps> = ({
  onNext,
  onBack,
}) => {
  const { selections, updateSelections } = useCheckout();
  const { packages: pricingPackages, serviceMeta, isLoading } = usePricingPackages();
  const pricing = pricingPackages.family_trust;

  // Extract API-driven packagePlans from serviceMeta
  const ftMeta = serviceMeta?.family_trust as { packagePlans?: ApiPackagePlans } | undefined;
  const packagePlans = ftMeta?.packagePlans;

  const revenueBrackets = useMemo(() => packagePlans?.revenueBrackets ?? [], [packagePlans]);
  const apiPlansList = useMemo(() => packagePlans?.plans ?? [], [packagePlans]);
  const apiPlansMap = useMemo(() => {
    const map: Record<string, ApiPlan> = {};
    for (const p of apiPlansList) map[p.id] = p;
    return map;
  }, [apiPlansList]);

  const selectedPackage = selections.package;
  const selectedBracket = selections.revenueBracket || "";
  const billingFrequency = selections.billingFrequency || "annual";
  const selectedPlan = (selections.accountingPlan as string) || "";

  // Sync local selections with API data once loaded
  useEffect(() => {
    if (apiPlansList.length === 0 || revenueBrackets.length === 0) return;

    const updates: Record<string, unknown> = {};

    if (!selectedPlan || !apiPlansList.some(p => p.id === selectedPlan)) {
      updates.accountingPlan = apiPlansList[0].id;
    }
    if (!selectedBracket || !revenueBrackets.some(b => b.id === selectedBracket)) {
      updates.revenueBracket = revenueBrackets[0].id;
    }

    if (Object.keys(updates).length > 0) {
      updateSelections(updates);
    }
  }, [apiPlansList, revenueBrackets]);

  const showAccountingConfig = selectedPackage === "registration_plus_accounting";
  const showPlanSelection = showAccountingConfig && Boolean(selectedBracket);

  const handlePackageSelect = (packageId: "registration_only" | "registration_plus_accounting") => {
    if (packageId === "registration_only") {
      updateSelections({
        package: "registration_only",
        revenueBracket: "",
        billingFrequency: null,
        accountingPlan: undefined,
      });
    } else {
      updateSelections({
        package: "registration_plus_accounting",
        revenueBracket: selectedBracket || (revenueBrackets[0]?.id ?? ""),
        billingFrequency: billingFrequency ?? "annual",
        accountingPlan: selectedPlan || (apiPlansList[0]?.id ?? ""),
      });
    }
  };

  // Get pricing from API tierPricing
  const getAccountingPrice = () => {
    const plan = apiPlansMap[selectedPlan];
    if (plan?.tierPricing?.[selectedBracket]) {
      const tp = plan.tierPricing[selectedBracket];
      return { standard: tp.standard, bundle: tp.bundle };
    }
    return { standard: 0, bundle: 0 };
  };

  const accountingPrices = getAccountingPrice();
  const displayPrice = billingFrequency === "annual" ? accountingPrices.bundle : accountingPrices.standard;
  const annualSavings = billingFrequency === "annual" ? accountingPrices.standard - accountingPrices.bundle : 0;

  const handleContinue = () => {
    if (selectedPackage === "registration_only") {
      onNext();
      return;
    }
    if (selectedPackage && selectedBracket && billingFrequency && selectedPlan) {
      onNext();
    }
  };

  const isValid =
    selectedPackage === "registration_only" ||
    (selectedPackage && selectedBracket && billingFrequency && selectedPlan);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Choose Your Package</h2>
        <p className="text-muted-foreground mt-1">
          Family Trust registration only or bundle with ongoing accounting
        </p>
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
              "w-6 h-6 rounded-full border-2 flex items-center justify-center",
              selectedPackage === "registration_only" ? "bg-primary border-primary" : "border-border"
            )}>
              {selectedPackage === "registration_only" && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Family Trust Registration</h3>
              <p className="text-sm text-muted-foreground">One-time setup</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {pricing.foundation.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-green-600" />
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
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> Recommended
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center",
              selectedPackage === "registration_plus_accounting" ? "bg-primary border-primary" : "border-border"
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
              <p className="text-sm text-muted-foreground">Ongoing compliance covered</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {["Everything in Registration Only", ...pricing.accounting.includes].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-green-600" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accounting Config */}
      {showAccountingConfig && (
        <div className="space-y-6 pt-4">
          {/* Revenue & Billing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Annual Revenue Bracket</Label>
              <Select
                value={selectedBracket}
                onValueChange={(val) => updateSelections({ revenueBracket: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select bracket"} />
                </SelectTrigger>
                <SelectContent>
                  {revenueBrackets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Billing Frequency</Label>
              <div className="flex h-11 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => updateSelections({ billingFrequency: "monthly" })}
                  className={cn(
                    "flex-1 rounded-md text-sm font-medium",
                    billingFrequency === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => updateSelections({ billingFrequency: "annual" })}
                  className={cn(
                    "flex-1 rounded-md text-sm font-medium",
                    billingFrequency === "annual" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Annual
                </button>
              </div>
            </div>
          </div>

          {/* Savings */}
          {annualSavings > 0 && billingFrequency === "annual" && (
            <p className="text-sm text-[hsl(var(--success))] font-medium">
              Save ${annualSavings}/year with annual billing
            </p>
          )}

          {/* Plan Selection */}
          {showPlanSelection && apiPlansList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Select Your Plan</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiPlansList.map((plan, idx) => {
                  const isSelected = selectedPlan === plan.id;
                  const isHighlighted = plan.badge === "MOST POPULAR" || idx === 1;
                  const tierPrice = plan.tierPricing?.[selectedBracket];
                  const price = tierPrice
                    ? (billingFrequency === "annual" ? tierPrice.bundle : tierPrice.standard)
                    : 0;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => updateSelections({ accountingPlan: plan.id })}
                      className={cn(
                        "relative rounded-2xl border-2 p-6 cursor-pointer transition-all",
                        isSelected
                          ? (isHighlighted ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]" : "border-primary bg-primary/5")
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      {plan.badge && plan.badge.trim() !== "" && (
                        <div className="absolute -top-3 left-4">
                          <span className={cn(
                            "text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1",
                            isHighlighted ? "bg-[hsl(var(--cta))] disabled:opacity-50" : "bg-primary"
                          )}>
                            {isHighlighted && <Zap size={12} />} {plan.badge}
                          </span>
                        </div>
                      )}

                      <div className={cn("flex items-center justify-between mb-1", plan.badge ? "mt-2" : "")}>
                        <h4 className="font-bold text-foreground text-lg">{plan.name}</h4>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          isSelected
                            ? (isHighlighted ? "border-[hsl(var(--cta))]" : "border-primary")
                            : "border-muted-foreground/40"
                        )}>
                          {isSelected && <div className={cn("w-2.5 h-2.5 rounded-full", isHighlighted ? "bg-[hsl(var(--cta))] disabled:opacity-50" : "bg-primary")} />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{plan.tagline}</p>

                      <div className="mb-4">
                        <span className="text-2xl font-bold">${price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">
                          /{billingFrequency === "annual" ? "yr" : "mo"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[hsl(var(--success))]" />
                            <span className="text-sm text-foreground">{f}</span>
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
      <div className="checkout-nav hidden md:flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 h-12 border rounded-lg flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="flex-1 h-12 bg-[hsl(var(--cta))] text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
