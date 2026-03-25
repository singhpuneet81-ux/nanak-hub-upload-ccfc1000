import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { Check, Info, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADDON_PRICES } from "../abn/pricing";
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
    description: "Register the trust for GST with the ATO",
    whyNeeded:
      "Required if the trust's turnover exceeds $75,000 annually or if you wish to claim GST credits. Many trusts benefit from early GST registration.",
    recommended: true,
  },
  {
    id: "registered_office",
    title: "Registered Office Address",
    price: ADDON_PRICES.registered_office,
    description: "Professional address for ASIC & ATO correspondence",
    whyNeeded:
      "Keeps your residential address private and ensures all official mail is handled professionally.",
  },
];

interface FTStepAddonsProps {
  onNext: () => void;
  onBack: () => void;
}

export const FTStepAddons: React.FC<FTStepAddonsProps> = ({ onNext, onBack }) => {
  const { updateCustomer, customer } = useCheckout();

  const selectedAddons: string[] = customer.selectedAddons || [];
  const businessName = customer.proposedBusinessName || "";
  const businessNameTerm = (customer.businessNameTerm || "1yr") as BNTerm;

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

  return (
    <div className="content-card animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Add-on Services</h2>
        <p className="text-muted-foreground mt-1">
          Optional services to enhance your Family Trust setup
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          These add-ons are optional but commonly chosen to ensure compliance and save time later.
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

      {/* Buttons */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 mt-8">
        <BackButton onClick={onBack} className="sm:w-32" />
        <PrimaryButton onClick={onNext} className="flex-1">
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};
