import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePricingPackages } from "@/hooks/usePricingPackages";

export const GSTStepPackage: React.FC = () => {
  const { nextStep, prevStep, updateSelections, selections } = useCheckout();
  const { packages } = usePricingPackages();
  const pricing = packages.gst;

  const selectedPackage = selections.package;

  const handlePackageSelect = (
    packageType: "registration_only" | "registration_plus_accounting"
  ) => {
    updateSelections({ package: packageType });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="content-card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Choose Your Package</h2>
          <p className="text-muted-foreground mt-1">
            Select registration only or add ongoing accounting services
          </p>
        </div>

        {/* Info box */}
        <div className="bg-accent/50 border border-accent rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p>
              <strong>Registration Only:</strong> You have an accountant or will handle BAS yourself
            </p>
            <p>
              <strong>Registration + Accounting:</strong> Get everything handled – GST registration,
              quarterly BAS, compliance (95% choose this)
            </p>
          </div>
        </div>

        {/* Two-card grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Only */}
          <div
            onClick={() => handlePackageSelect("registration_only")}
            className={cn(
              "border rounded-xl p-5 cursor-pointer transition-all relative flex flex-col",
              selectedPackage === "registration_only"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {selectedPackage === "registration_only" && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <h3 className="font-bold text-base text-foreground">Registration Only</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold text-foreground">${pricing.foundation.price}</span>
              <span className="text-sm text-muted-foreground ml-1">One time fee</span>
            </div>
            <ul className="space-y-2 mt-4 flex-grow">
              {pricing.foundation.features.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Registration + Accounting */}
          <div
            onClick={() => handlePackageSelect("registration_plus_accounting")}
            className={cn(
              "border-2 rounded-xl p-5 cursor-pointer transition-all relative flex flex-col",
              selectedPackage === "registration_plus_accounting"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-primary/60 bg-primary/5 hover:border-primary"
            )}
          >
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded tracking-wide">
              Best Value
            </span>
            {selectedPackage === "registration_plus_accounting" && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <h3 className="font-bold text-base text-foreground mt-2">Complete Package</h3>
            <p className="text-xs text-muted-foreground">Registration + Annual Compliance</p>
            <div className="mt-2">
              <span className="text-3xl font-bold text-foreground">$4,109</span>
              <span className="text-sm text-muted-foreground ml-1">/year</span>
            </div>
            <ul className="space-y-2 mt-4 flex-grow">
              <li className="flex gap-2.5 text-sm font-medium text-foreground">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                Everything in Registration Only
              </li>
              {pricing.accounting.includes.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
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

export default GSTStepPackage;
