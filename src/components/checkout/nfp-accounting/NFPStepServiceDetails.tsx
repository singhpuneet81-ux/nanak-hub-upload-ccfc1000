import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const ADDONS = [
  {
    id: "payroll_processing",
    label: "Payroll Processing",
    sub: "From $96/employee/year",
  },
  {
    id: "grant_management",
    label: "Advanced Grant Management",
    sub: "$500 per grant (one-time per grant)",
  },
  {
    id: "tax_return",
    label: "Association Tax Return",
    sub: "$400/year (if income tax lodgement required)",
  },
  {
    id: "fbt_return",
    label: "FBT Return",
    sub: "$600/year (if providing employee benefits)",
  },
];

const CATCH_UP_ITEMS = [
  "Financial records review & reconciliation",
  "Data clean-up and organization",
  "Compliance assessment",
  "Smooth transition to current year",
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const NFPStepServiceDetails: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [hasAccountant, setHasAccountant] = useState(!!customer.nfpHasAccountant);
  const [needsCatchUp, setNeedsCatchUp] = useState(!!customer.nfpNeedsCatchUp);
  const additionalServices = (customer.nfpAdditionalServices as string[]) || [];

  const toggleAddon = (id: string) => {
    const updated = additionalServices.includes(id)
      ? additionalServices.filter((s: string) => s !== id)
      : [...additionalServices, id];
    updateCustomer({ nfpAdditionalServices: updated });
  };

  const handleContinue = () => {
    updateCustomer({
      nfpHasAccountant: hasAccountant,
      nfpNeedsCatchUp: needsCatchUp,
    });
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Service Details</h2>
        <p className="text-muted-foreground mt-1">Customize your package with optional add-ons</p>
      </div>

      {/* Optional Add-ons */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Optional Add-ons</h3>
        <div className="space-y-3">
          {ADDONS.map((addon) => {
            const isChecked = additionalServices.includes(addon.id);
            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-5 transition-all flex items-start gap-4",
                  isChecked
                    ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.02)]"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleAddon(addon.id)}
                  className="mt-0.5"
                />
                <div className="flex items-start gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{addon.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{addon.sub}</p>
                  </div>
                  <Info size={14} className="text-muted-foreground/50 mt-1 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* We currently have an accountant */}
      <button
        type="button"
        onClick={() => setHasAccountant(!hasAccountant)}
        className={cn(
          "w-full text-left rounded-xl border p-5 transition-all",
          hasAccountant
            ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.02)]"
            : "border-border hover:border-muted-foreground/30"
        )}
      >
        <div className="flex items-start gap-4">
          <Checkbox
            checked={hasAccountant}
            onCheckedChange={(c) => setHasAccountant(!!c)}
            className="mt-0.5"
          />
          <div>
            <p className="font-semibold text-foreground">We currently have an accountant</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              We'll help you transition smoothly from your current provider
            </p>
          </div>
        </div>
      </button>

      {/* Our books need catching up */}
      <button
        type="button"
        onClick={() => setNeedsCatchUp(!needsCatchUp)}
        className={cn(
          "w-full text-left rounded-xl border p-5 transition-all",
          needsCatchUp
            ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.02)]"
            : "border-border hover:border-muted-foreground/30"
        )}
      >
        <div className="flex items-start gap-4">
          <Checkbox
            checked={needsCatchUp}
            onCheckedChange={(c) => setNeedsCatchUp(!!c)}
            className="mt-0.5"
          />
          <div>
            <p className="font-semibold text-foreground">Our books need catching up</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              We'll review and clean up your historical records (+$600)
            </p>
          </div>
        </div>

        {needsCatchUp && (
          <div className="mt-4 ml-9 bg-[hsl(var(--cta)/0.03)] border border-[hsl(var(--cta)/0.15)] rounded-lg p-4">
            <p className="font-semibold text-foreground text-sm mb-2">Catch-Up Pack includes:</p>
            <ul className="space-y-1">
              {CATCH_UP_ITEMS.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </button>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors sm:w-auto sm:min-w-[140px]"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue to Payment <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
