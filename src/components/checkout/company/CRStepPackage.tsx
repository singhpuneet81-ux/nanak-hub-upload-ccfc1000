import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Calculator,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const ASIC_FEE = 611;
const PAYROLL_PRICE_PER_STAFF = 120;

interface CRStepPackageProps {
  onNext: () => void;
  onBack: () => void;
}

// Types for API packagePlans
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

export const CRStepPackage: React.FC<CRStepPackageProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const [searchParams] = useSearchParams();
  const { packages: pricingPackages, serviceMeta, isLoading } = usePricingPackages();
  const pricing = pricingPackages.company;
  const SERVICE_FEE = pricing.foundation.price;

  // Extract API-driven packagePlans from serviceMeta — NO fallback
  const companyMeta = serviceMeta?.company as { packagePlans?: ApiPackagePlans } | undefined;
  const packagePlans = companyMeta?.packagePlans;

  const revenueBrackets = useMemo(() => packagePlans?.revenueBrackets ?? [], [packagePlans]);
  const apiPlansList = useMemo(() => packagePlans?.plans ?? [], [packagePlans]);

  const apiPlansMap = useMemo(() => {
    const map: Record<string, ApiPlan> = {};
    for (const p of apiPlansList) {
      map[p.id] = p;
    }
    return map;
  }, [apiPlansList]);

  // Read package from URL param or customer context
  const urlPackage = searchParams.get("package") as "registration_only" | "registration_plus_accounting" | null;
  const initialPackage = (customer.crPackage as string) || urlPackage || "";

  const [selectedPackage, setSelectedPackage] = useState<
    "" | "registration_only" | "registration_plus_accounting"
  >(initialPackage as "" | "registration_only" | "registration_plus_accounting");
  const [revenueBracket, setRevenueBracket] = useState(customer.crTurnover || "");
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "annual">(
    (customer.crBillingCycle as "monthly" | "annual") || "annual"
  );
  const [payrollEnabled, setPayrollEnabled] = useState(!!customer.crPayrollEnabled);
  const [staffCount, setStaffCount] = useState((customer.crStaffCount as number) || 1);
  const [packageLevel, setPackageLevel] = useState<string>((customer.crPackageLevel as string) || "");

  // Keep local selections valid against latest API response (no static fallback values)
  useEffect(() => {
    if (apiPlansList.length === 0 || revenueBrackets.length === 0) return;

    setPackageLevel((prev) =>
      apiPlansList.some((plan) => plan.id === prev) ? prev : apiPlansList[0].id
    );

    setRevenueBracket((prev) =>
      revenueBrackets.some((bracket) => bracket.id === prev) ? prev : revenueBrackets[0].id
    );
  }, [apiPlansList, revenueBrackets]);

  useEffect(() => {
    updateCustomer({
      crPackage: selectedPackage,
      crTurnover: revenueBracket,
      crBillingCycle: billingFrequency,
      crPayrollEnabled: payrollEnabled,
      crStaffCount: staffCount,
      crPackageLevel: packageLevel,
    });
  }, [selectedPackage, revenueBracket, billingFrequency, payrollEnabled, staffCount, packageLevel]);

  // Get pricing from API tierPricing only — no fallback
  const getAccountingPrice = () => {
    const plan = apiPlansMap[packageLevel];
    if (plan?.tierPricing?.[revenueBracket]) {
      const tp = plan.tierPricing[revenueBracket];
      return { standard: tp.standard, bundle: tp.bundle };
    }
    return { standard: 0, bundle: 0 };
  };

  const accountingPrices = getAccountingPrice();
  const displayPrice = billingFrequency === "annual" ? accountingPrices.bundle : accountingPrices.standard;
  const annualSavings = billingFrequency === "annual" ? accountingPrices.standard - accountingPrices.bundle : 0;

  const isValid =
    selectedPackage === "registration_only" ||
    (selectedPackage === "registration_plus_accounting" && !!revenueBracket && !!packageLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Choose Your Package</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Registration only or bundle with ongoing accounting services
        </p>
      </div>

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Registration Only */}
        <div
          onClick={() => setSelectedPackage("registration_only")}
          className={cn(
            "p-5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col",
            selectedPackage === "registration_only"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Registration Only</span>
            </div>
            {selectedPackage === "registration_only" && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Complete company setup, no ongoing services
          </p>
          <ul className="space-y-2 flex-1">
            {pricing.foundation.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border">
            <div
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors",
                selectedPackage === "registration_only"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {selectedPackage === "registration_only" ? "✓ Selected" : "Select Registration Only"}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Setup only · No ongoing services</p>
          </div>
        </div>

        {/* Registration + Accounting */}
        <div
          onClick={() => setSelectedPackage("registration_plus_accounting")}
          className={cn(
            "p-5 rounded-xl border-2 text-left transition-all relative cursor-pointer flex flex-col",
            selectedPackage === "registration_plus_accounting"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          {/* Recommended badge */}
          <div className="absolute -top-3 left-4">
            <span className="px-2 py-1 bg-[hsl(var(--success))] text-white text-xs font-medium rounded-full">
              ✓ Recommended
            </span>
          </div>

          <div className="flex items-center justify-between mb-3 mt-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span className="font-semibold">Registration + Accounting</span>
            </div>
            {selectedPackage === "registration_plus_accounting" && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">Complete solution</p>
          <ul className="space-y-2 flex-1">
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
              Everything in Registration Only
            </li>
            {pricing.accounting.includes.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border">
            <div
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors",
                selectedPackage === "registration_plus_accounting"
                  ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50"
                  : "bg-[hsl(var(--cta))] text-white disabled:opacity-50"
              )}
            >
              {selectedPackage === "registration_plus_accounting" ? "✓ Selected" : "Select Registration + Accounting"}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Everything included · Best Value</p>
          </div>
        </div>
      </div>

      {/* Accounting Configuration */}
      {selectedPackage === "registration_plus_accounting" && (
        <div className="space-y-6">
          {/* Revenue & Billing Config - FIRST */}
          <div className="space-y-5 p-5 bg-muted/50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual Revenue Bracket</Label>
                <Select value={revenueBracket} onValueChange={setRevenueBracket}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading revenue brackets..." : "Select revenue bracket"} />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueBrackets.map((bracket: { id: string; label: string }) => (
                      <SelectItem key={bracket.id} value={bracket.id}>
                        {bracket.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Billing Frequency</Label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBillingFrequency("monthly")}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium transition-colors",
                      billingFrequency === "monthly"
                        ? "bg-muted"
                        : "bg-card hover:bg-muted/50"
                    )}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingFrequency("annual")}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium transition-colors",
                      billingFrequency === "annual"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted/50"
                    )}
                  >
                    Annual (Save)
                  </button>
                </div>
              </div>
            </div>

            {billingFrequency === "annual" && annualSavings > 0 && (
              <p className="text-right text-sm text-[hsl(var(--success))] font-medium">
                Save ${annualSavings} annually
              </p>
            )}
          </div>

          {/* Choose Your Plan - SECOND */}
          <div>
            <h3 className="font-bold text-foreground text-lg mb-3">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {apiPlansList.map((plan, idx) => {
                const isSelected = packageLevel === plan.id;
                const isHighlighted = plan.badge === "MOST POPULAR" || idx === 1;
                const accentClass = isHighlighted ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]" : "border-primary bg-primary/5";
                const inactiveClass = "border-border hover:border-primary/40";

                return (
                  <div
                    key={plan.id}
                    onClick={() => setPackageLevel(plan.id)}
                    className={cn(
                      "relative rounded-2xl border-2 p-6 cursor-pointer transition-all",
                      isSelected ? accentClass : inactiveClass
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

          {/* Payroll Add-on */}
          <div
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              payrollEnabled ? "border-primary bg-primary/5" : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="cr-payroll"
                checked={payrollEnabled}
                onCheckedChange={(checked) => setPayrollEnabled(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cr-payroll" className="font-semibold cursor-pointer">
                    Add Payroll Processing
                  </Label>
                  <div className="text-right">
                    <span className="font-bold text-foreground">
                      ${PAYROLL_PRICE_PER_STAFF}
                    </span>
                    <p className="text-xs text-muted-foreground">per staff/yr</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  STP reporting, pay slips & super payments
                </p>

                {payrollEnabled && (
                  <div className="mt-4 space-y-2">
                    <Label>Number of Staff</Label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStaffCount(Math.max(1, staffCount - 1))}
                        className="counter-btn-inline"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {staffCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStaffCount(staffCount + 1)}
                        className="counter-btn-inline"
                      >
                        <Plus size={18} />
                      </button>
                      <span className="text-sm text-muted-foreground ml-2">
                        = ${staffCount * PAYROLL_PRICE_PER_STAFF}/yr
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button
          onClick={onBack}
          className="py-3 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={() => isValid && onNext()}
          disabled={!isValid}
          className="py-3 bg-[hsl(var(--cta))] hover:opacity-90 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        >
          Continue to Payment
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
