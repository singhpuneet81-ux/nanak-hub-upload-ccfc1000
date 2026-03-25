import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { registrationTerms } from "@/config/terms.config";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { ADDON_PRICES } from "../abn/pricing";
import { usePricingPackages } from "@/hooks/usePricingPackages";

interface AddOn {
  id: "gst" | "registered_office";
  title: string;
  price: number;
  description: string;
  whyNeeded: string;
  recommended?: boolean;
}

const ADD_ONS: AddOn[] = [
  {
    id: "gst",
    title: "GST Registration",
    price: ADDON_PRICES.gst,
    description: "Register for Goods and Services Tax with the ATO",
    whyNeeded:
      "Required if your business turnover exceeds $75,000 annually or if you want to claim GST credits on purchases.",
    recommended: true,
  },
  {
    id: "registered_office",
    title: "Registered Office Address Service",
    price: ADDON_PRICES.registered_office,
    description: "Use our address as your official business address",
    whyNeeded:
      "Protects your privacy by keeping your home address off public registers and meets ASIC requirements.",
  },
];

export const BNStepRegistrationTerm: React.FC = () => {
  const {
    selections,
    updateSelections,
    nextStep,
    prevStep,
    customer,
    updateCustomer,
  } = useCheckout();
  const { packages } = usePricingPackages();
  const bnServiceFee = packages.business_name.foundation.price;

  const selectedAddons: string[] = customer.selectedAddons || [];
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    const updated = selectedAddons.includes(id)
      ? selectedAddons.filter((a) => a !== id)
      : [...selectedAddons, id];

    updateCustomer({ selectedAddons: updated });
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selections.registrationTerm) {
      nextStep();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Add Services & Choose Registration Term
        </h2>
        <p className="text-muted-foreground mt-1">
          Optional add-ons, then select how long you'd like to register your business name
        </p>
      </div>

      {/* INFO BANNER */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <p className="text-sm text-blue-800">
          These add-ons help with compliance and privacy. All are optional.
        </p>
      </div>

      {/* ADD-ONS (ABN EXACT UI) */}
      <div className="space-y-4">
        {ADD_ONS.map((addon) => {
          const isSelected = selectedAddons.includes(addon.id);
          const isExpanded = expandedCards.includes(addon.id);

          return (
            <div
              key={addon.id}
              onClick={() => toggleAddon(addon.id)}
              className={cn(
                "border rounded-xl p-4 transition-all cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAddon(addon.id);
                  }}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {addon.title}
                      </h3>
                      {addon.recommended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <Sparkles className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-foreground">
                      ${addon.price}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {addon.description}
                  </p>

                  {/* Expand */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(addon.id);
                    }}
                    className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
                  >
                    Why do I need this?
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      {addon.whyNeeded}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTER BUSINESS NAME — addon-card style */}
      {(() => {
        const bnSelected = true; // always selected in BN flow
        const proposedName = customer.proposedBusinessName || "";
        const selectedTerm = selections.registrationTerm;

        return (
          <div
            className={cn(
              "border-2 rounded-xl p-4 transition-all",
              "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox (always checked) */}
              <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-1 bg-primary border-primary">
                <Check className="w-3 h-3 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">Register Business Name</h3>
                  <span className="text-lg font-bold text-foreground whitespace-nowrap">${bnServiceFee}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Secure your business name with ASIC registration (required if trading under a name different from your ABN)
                </p>

                {/* Expanded fields */}
                <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                  {/* Proposed Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Proposed Business Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={proposedName}
                      onChange={(e) => updateCustomer({ proposedBusinessName: e.target.value })}
                      placeholder="Enter your proposed business name"
                      className="w-full h-11 px-4 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Registration Term */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Registration Term <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {registrationTerms.map((term) => {
                        const isTermSelected = selectedTerm === term.id;
                        const totalPrice = term.asicFee;
                        const is3Year = term.id === "3_year";

                        return (
                          <button
                            key={term.id}
                            type="button"
                            onClick={() => updateSelections({ registrationTerm: term.id })}
                            className={cn(
                              "relative p-4 rounded-xl border-2 text-left transition-all",
                              isTermSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">
                                {term.id === "1_year" ? "1 Year" : "3 Years"}
                              </p>
                              {is3Year && (
                                <span className="text-xs font-bold text-green-600">SAVE $100</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              ${totalPrice} (ASIC Fee)
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Navigation */}
      <div className="checkout-nav flex gap-4">
        <button
          onClick={prevStep}
          className="flex-1 h-12 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selections.registrationTerm}
          className="flex-1 h-12 bg-[hsl(var(--cta))] hover:bg-[hsl(var(--cta))]/90 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          Continue to Plan Selection
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
