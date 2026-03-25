import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, Info, Shield, Building2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessNameAddonCard, BNTerm } from "@/components/checkout/shared/BusinessNameAddonCard";

interface CRStepAddonsProps {
  onNext: () => void;
  onBack: () => void;
}

export const CRStepAddons: React.FC<CRStepAddonsProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const businessNameEnabled = !!customer.crAddonBusinessName;
  const gstEnabled = !!customer.crAddonGST;
  const registeredOfficeEnabled = !!customer.crAddonRegisteredOffice;
  const proposedBusinessName = (customer.crProposedBusinessName as string) || "";
  const businessNameTerm = ((customer.crBusinessNameTerm as string) || "1yr") as BNTerm;

  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const toggleAddon = (key: string) => {
    updateCustomer({ [key]: !customer[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Registration Add-ons</h2>
        <p className="text-muted-foreground mt-1">Optional services to complete your company setup</p>
      </div>

      {/* Add-on Cards */}
      <div className="space-y-4">
        {/* Business Name — shared consistent card */}
        <BusinessNameAddonCard
          isSelected={businessNameEnabled}
          onToggle={() => toggleAddon("crAddonBusinessName")}
          proposedName={proposedBusinessName}
          onNameChange={(name) => updateCustomer({ crProposedBusinessName: name })}
          term={businessNameTerm}
          onTermChange={(t) => updateCustomer({ crBusinessNameTerm: t })}
        />

        {/* GST Registration */}
        <div
          onClick={() => toggleAddon("crAddonGST")}
          className={cn(
            "border-2 rounded-xl p-5 transition-all cursor-pointer",
            gstEnabled ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
          )}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); toggleAddon("crAddonGST"); }}
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                gstEnabled ? "bg-primary border-primary" : "border-muted-foreground/40"
              )}
            >
              {gstEnabled && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <h3 className="font-semibold text-foreground">GST Registration</h3>
                </div>
                <span className="text-lg font-bold text-foreground whitespace-nowrap">$49</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Register for Goods & Services Tax (GST) with the ATO</p>
              {expandedInfo === "gst" && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  GST registration is mandatory if your business has a turnover of $75,000 or more. Even if below, registering allows you to claim GST credits on business purchases.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registered Office Address */}
        <div
          onClick={() => toggleAddon("crAddonRegisteredOffice")}
          className={cn(
            "border-2 rounded-xl p-5 transition-all cursor-pointer",
            registeredOfficeEnabled ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
          )}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); toggleAddon("crAddonRegisteredOffice"); }}
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                registeredOfficeEnabled ? "bg-primary border-primary" : "border-muted-foreground/40"
              )}
            >
              {registeredOfficeEnabled && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-primary" />
                  <h3 className="font-semibold text-foreground">Registered Office Address</h3>
                </div>
                <span className="text-lg font-bold text-foreground whitespace-nowrap">$220 / year</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Use our professional office address as your registered office</p>
              {(expandedInfo === "office" || registeredOfficeEnabled) && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border text-sm">
                  <p className="font-medium text-foreground mb-1">Why use our registered office?</p>
                  <p className="text-muted-foreground">
                    Every company needs a registered office address in Australia where ASIC can send official documents.
                    Using our professional address keeps your home address private and ensures you never miss important notices.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Includes:</strong> Mail handling, document forwarding, ASIC compliance, professional CBD address
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional notice */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-start gap-3">
        <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground text-sm">These add-ons are completely optional</p>
          <p className="text-sm text-muted-foreground mt-1">
            You can skip all of these and proceed with just your company registration. You can always add these services later if needed.
          </p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>✓ No hidden fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 100% refund guarantee</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue to Package →
        </button>
      </div>
    </div>
  );
};
