import { useState, useCallback, useMemo } from "react";
import { CheckoutState, PricingServiceKey, PricingSummary } from "@/types/services";
import { SERVICE_CONFIGS } from "@/config/services";

export function useCheckoutState(serviceKey: PricingServiceKey) {
  const config = SERVICE_CONFIGS[serviceKey];

  const [state, setState] = useState<CheckoutState>({
    currentStep: 1,
    serviceKey,
    formData: {},
    selectedPackageType: "registration_only",
    selectedAccountingPackage: null,
    selectedAddOns: [],
  });

  const setFormField = useCallback((name: string, value: string) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  }, []);

  const setPackageType = useCallback((type: "registration_only" | "registration_and_accounting") => {
    setState((prev) => ({
      ...prev,
      selectedPackageType: type,
      selectedAccountingPackage: type === "registration_only" ? null : prev.selectedAccountingPackage,
    }));
  }, []);

  const setAccountingPackage = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedAccountingPackage: id }));
  }, []);

  const toggleAddOn = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(id)
        ? prev.selectedAddOns.filter((a) => a !== id)
        : [...prev.selectedAddOns, id],
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: Math.max(1, Math.min(3, step)) }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.min(3, prev.currentStep + 1) }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  }, []);

  const pricingSummary: PricingSummary = useMemo(() => {
    const registrationFee = config.foundationPrice;
    const govtFee = config.govtFee || 0;
    const accountingPkg = state.selectedAccountingPackage
      ? config.accountingPackages.find((p) => p.id === state.selectedAccountingPackage)
      : null;
    const accountingMonthly = accountingPkg ? accountingPkg.monthlyPrice : 0;
    const addOnsTotal = state.selectedAddOns.reduce((sum, id) => {
      const addon = config.addOns.find((a) => a.id === id);
      return sum + (addon ? addon.price : 0);
    }, 0);

    return {
      registrationFee,
      govtFee,
      accountingMonthly,
      addOnsTotal,
      total: registrationFee + govtFee + addOnsTotal,
    };
  }, [config, state.selectedAccountingPackage, state.selectedAddOns]);

  return {
    state,
    config,
    pricingSummary,
    setFormField,
    setPackageType,
    setAccountingPackage,
    toggleAddOn,
    goToStep,
    nextStep,
    prevStep,
  };
}
