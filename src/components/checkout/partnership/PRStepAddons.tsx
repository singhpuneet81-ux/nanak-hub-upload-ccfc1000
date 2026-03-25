import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { Star, Info, Check, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BusinessNameAddonCard, BNTerm } from "@/components/checkout/shared/BusinessNameAddonCard";

export const PRStepAddons: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
  };

  const gstSelected = customer.prGstAddon || false;
  const bnSelected = customer.prBusinessNameAddon || false;
  const addressSelected = customer.prBusinessAddressAddon || false;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--cta)/0.1)] flex items-center justify-center">
            <Star className="w-4 h-4 text-[hsl(var(--cta))]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Optional Add-on Services</h3>
            <p className="text-sm text-muted-foreground">Enhance your partnership setup</p>
          </div>
        </div>

        {/* Info */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Complete Your Setup
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Add essential services to get your partnership fully operational. These are optional and can be added now or requested separately later.
          </p>
        </div>
      </div>

      {/* GST Registration */}
      <div
        onClick={() => handleChange("prGstAddon", !gstSelected)}
        className={cn(
          "content-card cursor-pointer transition-all border-2",
          gstSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleChange("prGstAddon", !gstSelected); }}
            className={cn(
              "w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
              gstSelected ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
            )}
          >
            {gstSelected && <Check className="w-4 h-4 text-white" />}
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">GST Registration</h3>
              <span className="text-lg font-bold text-foreground">+$49</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Register for GST with the ATO. <strong>Mandatory if your annual turnover is $75,000+</strong>, or voluntary if under this threshold.
            </p>
          </div>
        </div>

        {/* GST Start Date (conditional) */}
        {gstSelected && (
          <div className="mt-4 ml-9" onClick={(e) => e.stopPropagation()}>
            <label className="form-label">
              GST Start Date <span className="text-destructive">*</span>
            </label>
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !customer.prGstStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customer.prGstStartDate || <span>dd-mm-yyyy</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={customer.prGstStartDate ? new Date(customer.prGstStartDate.split("-").reverse().join("-")) : undefined}
                  onSelect={(date) => handleChange("prGstStartDate", date ? format(date, "dd-MM-yyyy") : "")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Business Name Registration — shared consistent card */}
      <BusinessNameAddonCard
        isSelected={bnSelected}
        onToggle={() => handleChange("prBusinessNameAddon", !bnSelected)}
        proposedName={customer.prProposedBusinessName || ""}
        onNameChange={(name) => handleChange("prProposedBusinessName", name)}
        term={((customer.prBnTerm as string) === "3_year" ? "3yr" : "1yr") as BNTerm}
        onTermChange={(t) => handleChange("prBnTerm", t === "3yr" ? "3_year" : "1_year")}
      />

      {/* Business Address Service */}
      <div
        onClick={() => handleChange("prBusinessAddressAddon", !addressSelected)}
        className={cn(
          "content-card cursor-pointer transition-all border-2",
          addressSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleChange("prBusinessAddressAddon", !addressSelected); }}
            className={cn(
              "w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
              addressSelected ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
            )}
          >
            {addressSelected && <Check className="w-4 h-4 text-white" />}
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">Business Address Service</h3>
              <span className="text-lg font-bold text-foreground">+$250/year</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Professional business address for your partnership. Use our premium office address for your business registration, mail handling, and professional presence.
            </p>
            <div className="mt-3 space-y-1.5">
              {["Professional CBD address", "Mail forwarding & handling", "Enhanced business credibility"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-[hsl(142_71%_35%)] shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={nextStep} className="flex-1">
          Continue to Authorised Contact
        </PrimaryButton>
      </div>
    </div>
  );
};
