import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { Check, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const BARE_TRUST_FEATURES = [
  "Bare Trust Deed preparation",
  "LRBA documentation",
  "Trust resolutions",
  "Trustee appointment forms",
  "ABN registration (if required)",
  "Compliance guide",
];

export const SMSFStepAddons: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();
  const bareTrustSelected = customer.smsfBareTrust || false;
  const [expanded, setExpanded] = useState(false);

  const toggleBareTrust = () => {
    updateCustomer({ smsfBareTrust: !bareTrustSelected });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <h2 className="text-2xl font-bold text-foreground mb-1">Optional Add-ons</h2>
        <p className="text-muted-foreground">Enhance your SMSF setup with these optional services</p>
      </div>

      {/* Bare Trust Add-on */}
      <div
        onClick={toggleBareTrust}
        className={cn(
          "content-card cursor-pointer transition-all border-2",
          bareTrustSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/30"
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); toggleBareTrust(); }}
            className={cn(
              "w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
              bareTrustSelected
                ? "bg-primary border-primary"
                : "border-muted-foreground/40 hover:border-primary"
            )}
          >
            {bareTrustSelected && <Check className="w-4 h-4 text-white" />}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">Bare Trust / Holding Trust</h3>
              <div className="text-right">
                <span className="text-muted-foreground line-through text-sm mr-2">$2000</span>
                <span className="text-xl font-bold text-foreground">$1500</span>
                <p className="text-sm font-medium text-[hsl(142_71%_35%)]">Save $500</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Required for property purchases via LRBA</p>

            {/* Why do I need this */}
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              Why do I need this?
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && (
              <div className="mt-3 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <p>
                  If your SMSF intends to acquire property using a <strong>Limited Recourse Borrowing Arrangement (LRBA)</strong>, a separate Bare Trust/Holding Trust structure must be established.
                </p>
                <ul className="mt-3 space-y-1.5 list-disc list-inside">
                  <li>Required by ATO for SMSF property borrowing</li>
                  <li>Holds property title during loan period</li>
                  <li>Protects SMSF assets if loan defaults</li>
                  <li>Separate trust deed and documentation</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bundle Discount */}
        {bareTrustSelected && (
          <div className="mt-4 bg-[hsl(142_76%_94%)] rounded-lg p-4 flex items-start gap-3">
            <span className="text-lg">✨</span>
            <div>
              <p className="text-sm font-semibold text-[hsl(142_71%_35%)]">Bundle Discount Applied!</p>
              <p className="text-sm text-[hsl(142_71%_45%)]">
                You're saving $500 by bundling the Bare Trust with your SMSF setup (normally $2000 standalone).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* What's Included in Bare Trust */}
      {bareTrustSelected && (
        <div className="content-card">
          <h3 className="font-semibold text-foreground mb-3">What's Included in Bare Trust Setup:</h3>
          <div className="grid grid-cols-2 gap-2">
            {BARE_TRUST_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-[hsl(142_71%_35%)] shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={prevStep} className="sm:w-48">
          Back to Member Details
        </BackButton>
        <PrimaryButton onClick={nextStep} className="flex-1">
          Continue to Payment
        </PrimaryButton>
      </div>
    </div>
  );
};
