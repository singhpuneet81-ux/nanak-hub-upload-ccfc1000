import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ADDON_PRICES,
  BusinessNameTerm,
  getBusinessNamePrice,
} from "../abn/pricing";
import { BusinessNameAddonCard, type BNTerm } from "../shared/BusinessNameAddonCard";

interface AddOn {
  id: string;
  title: string;
  price: number;
  description: string;
  whyNeeded: string;
}

const ADD_ONS: AddOn[] = [
  {
    id: "registered_office",
    title: "Registered Office Address",
    price: ADDON_PRICES.registered_office,
    description:
      "Use our professional business address for your GST registration and official correspondence",
    whyNeeded:
      "Protect your privacy by keeping your home address off public records. Receive all ATO correspondence at a professional business address with mail forwarding included.",
  },
];

export const GSTStepAddons: React.FC = () => {
  const { nextStep, prevStep, updateCustomer, customer } = useCheckout();

  const selectedAddons: string[] = customer.selectedAddons || [];
  const businessName = customer.proposedBusinessName || "";
  const businessNameTerm = (customer.businessNameTerm || "1yr") as BusinessNameTerm;
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    const current = customer.selectedAddons || [];
    const updated = current.includes(id)
      ? current.filter((a: string) => a !== id)
      : [...current, id];
    updateCustomer({ selectedAddons: updated });
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="content-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Optional Add-Ons</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enhance your GST registration with these optional services
          </p>
        </div>

        <div className="space-y-4">
          {/* Register Business Name Addon */}
          <BusinessNameAddonCard
            isSelected={selectedAddons.includes("business_name")}
            onToggle={() => toggleAddon("business_name")}
            proposedName={businessName}
            onNameChange={(name) => updateCustomer({ proposedBusinessName: name })}
            term={(businessNameTerm === "1yr" || businessNameTerm === "3yr" ? businessNameTerm : "1yr") as BNTerm}
            onTermChange={(t) => updateCustomer({ businessNameTerm: t })}
          />

          {/* Other Addons */}
          {ADD_ONS.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);
            const isExpanded = expandedCards.includes(addon.id);

            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={cn(
                  "border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer",
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
                      <h3 className="font-semibold text-foreground">{addon.title}</h3>
                      <span className="text-lg font-bold text-foreground whitespace-nowrap">${addon.price}/yr</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(addon.id); }}
                      className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Why you need this:
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
        </div>
      </div>

      {/* Buttons */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={nextStep} className="flex-1">
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};

export default GSTStepAddons;
