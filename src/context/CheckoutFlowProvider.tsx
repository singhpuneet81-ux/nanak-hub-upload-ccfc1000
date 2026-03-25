import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getServiceById, getCategoryById } from "@/config/services.config";
import { getTermById, registrationTerms } from "@/config/terms.config";
import { getPricing, getAnnualSavings, accountingPlans } from "@/config/plans.config";
import { PAYROLL_PRICE_PER_STAFF } from "@/config/payroll.config";
import { calculateTotals, TotalsResult, PRICING_PACKAGES, PricingServiceKey } from "@/config/pricing.config";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { SLUG_TO_SERVICE_KEY } from "@/config/serviceSlugMap";
import { YOUR_DETAILS_FORMS } from "@/config/yourDetails.config";

// Dynamic customer data - can hold any field from any service form
export interface CustomerData {
  [key: string]: any;
}

export interface SelectionsData {
  registrationTerm: string;
  package: string;
  revenueBracket: string;
  billingFrequency: "monthly" | "annual" | null;
  accountingPlan: string;
  payrollEnabled: boolean;
  staffCount: number;
}

export interface CheckoutState {
  currentStep: number;
  selectedServiceId: string;
  selectedCategoryId: string;
  customer: CustomerData;
  selections: SelectionsData;
}

interface CheckoutContextValue extends CheckoutState {
  // Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Service selection
  setSelectedService: (serviceId: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  
  // Customer data
  updateCustomer: (data: Partial<CustomerData>) => void;
  
  // Selections
  updateSelections: (data: Partial<SelectionsData>) => void;
  
  // Computed values
  serviceName: string;
  categoryName: string;
  serviceFee: number;
  asicFee: number;
  accountingFee: number;
  payrollFee: number;
  annualSavings: number;
  totals: TotalsResult;
  showBusinessStructure: boolean;
  serviceKey: string;
  
  // Validation
  isStepValid: (step: number) => boolean;
  
  // Final output
  getSubmissionPayload: () => object;
  pricing: ReturnType<typeof buildFamilyTrustPricing> | null;
}

// Empty default - fields are added dynamically as user fills form
const defaultCustomer: CustomerData = {};

const defaultSelections: SelectionsData = {
  registrationTerm: "3_year",
  package: "",
  revenueBracket: "",
  billingFrequency: null,
  accountingPlan: "",
  payrollEnabled: false,
  staffCount: 1,
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutFlowProvider");
  }

  
  return context;
};

interface CheckoutFlowProviderProps {
  children: React.ReactNode;
  initialServiceId?: string;
  initialCategoryId?: string;
}

const ACCOUNTING_PRICES: Record<string, { monthly: number; annual: number }> = {
  "0-100k": { monthly: 199, annual: 2149 },
  "100k-250k": { monthly: 249, annual: 2135 },
  "250k-500k": { monthly: 299, annual: 2559 },
  "500k-1.25m": { monthly: 399, annual: 3419 },
  "1.25m-2m": { monthly: 499, annual: 4279 },
};

const STATE_STAMP_DUTY: Record<string, number> = {
  VIC: 200,
  NSW: 750,
  NT: 20,
};

const buildFamilyTrustPricing = (
  selections: SelectionsData,
  customer: CustomerData,
  baseFee: number
) => {
  // Read from selectedAddons array (as stored by FTStepAddons)
  const selectedAddons: string[] = customer.selectedAddons || [];
  const hasBN = selectedAddons.includes("business_name");
  const bnTerm = (customer.businessNameTerm || "1yr") as string;
  const businessNameTotal = hasBN
    ? 149 + (bnTerm === "3yr" ? 104 : 47)
    : 0;

  const gstFee = selectedAddons.includes("gst") ? 49 : 0;
  const registeredOfficeFee = selectedAddons.includes("registered_office") ? 220 : 0;

  const hasAccounting = selections.package === "registration_plus_accounting";
  const bracket = selections.revenueBracket || "100k-250k";
  const billing = selections.billingFrequency || "annual";
  const pricing = ACCOUNTING_PRICES[bracket] || { monthly: 0, annual: 0 };

  const accountingFee = hasAccounting
    ? billing === "monthly"
      ? pricing.monthly * 12
      : pricing.annual
    : 0;

  const payrollFee = customer.payrollEnabled
    ? (selections.staffCount || 1) * 165
    : 0;

  // State-based stamp duty (GST-free)
  const stampDutyState = customer.appointorState || "";
  const stampDutyFee = STATE_STAMP_DUTY[stampDutyState] || 0;

  const subtotal =
    baseFee +
    businessNameTotal +
    gstFee +
    registeredOfficeFee +
    accountingFee +
    payrollFee +
    stampDutyFee;

  const gst = Math.round((subtotal - stampDutyFee) * 0.1);
  const total = subtotal + gst;

  const annualSavings =
    hasAccounting && billing === "annual" && pricing.monthly > 0
      ? pricing.monthly * 12 - pricing.annual
      : 0;

  return {
    baseFee,
    businessNameTotal,
    gstFee,
    registeredOfficeFee,
    accountingFee,
    payrollFee,
    stampDutyFee,
    stampDutyState,
    subtotal,
    gst,
    total,
    annualSavings,
  };
};

