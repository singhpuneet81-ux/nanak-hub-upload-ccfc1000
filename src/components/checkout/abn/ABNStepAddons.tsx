import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { Check, Info, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADDON_PRICES } from "./pricing";
import { BusinessNameAddonCard, BNTerm } from "@/components/checkout/shared/BusinessNameAddonCard";

interface AddOn {
  id: string;
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
      "Required if your business turnover exceeds $75,000 annually, or if you want to claim GST credits on business purchases. Most businesses benefit from early GST registration.",
    recommended: true,
  },
  {
    id: "registered_office",
    title: "Registered Office Address Service",
    price: ADDON_PRICES.registered_office,
    description: "Use our address as your official business address",
    whyNeeded:
      "Protects your privacy by keeping your home address off public registers. Professional address for all official correspondence and legal documents.",
  },
];

export const ABNStepAddons: React.FC = () => {
  const { nextStep, prevStep, updateCustomer, customer } = useCheckout();
  const selectedAddons: string[] = customer.selectedAddons || [];
  const businessName = customer.proposedBusinessName || "";
  const businessNameTerm = (customer.businessNameTerm || "1yr") as BNTerm;

  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    const current = customer.selectedAddons || [];
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    updateCustomer({ selectedAddons: updated });
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="content-card animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Add-on Services</h2>
        <p className="text-muted-foreground mt-1">
          Enhance your ABN registration with optional services (all optional)
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Need help deciding? These are common add-ons that save time and ensure compliance.
        </p>
      </div>

      {/* Add-on Cards */}
      <div className="space-y-4">
        {ADD_ONS.map((addon) => {
          const isSelected = selectedAddons.includes(addon.id);
          const isExpanded = expandedCards.includes(addon.id);

          return (
            <div
              key={addon.id}
              onClick={() => toggleAddon(addon.id)}
              className={cn(
                "border rounded-xl p-4 transition-all duration-200 cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleAddon(addon.id); }}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{addon.title}</h3>
                      {addon.recommended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <Sparkles className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-foreground whitespace-nowrap">${addon.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(addon.id); }}
                    className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
                  >
                    Why do I need this?
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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

        {/* Business Name — shared consistent card */}
        <BusinessNameAddonCard
          isSelected={selectedAddons.includes("business_name")}
          onToggle={() => toggleAddon("business_name")}
          proposedName={businessName}
          onNameChange={(name) => updateCustomer({ proposedBusinessName: name })}
          term={businessNameTerm}
          onTermChange={(t) => updateCustomer({ businessNameTerm: t })}
        />
      </div>

      {/* Buttons - desktop only, mobile uses unified bottom bar */}
      <div className="hidden md:flex gap-3 mt-8">
        <BackButton onClick={prevStep} className="w-32" />
        <PrimaryButton onClick={nextStep} className="flex-1">
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};
