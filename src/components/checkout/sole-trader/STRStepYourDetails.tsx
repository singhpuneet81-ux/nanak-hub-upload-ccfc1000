import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { validateEmail, validatePhone } from "@/utils/validation";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { STATES } from "@/config/yourDetails.config";
import { cn } from "@/lib/utils";
import { Settings, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const STRStepYourDetails: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      {/* Step Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Settings className="w-3.5 h-3.5" />
          STEP 1 OF 2
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Personal Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We'll use your TFN to prefill all income and tax data from the ATO
        </p>
      </div>

      <div className="space-y-6">
        {/* First Name / Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput
            label="First Name"
            required
            placeholder="John"
            value={customer.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
          <SoftInput
            label="Last Name"
            required
            placeholder="Smith"
            value={customer.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>

        {/* Email / Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput
            label="Email Address"
            required
            type="email"
            placeholder="john.smith@email.com"
            value={customer.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            error={fieldErrors.email}
          />
          <SoftInput
            label="Phone Number"
            required
            type="tel"
            placeholder="04XX XXX XXX"
            value={customer.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={fieldErrors.phone}
          />
        </div>

        {/* TFN / DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SoftInput
              label="Tax File Number (TFN)"
              required
              placeholder="XXX XXX XXX"
              value={customer.tfn || ""}
              onChange={(e) => handleChange("tfn", e.target.value)}
            />
            <p className="text-xs text-primary mt-1">
              Required to prefill ATO data - secure &amp; encrypted
            </p>
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
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal rounded-xl border-border bg-input/50",
                    !customer.dob && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customer.dob ? format(new Date(customer.dob), "dd-MM-yyyy") : "Select date"}
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

        {/* Street Address */}
        <SoftInput
          label="Street Address"
          required
          placeholder="123 Main Street"
          value={customer.street || ""}
          onChange={(e) => handleChange("street", e.target.value)}
        />

        {/* Suburb / State / Postcode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SoftInput
            label="Suburb"
            required
            placeholder="Sydney"
            value={customer.suburb || ""}
            onChange={(e) => handleChange("suburb", e.target.value)}
          />
          <SoftSelect
            label="State"
            required
            value={customer.state || ""}
            options={[
              { value: "", label: "Select State" },
              ...STATES,
            ]}
            onChange={(e) => handleChange("state", e.target.value)}
          />
          <SoftInput
            label="Postcode"
            required
            placeholder="2000"
            value={customer.postcode || ""}
            onChange={(e) => handleChange("postcode", e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 mt-8">
          <BackButton onClick={prevStep} className="sm:w-32" />
          <PrimaryButton onClick={nextStep} disabled={!isValid()} className="flex-1">
            Continue
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
