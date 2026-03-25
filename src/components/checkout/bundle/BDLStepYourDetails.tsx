import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { validateEmail, validatePhone } from "@/utils/validation";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { PrimaryButton } from "@/components/checkout/Buttons";
import { STATES } from "@/config/yourDetails.config";
import { cn } from "@/lib/utils";
import { Settings, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const BDLStepYourDetails: React.FC = () => {
  const { customer, updateCustomer, nextStep } = useCheckout();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const streams: string[] = customer.bdlStreams || [];
  const hasAbn = streams.includes("abn");

  const validateField = (key: string, value: string) => {
    let error: string | null = null;
    if (key === "email") error = validateEmail(value);
    else if (key === "phone") error = validatePhone(value);
    setFieldErrors((prev) => {
      if (!error) { const next = { ...prev }; delete next[key]; return next; }
      return { ...prev, [key]: error };
    });
  };

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
    if (typeof value === "string") validateField(key, value);
  };

  const isValid = () => {
    const required = ["firstName", "lastName", "email", "phone", "tfn", "dob", "street", "suburb", "state", "postcode"];
    if (hasAbn) required.push("abn", "businessName");
    for (const key of required) {
      const value = customer[key];
      if (!value || (typeof value === "string" && value.trim() === "")) return false;
    }
    if (validateEmail(customer.email || "")) return false;
    if (validatePhone(customer.phone || "")) return false;
    return true;
  };

  return (
    <div className="content-card animate-fade-in">
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Settings className="w-3.5 h-3.5" />
          STEP 1 OF 2
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Personal Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We'll prefill ATO data for all your selected income streams
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput label="First Name" required placeholder="John" value={customer.firstName || ""} onChange={(e) => handleChange("firstName", e.target.value)} />
          <SoftInput label="Last Name" required placeholder="Smith" value={customer.lastName || ""} onChange={(e) => handleChange("lastName", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput label="Email Address" required type="email" placeholder="john.smith@email.com" value={customer.email || ""} onChange={(e) => handleChange("email", e.target.value)} error={fieldErrors.email} />
          <SoftInput label="Phone Number" required type="tel" placeholder="04XX XXX XXX" value={customer.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} error={fieldErrors.phone} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SoftInput label="Tax File Number (TFN)" required placeholder="XXX XXX XXX" value={customer.tfn || ""} onChange={(e) => handleChange("tfn", e.target.value)} />
            <p className="text-xs text-primary mt-1">For ATO prefill across all income streams</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Date of Birth<span className="text-destructive"> *</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full h-12 justify-start text-left font-normal rounded-xl border-border bg-input/50", !customer.dob && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customer.dob ? format(new Date(customer.dob), "dd-MM-yyyy") : "dd-mm-yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={customer.dob ? new Date(customer.dob) : undefined}
                  onSelect={(date) => handleChange("dob", date ? date.toISOString() : "")}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* ABN fields - only if ABN stream selected */}
        {hasAbn && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SoftInput label="ABN" required placeholder="XX XXX XXX XXX" value={customer.abn || ""} onChange={(e) => handleChange("abn", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Your business ABN</p>
            </div>
            <SoftInput label="Business/Trading Name" required placeholder="Your Business Name" value={customer.businessName || ""} onChange={(e) => handleChange("businessName", e.target.value)} />
          </div>
        )}

        <SoftInput label="Street Address" required placeholder="123 Main Street" value={customer.street || ""} onChange={(e) => handleChange("street", e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SoftInput label="Suburb" required placeholder="Sydney" value={customer.suburb || ""} onChange={(e) => handleChange("suburb", e.target.value)} />
          <SoftSelect label="State" required value={customer.state || ""} options={[{ value: "", label: "Select State" }, ...STATES]} onChange={(e) => handleChange("state", e.target.value)} />
          <SoftInput label="Postcode" required placeholder="2000" value={customer.postcode || ""} onChange={(e) => handleChange("postcode", e.target.value)} />
        </div>

        <div className="mt-8 flex justify-end">
          <PrimaryButton onClick={nextStep} disabled={!isValid()}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