/**
 * Check if we're returning from a failed/cancelled payment and have saved state.
 * Called once during initialization to restore customer data + step.
 */
function getRestoredCheckoutState(): { customer: CustomerData; selections: SelectionsData; currentStep: number } | null {
  try {
    const savedReturnUrl = sessionStorage.getItem("checkout_return_url");
    if (!savedReturnUrl) return null;

    const savedPath = new URL(savedReturnUrl, window.location.origin).pathname;
    if (savedPath !== window.location.pathname) return null;

    const raw = sessionStorage.getItem(`checkout_state_${window.location.pathname}`);
    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const CheckoutFlowProvider: React.FC<CheckoutFlowProviderProps> = ({
  children,
  initialServiceId = "business-name-registration",
  initialCategoryId = "setups-registrations",
}) => {
  const { packages: dynamicPackages } = usePricingPackages();
  const [searchParams] = useSearchParams();
  
  // Read URL params for initial state
  const urlPackage = searchParams.get('package');
  const urlStep = searchParams.get('step');
  const urlService = searchParams.get('service');

  // Check once for restored state (returning from failed payment)
  const [restoredState] = useState(() => getRestoredCheckoutState());
  
const serviceKey = useMemo((): PricingServiceKey => {
  // 1️⃣ Highest priority: iframe / query param
  if (urlService && urlService in dynamicPackages) {
    return urlService as PricingServiceKey;
  }

  // 2️⃣ WordPress slug fallback
  const pathname = window.location.pathname;
  const slug = pathname.split("/").filter(Boolean).pop();

  if (slug && SLUG_TO_SERVICE_KEY[slug]) {
    return SLUG_TO_SERVICE_KEY[slug];
  }

  // 3️⃣ HARD fallback (safe default)
  console.warn("⚠️ Service not resolved, defaulting to ABN");
  return "abn";
}, [urlService, dynamicPackages]);

  
  const [currentStep, setCurrentStep] = useState(() => {
    if (restoredState) return restoredState.currentStep ?? 0;
    // If step param exists and is valid, use it; otherwise start at 0
    if (urlStep) {
      const step = parseInt(urlStep, 10);
      if (step >= 0 && step <= 5) return step;
    }
    return 0;
  });
  
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [customer, setCustomer] = useState<CustomerData>(() => {
    return restoredState?.customer ?? defaultCustomer;
  });
  const [selections, setSelections] = useState<SelectionsData>(() => {
    if (restoredState?.selections) return restoredState.selections;
    // If package param exists, set it in initial selections
    if (urlPackage && (urlPackage === 'registration_only' || urlPackage === 'registration_plus_accounting')) {
      return { ...defaultSelections, package: urlPackage };
    }
    return defaultSelections;
  });

  // Clear the return URL flag after successful restoration (state auto-saves via useEffect below)
  useEffect(() => {
    if (restoredState) {
      sessionStorage.removeItem("checkout_return_url");
      // Don't clear checkout_state — the auto-save effect will keep it fresh
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save state to sessionStorage so it survives external redirects (Stripe)
  useEffect(() => {
    const key = `checkout_state_${window.location.pathname}`;
    try {
      sessionStorage.setItem(key, JSON.stringify({ customer, selections, currentStep }));
    } catch { /* quota exceeded — ignore */ }
  }, [customer, selections, currentStep]);

  // Get pricing package based on serviceKey from URL
  const pricingPackage = useMemo(() => dynamicPackages[serviceKey], [serviceKey, dynamicPackages]);

  // Service info from config for other details
  const service = useMemo(() => getServiceById(selectedServiceId), [selectedServiceId]);
  const category = useMemo(() => getCategoryById(selectedCategoryId), [selectedCategoryId]);
  
  const serviceName = service?.name ?? "Unknown Service";
  const categoryName = category?.name ?? "Unknown Category";
  // Use serviceFee from pricing config based on URL serviceKey
  const serviceFee = pricingPackage?.foundation?.price ?? 99;
  const showBusinessStructure = service?.showBusinessStructure ?? false;

  // ASIC fee based on term - only show after term is selected (step 2+)
  const asicFee = useMemo(() => {
    // Don't show ASIC fee until step 2 or later (registration term selection)
    if (currentStep < 2) return 0;
    const term = getTermById(selections.registrationTerm);
    return term?.asicFee ?? 0;
  }, [selections.registrationTerm, currentStep]);

  // Accounting fee calculation
  const accountingFee = useMemo(() => {
    if (selections.package !== "registration_plus_accounting") return 0;
    if (!selections.revenueBracket || !selections.accountingPlan || !selections.billingFrequency) return 0;
    
    return getPricing(
      selections.revenueBracket,
      selections.accountingPlan,
      selections.billingFrequency
    );
  }, [selections.package, selections.revenueBracket, selections.accountingPlan, selections.billingFrequency]);

  // Annual savings calculation
  const annualSavings = useMemo(() => {
    if (selections.package !== "registration_plus_accounting") return 0;
    if (!selections.revenueBracket || !selections.accountingPlan || selections.billingFrequency !== "annual") return 0;
    
    return getAnnualSavings(selections.revenueBracket, selections.accountingPlan);
  }, [selections.package, selections.revenueBracket, selections.accountingPlan, selections.billingFrequency]);

  // Payroll fee
  const payrollFee = useMemo(() => {
    if (!selections.payrollEnabled) return 0;
    return selections.staffCount * PAYROLL_PRICE_PER_STAFF;
  }, [selections.payrollEnabled, selections.staffCount]);

  // Calculate totals
  const totals = useMemo(() => {
    return calculateTotals({
      serviceFee,
      asicFee,
      accountingFee,
      payrollFee,
      annualSavings,
    });
  }, [serviceFee, asicFee, accountingFee, payrollFee, annualSavings]);

  const dynamicBaseFee = pricingPackage?.foundation?.price ?? 1199;
  const pricing = useMemo(() => {
  if (serviceKey !== "family_trust" && serviceKey !== "unit_trust") return null;
  return buildFamilyTrustPricing(selections, customer, dynamicBaseFee);
}, [serviceKey, selections, customer, dynamicBaseFee]);


  // Navigation
  const setStep = useCallback((step: number) => {
    if (step >= 0 && step <= 10) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 10) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Setters
  const setSelectedService = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
  }, []);

  const setSelectedCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const updateCustomer = useCallback((data: Partial<CustomerData>) => {
    setCustomer((prev) => ({ ...prev, ...data }));
  }, []);

  const updateSelections = useCallback((data: Partial<SelectionsData>) => {
    setSelections((prev) => ({ ...prev, ...data }));
  }, []);

  // Validation - based on dynamic form config fields
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1: {
        // Get form config for current service
        const formConfig = YOUR_DETAILS_FORMS[serviceKey];
        if (!formConfig) return false;
        
        // Check all required fields
        const requiredFields = formConfig.fields.filter(f => f.required);
        for (const field of requiredFields) {
          const value = customer[field.key as keyof CustomerData];
          
          // Skip file validation for now (file uploads handled separately)
          if (field.type === 'file') continue;
          
          // Check if value exists and is not empty
          if (value === undefined || value === null) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          if (typeof value === 'boolean' && !value) return false; // for declaration checkbox
        }
        return true;
      }
      case 2:
        return selections.registrationTerm !== "";
      case 3:
        if (selections.package === "") return false;
        if (selections.package === "registration_only") return true;
        return (
          selections.revenueBracket !== "" &&
          selections.billingFrequency !== null &&
          selections.accountingPlan !== ""
        );
      case 4:
        return true; // Payroll is always valid (can be none)
      case 5:
        return true;
      default:
        return false;
    }
  }, [customer, selections, serviceKey]);

  // Final payload
  const getSubmissionPayload = useCallback(() => {
    const term = getTermById(selections.registrationTerm);
    const plan = accountingPlans.find((p) => p.id === selections.accountingPlan);
    
    return {
      category: categoryName,
      service: {
        id: selectedServiceId,
        name: serviceName,
      },
      customer: { ...customer }, // Include all dynamic customer fields
      selections: {
        registrationTerm: selections.registrationTerm,
        registrationTermLabel: term?.label ?? "",
        package: selections.package,
        revenueBracket: selections.package === "registration_plus_accounting" ? selections.revenueBracket : null,
        billingFrequency: selections.package === "registration_plus_accounting" ? selections.billingFrequency : null,
        accountingPlan: selections.package === "registration_plus_accounting" ? selections.accountingPlan : null,
        accountingPlanName: plan?.name ?? null,
        payroll: {
          enabled: selections.payrollEnabled,
          staffCount: selections.payrollEnabled ? selections.staffCount : 0,
        },
      },
      totals: {
        serviceFee: totals.serviceFee,
        asicFee: totals.asicFee,
        accountingFee: totals.accountingFee,
        payrollFee: totals.payrollFee,
        subtotalExGst: totals.subtotalExGst,
        gst: totals.gst,
        totalIncGst: totals.totalIncGst,
      },
    };
  }, [
    categoryName,
    selectedServiceId,
    serviceName,
    customer,
    selections,
    showBusinessStructure,
    totals,
  ]);

  const value: CheckoutContextValue = {
    currentStep,
    selectedServiceId,
    selectedCategoryId,
    customer,
    selections,
    setStep,
    nextStep,
    prevStep,
    setSelectedService,
    setSelectedCategory,
    updateCustomer,
    updateSelections,
    serviceName,
    categoryName,
    serviceFee,
    asicFee,
    accountingFee,
    payrollFee,
    annualSavings,
    totals,
    showBusinessStructure,
    serviceKey,
    isStepValid,
    getSubmissionPayload,
    pricing,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
