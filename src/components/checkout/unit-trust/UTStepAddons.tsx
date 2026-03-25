import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Info, Check } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BusinessNameAddonCard, BNTerm } from "@/components/checkout/shared/BusinessNameAddonCard";

interface UTStepAddonsProps {
  onNext: () => void;
  onBack: () => void;
}

export const UTStepAddons: React.FC<UTStepAddonsProps> = ({
  onNext,
  onBack,
}) => {
  const { customer, updateCustomer } = useCheckout();

  const [businessNameAddon, setBusinessNameAddon] = useState(
    customer?.businessNameAddon || false
  );
  const [businessNameTerm, setBusinessNameTerm] = useState<BNTerm>(
    (customer?.businessNameTerm as BNTerm) || "1yr"
  );
  const [proposedBusinessName, setProposedBusinessName] = useState(
    customer?.proposedBusinessName || ""
  );
  const [gstAddon, setGstAddon] = useState(customer?.gstAddon || false);
  const [registeredOfficeAddon, setRegisteredOfficeAddon] = useState(
    customer?.registeredOfficeAddon || false
  );

  useEffect(() => {
    updateCustomer({
      businessNameAddon,
      businessNameTerm,
      proposedBusinessName,
      gstAddon,
      registeredOfficeAddon,
    });
  }, [businessNameAddon, businessNameTerm, proposedBusinessName, gstAddon, registeredOfficeAddon]);

  const gstFee = 49;
  const registeredOfficeFee = 220;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Optional Add-ons
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enhance your trust setup with these additional services
        </p>
      </div>

      {/* Add-on Cards */}
      <div className="space-y-4">
        {/* Business Name Registration */}
        <BusinessNameAddonCard
          isSelected={businessNameAddon}
          onToggle={() => setBusinessNameAddon(!businessNameAddon)}
          proposedName={proposedBusinessName}
          onNameChange={setProposedBusinessName}
          term={businessNameTerm}
          onTermChange={setBusinessNameTerm}
        />

        {/* GST Registration */}
        <div
          className={`p-5 rounded-xl border-2 transition-all ${
            gstAddon ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="gst"
              checked={gstAddon}
              onCheckedChange={(checked) => setGstAddon(checked === true)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="gst"
                  className="text-base font-semibold cursor-pointer"
                >
                  GST Registration
                </Label>
                <span className="text-lg font-bold text-foreground">
                  ${gstFee}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Register your trust for GST with the ATO
              </p>

              {gstAddon && (
                 <div className="mt-4">
                   <div className="p-3 bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg">
                     <div className="flex items-start gap-2">
                       <Info className="w-4 h-4 text-[hsl(var(--cta))] mt-0.5 flex-shrink-0" />
                       <div className="text-sm text-muted-foreground">
                         <p className="font-medium text-foreground">Why do I need this?</p>
                         <p className="mt-1">
                           Required if your trust's annual turnover is $75,000+
                          (or $150,000+ for non-profits). Allows you to claim
                          GST credits on business expenses.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registered Office Address */}
        <div
          className={`p-5 rounded-xl border-2 transition-all ${
            registeredOfficeAddon
              ? "border-primary bg-primary/5"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id="registeredOffice"
              checked={registeredOfficeAddon}
              onCheckedChange={(checked) =>
                setRegisteredOfficeAddon(checked === true)
              }
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="registeredOffice"
                  className="text-base font-semibold cursor-pointer"
                >
                  Professional Registered Office Address
                </Label>
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground">
                    ${registeredOfficeFee}
                  </span>
                  <p className="text-xs text-muted-foreground">per year</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use our Melbourne CBD address + mail handling service
              </p>

              {registeredOfficeAddon && (
                 <div className="mt-4">
                   <div className="p-3 bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg">
                     <div className="flex items-start gap-2">
                       <Info className="w-4 h-4 text-[hsl(var(--cta))] mt-0.5 flex-shrink-0" />
                       <div className="text-sm text-muted-foreground">
                         <p className="font-medium text-foreground">Why do I need this?</p>
                         <p className="mt-1">
                           Keep your home address private on public registers.
                          We'll handle and forward all official mail to you.
                          Professional image for your business!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button
          onClick={onBack}
          className="py-3 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onNext}
          className="py-3 bg-[hsl(var(--cta))] hover:opacity-90 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        >
          Continue to Package Selection
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
