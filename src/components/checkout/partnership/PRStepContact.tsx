import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { validateEmail, validatePhone } from "@/utils/validation";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { UserCheck, Info, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const POSITION_OPTIONS = [
  { value: "", label: "Select position" },
  { value: "partner", label: "Partner" },
  { value: "accountant", label: "Accountant" },
  { value: "tax_agent", label: "Tax Agent" },
  { value: "other", label: "Other" },
];

export const PRStepContact: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
    // Real-time validation
    if (typeof value === "string") {
      let error: string | null = null;
      if (key === "prContactPhone") error = validatePhone(value);
      else if (key === "prContactEmail") error = validateEmail(value);
      const errorKey = key === "prContactPhone" ? "phone" : key === "prContactEmail" ? "email" : key;
      setErrors((prev) => {
        if (!error) { const next = { ...prev }; delete next[errorKey]; return next; }
        return { ...prev, [errorKey]: error };
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!(customer.prContactName || "").trim()) newErrors.contactName = "Required";
    if (!(customer.prContactPosition || "").trim()) newErrors.position = "Required";
    const phoneErr = validatePhone(customer.prContactPhone || "");
    if (phoneErr) newErrors.phone = phoneErr;
    else if (!(customer.prContactPhone || "").trim()) newErrors.phone = "Required";
    const emailErr = validateEmail(customer.prContactEmail || "");
    if (emailErr) newErrors.email = emailErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = !!(customer.prContactName || "").trim() && !!(customer.prContactPosition || "").trim() && !!(customer.prContactPhone || "").trim() && !!(customer.prContactEmail || "").trim();

  const handleContinue = () => {
    if (!validate()) return;
    nextStep();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Authorised Contact</h3>
            <p className="text-sm text-muted-foreground">Who should the ATO contact?</p>
          </div>
        </div>

        {/* Info */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            ATO Communication
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Nominate a contact person for ATO interaction. This can be a partner or your accountant.
          </p>
        </div>

        <div className="space-y-5">
          <SoftInput
            label="Authorised Contact Name"
            required
            placeholder="John Smith"
            value={customer.prContactName || ""}
            onChange={(e) => handleChange("prContactName", e.target.value)}
            error={errors.contactName}
          />

          <SoftSelect
            label="Position"
            required
            options={POSITION_OPTIONS}
            value={customer.prContactPosition || ""}
            onChange={(e) => handleChange("prContactPosition", e.target.value)}
            error={errors.position}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SoftInput
              label="Phone Number"
              required
              type="tel"
              placeholder="04XX XXX XXX"
              icon={<Phone className="w-4 h-4" />}
              value={customer.prContactPhone || ""}
              onChange={(e) => handleChange("prContactPhone", e.target.value)}
              error={errors.phone}
            />
            <SoftInput
              label="Email Address"
              required
              type="email"
              placeholder="john@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={customer.prContactEmail || ""}
              onChange={(e) => handleChange("prContactEmail", e.target.value)}
              error={errors.email}
            />
          </div>

          {/* Tax Agent Authorization */}
          <div className="border border-border rounded-xl p-4 flex items-start gap-3">
            <Checkbox
              id="prTaxAgentAuth"
              checked={customer.prTaxAgentAuth || false}
              onCheckedChange={(checked) => handleChange("prTaxAgentAuth", checked)}
              className="mt-0.5"
            />
            <label htmlFor="prTaxAgentAuth" className="cursor-pointer">
              <p className="text-sm font-medium text-foreground">
                Authorise Nanak Accountants & Associates as your registered tax agent
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This allows us to lodge ATO registrations and communicate with the ATO on your behalf. You can revoke this at any time.
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={handleContinue} disabled={!isFormValid} className="flex-1">
          Continue to Review & Payment
        </PrimaryButton>
      </div>
    </div>
  );
};
