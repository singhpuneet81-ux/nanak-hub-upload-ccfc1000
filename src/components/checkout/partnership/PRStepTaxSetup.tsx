import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { FileText, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const PRStepTaxSetup: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
  };

  const YesNoToggle = ({
    label,
    helperText,
    value,
    onChange,
  }: {
    label: string;
    helperText: string;
    value: string;
    onChange: (val: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="form-label">{label}</label>
      <p className="text-xs text-muted-foreground">{helperText}</p>
      <div className="grid grid-cols-2 gap-3">
        {["yes", "no"].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              "h-12 rounded-lg border-2 font-medium transition-all text-sm",
              value === val
                ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.08)] text-[hsl(var(--cta))]"
                : "border-border bg-card text-foreground hover:border-primary/30"
            )}
          >
            {val === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Tax Registrations</h3>
            <p className="text-sm text-muted-foreground">Core ATO registration requirements</p>
          </div>
        </div>

        {/* Info */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Tax Registration Elections
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Select which core ATO registrations you need. We'll handle all lodgements and processing for you.
          </p>
        </div>

        <div className="space-y-6">
          <YesNoToggle
            label="Apply for an ABN (Australian Business Number)?"
            helperText="Required to operate a business in Australia"
            value={customer.prApplyABN || "yes"}
            onChange={(val) => handleChange("prApplyABN", val)}
          />

          <YesNoToggle
            label="Apply for a TFN (Tax File Number) for the partnership?"
            helperText="Used for tax reporting purposes"
            value={customer.prApplyTFN || "yes"}
            onChange={(val) => handleChange("prApplyTFN", val)}
          />

          <YesNoToggle
            label="Register for PAYG Withholding?"
            helperText="Required if you plan to hire employees"
            value={customer.prPaygWithholding || "no"}
            onChange={(val) => handleChange("prPaygWithholding", val)}
          />
        </div>

        {/* Additional Services note */}
        <div className="border-l-4 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-r-xl p-4 mt-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-[hsl(var(--cta))]" />
            Additional Services
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            GST registration, business name registration, and business address services are available as add-ons in the next step.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={nextStep} className="flex-1">
          Continue to Add-ons
        </PrimaryButton>
      </div>
    </div>
  );
};
