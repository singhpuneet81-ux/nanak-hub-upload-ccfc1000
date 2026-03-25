import { ServiceConfig, AccountingPackage } from "@/types/services";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

interface StepPackagesProps {
  config: ServiceConfig;
  selectedPackageType: "registration_only" | "registration_and_accounting";
  selectedAccountingPackage: string | null;
  selectedAddOns: string[];
  onPackageTypeChange: (type: "registration_only" | "registration_and_accounting") => void;
  onAccountingPackageChange: (id: string | null) => void;
  onToggleAddOn: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepPackages = ({
  config,
  selectedPackageType,
  selectedAccountingPackage,
  selectedAddOns,
  onPackageTypeChange,
  onAccountingPackageChange,
  onToggleAddOn,
  onNext,
  onPrev,
}: StepPackagesProps) => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Package Type Selection */}
      <div className="checkout-card">
        <h2 className="text-xl font-heading font-bold text-foreground mb-4">
          Choose Your Package
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onPackageTypeChange("registration_only")}
            className={`checkout-card text-left cursor-pointer ${
              selectedPackageType === "registration_only" ? "checkout-card-selected" : ""
            }`}
          >
            <h3 className="font-heading font-semibold text-foreground">Registration Only</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {config.displayName} setup only
            </p>
            <p className="price-tag mt-3">${config.foundationPrice}</p>
            {config.govtFee ? (
              <p className="text-xs text-muted-foreground mt-1">
                + ${config.govtFee} govt fee
              </p>
            ) : null}
          </button>

          <button
            onClick={() => onPackageTypeChange("registration_and_accounting")}
            className={`checkout-card text-left cursor-pointer ${
              selectedPackageType === "registration_and_accounting"
                ? "checkout-card-selected"
                : ""
            }`}
          >
            <h3 className="font-heading font-semibold text-foreground">
              Registration + Accounting
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Setup + ongoing accounting support
            </p>
            <p className="price-tag mt-3">
              ${config.foundationPrice}
              <span className="text-sm font-normal text-muted-foreground"> + monthly</span>
            </p>
          </button>
        </div>
      </div>

      {/* Accounting Packages */}
      {selectedPackageType === "registration_and_accounting" && (
        <div className="checkout-card animate-fade-in">
          <h3 className="text-lg font-heading font-bold text-foreground mb-4">
            Select Accounting Package
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.accountingPackages.map((pkg) => (
              <AccountingCard
                key={pkg.id}
                pkg={pkg}
                selected={selectedAccountingPackage === pkg.id}
                onSelect={() => onAccountingPackageChange(pkg.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {config.addOns.length > 0 && (
        <div className="checkout-card">
          <h3 className="text-lg font-heading font-bold text-foreground mb-4">
            Optional Add-ons
          </h3>
          <div className="space-y-3">
            {config.addOns.map((addon) => (
              <button
                key={addon.id}
                onClick={() => onToggleAddOn(addon.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedAddOns.includes(addon.id)
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedAddOns.includes(addon.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selectedAddOns.includes(addon.id) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{addon.name}</p>
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  </div>
                </div>
                <span className="font-heading font-bold text-primary">
                  ${addon.price}
                  {addon.recurring && (
                    <span className="text-xs font-normal text-muted-foreground">/yr</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev} size="lg">
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Review & Pay
        </Button>
      </div>
    </div>
  );
};

function AccountingCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: AccountingPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`checkout-card text-left cursor-pointer relative ${
        selected ? "checkout-card-selected" : ""
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" /> Popular
        </div>
      )}
      <h4 className="font-heading font-bold text-foreground text-lg">{pkg.name}</h4>
      <p className="price-tag mt-2">
        ${pkg.monthlyPrice}
        <span className="text-sm font-normal text-muted-foreground">/month</span>
      </p>
      <ul className="mt-4 space-y-2">
        {pkg.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}

export default StepPackages;
