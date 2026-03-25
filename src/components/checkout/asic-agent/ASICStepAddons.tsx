import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const ASICStepAddons: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const officeEnabled = !!customer.asicAddonOffice;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Optional Add-ons</h2>
        <p className="text-muted-foreground mt-1">Enhance your service with these optional extras</p>
      </div>

      {/* Registered Office */}
      <div
        onClick={() => updateCustomer({ asicAddonOffice: !officeEnabled })}
        className={cn(
          "border-2 rounded-xl p-5 cursor-pointer transition-all",
          officeEnabled
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40"
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={officeEnabled}
            onCheckedChange={(checked) => updateCustomer({ asicAddonOffice: !!checked })}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Use Our Registered Office Address</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Professional business address for all ASIC correspondence
            </p>
            <p className="text-xl font-bold text-foreground mt-2">
              $300 <span className="text-sm font-normal text-muted-foreground">/year</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
