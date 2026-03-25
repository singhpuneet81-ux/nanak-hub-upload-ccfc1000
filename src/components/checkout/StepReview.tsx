import { ServiceConfig, CheckoutState, PricingSummary } from "@/types/services";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface StepReviewProps {
  config: ServiceConfig;
  state: CheckoutState;
  pricingSummary: PricingSummary;
  onPrev: () => void;
  onSubmit: () => void;
}

const StepReview = ({ config, state, pricingSummary, onPrev, onSubmit }: StepReviewProps) => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Personal Details Review */}
      <div className="checkout-card">
        <h2 className="text-xl font-heading font-bold text-foreground mb-4">
          Review Your Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.formFields.map((field) => {
            const value = state.formData[field.name];
            if (!value) return null;

            // Resolve display value for selects
            let displayValue = value;
            if (field.type === "select" && field.options) {
              const opt = field.options.find((o) => o.value === value);
              if (opt) displayValue = opt.label;
            }

            return (
              <div key={field.name}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {field.label}
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5">{displayValue}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="checkout-card">
        <h2 className="text-xl font-heading font-bold text-foreground mb-4">
          Pricing Summary
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{config.displayName}</span>
            <span className="font-medium text-foreground">${pricingSummary.registrationFee}</span>
          </div>

          {pricingSummary.govtFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Government Fee</span>
              <span className="font-medium text-foreground">${pricingSummary.govtFee}</span>
            </div>
          )}

          {state.selectedAddOns.map((addonId) => {
            const addon = config.addOns.find((a) => a.id === addonId);
            if (!addon) return null;
            return (
              <div key={addonId} className="flex justify-between">
                <span className="text-muted-foreground">{addon.name}</span>
                <span className="font-medium text-foreground">${addon.price}</span>
              </div>
            );
          })}

          <Separator />

          <div className="flex justify-between">
            <span className="font-heading font-bold text-foreground text-lg">
              Total Due Today
            </span>
            <span className="price-tag">${pricingSummary.total}</span>
          </div>

          {pricingSummary.accountingMonthly > 0 && (
            <div className="flex justify-between bg-muted/50 rounded-lg p-3 mt-2">
              <span className="text-muted-foreground">
                Ongoing Monthly (
                {config.accountingPackages.find(
                  (p) => p.id === state.selectedAccountingPackage
                )?.name ?? ""}
                )
              </span>
              <span className="font-heading font-bold text-secondary">
                ${pricingSummary.accountingMonthly}/mo
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev} size="lg">
          Back
        </Button>
        <Button onClick={onSubmit} size="lg" className="bg-secondary hover:bg-secondary/90">
          Submit & Pay
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
