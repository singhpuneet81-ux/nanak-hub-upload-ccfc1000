import React, { useState, useMemo } from "react";
import { validatePhone, validateEmail, validateTFN } from "@/utils/validation";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput } from "@/components/checkout/FormInputs";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { STATES } from "@/config/yourDetails.config";
import { SoftSelect } from "@/components/checkout/FormInputs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Users, Info, Plus, Trash2, CalendarIcon, Mail, Phone, Lock, AlertTriangle } from "lucide-react";

interface Partner {
  id: string;
  fullName: string;
  dateOfBirth: string;
  tfn: string;
  streetAddress: string;
  city: string;
  state: string;
  postcode: string;
  email: string;
  phone: string;
  percentage: string;
}

const createEmptyPartner = (): Partner => ({
  id: crypto.randomUUID(),
  fullName: "",
  dateOfBirth: "",
  tfn: "",
  streetAddress: "",
  city: "",
  state: "",
  postcode: "",
  email: "",
  phone: "",
  percentage: "",
});

export const PRStepPartners: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const partners: Partner[] = customer.prPartners || [createEmptyPartner(), createEmptyPartner()];

  const updatePartners = (updated: Partner[]) => {
    updateCustomer({ prPartners: updated });
  };

  const updatePartner = (id: string, field: string, value: any) => {
    const updated = partners.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    updatePartners(updated);
    // Real-time validation
    if (typeof value === "string") {
      const key = `${id}_${field}`;
      let error: string | null = null;
      if (field === "email") error = validateEmail(value);
      else if (field === "phone") error = validatePhone(value);
      else if (field === "tfn") error = validateTFN(value);
      setErrors((prev) => {
        if (!error) { const next = { ...prev }; delete next[key]; return next; }
        return { ...prev, [key]: error };
      });
    }
  };

  const addPartner = () => {
    updatePartners([...partners, createEmptyPartner()]);
  };

  const removePartner = (id: string) => {
    if (partners.length <= 2) return;
    updatePartners(partners.filter((p) => p.id !== id));
  };

  const totalPercentage = useMemo(() => {
    return partners.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0);
  }, [partners]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    partners.forEach((p) => {
      if (!p.fullName.trim()) newErrors[`${p.id}_fullName`] = "Required";
      if (!p.dateOfBirth.trim()) newErrors[`${p.id}_dateOfBirth`] = "Required";
      const tfnErr = validateTFN(p.tfn);
      if (tfnErr) newErrors[`${p.id}_tfn`] = tfnErr;
      if (!p.streetAddress.trim()) newErrors[`${p.id}_streetAddress`] = "Required";
      if (!p.city.trim()) newErrors[`${p.id}_city`] = "Required";
      if (!p.state.trim()) newErrors[`${p.id}_state`] = "Required";
      if (!p.postcode.trim()) newErrors[`${p.id}_postcode`] = "Required";
      const emailErr = validateEmail(p.email);
      if (emailErr) newErrors[`${p.id}_email`] = emailErr;
      const phoneErr = validatePhone(p.phone);
      if (phoneErr) newErrors[`${p.id}_phone`] = phoneErr;
      if (!p.percentage.trim()) newErrors[`${p.id}_percentage`] = "Required";
    });
    if (Math.abs(totalPercentage - 100) > 0.01) {
      newErrors["totalPercentage"] = "Must equal 100%";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    nextStep();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Partner Information</h3>
            <p className="text-sm text-muted-foreground">Details for all partners</p>
          </div>
        </div>

        {/* ATO Requirement info */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            ATO Requirement
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            All partners must be identified for ATO registration purposes. The total partnership interest must equal <strong>100%</strong>.
          </p>
        </div>

        {/* Total Percentage Indicator */}
        <div
          className={cn(
            "rounded-xl p-4 mb-6 flex items-center justify-between border-2",
            Math.abs(totalPercentage - 100) < 0.01
              ? "border-[hsl(142_71%_85%)] bg-[hsl(142_76%_94%)]"
              : totalPercentage > 100
              ? "border-destructive/30 bg-destructive/5"
              : "border-[hsl(var(--cta)/0.3)] bg-[hsl(var(--cta)/0.05)]"
          )}
        >
          <div>
            <p className="font-semibold text-foreground">Total Partnership Interest:</p>
            <p className="text-sm text-muted-foreground">Must equal 100% to proceed</p>
          </div>
          <span
            className={cn(
              "text-2xl font-bold",
              Math.abs(totalPercentage - 100) < 0.01
                ? "text-[hsl(142_71%_35%)]"
                : totalPercentage > 100
                ? "text-destructive"
                : "text-[hsl(var(--cta))]"
            )}
          >
            {totalPercentage.toFixed(1)}%
          </span>
        </div>
        {errors["totalPercentage"] && (
          <div className="flex items-center gap-2 text-destructive text-sm mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>Total partnership interest must equal exactly 100%</span>
          </div>
        )}
      </div>

      {/* Partner Cards */}
      {partners.map((partner, index) => (
        <div key={partner.id} className="content-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Partner {index + 1}</h3>
            {partners.length > 2 && (
              <button
                type="button"
                onClick={() => removePartner(partner.id)}
                className="text-destructive hover:text-destructive/80 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Full Legal Name */}
            <SoftInput
              label="Full Legal Name"
              required
              placeholder="John David Smith"
              value={partner.fullName}
              onChange={(e) => updatePartner(partner.id, "fullName", e.target.value)}
              error={errors[`${partner.id}_fullName`]}
            />

            {/* DOB & TFN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !partner.dateOfBirth && "text-muted-foreground",
                        errors[`${partner.id}_dateOfBirth`] && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {partner.dateOfBirth || <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        partner.dateOfBirth
                          ? new Date(partner.dateOfBirth.split("-").reverse().join("-"))
                          : undefined
                      }
                      onSelect={(date) =>
                        updatePartner(partner.id, "dateOfBirth", date ? format(date, "dd-MM-yyyy") : "")
                      }
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors[`${partner.id}_dateOfBirth`] && (
                  <p className="text-destructive text-xs mt-1">{errors[`${partner.id}_dateOfBirth`]}</p>
                )}
              </div>
              <div>
                <SoftInput
                  label="Tax File Number (TFN)"
                  required
                  placeholder="XXX XXX XXX"
                  icon={<Lock className="w-4 h-4" />}
                  value={partner.tfn}
                  onChange={(e) => updatePartner(partner.id, "tfn", e.target.value)}
                  error={errors[`${partner.id}_tfn`]}
                />
                <p className="text-xs text-muted-foreground mt-1">Encrypted and secure</p>
              </div>
            </div>

            {/* Address */}
            <h4 className="font-semibold text-foreground">Residential Address</h4>
            <SoftInput
              label="Street Address"
              required
              placeholder="123 Main Street"
              value={partner.streetAddress}
              onChange={(e) => updatePartner(partner.id, "streetAddress", e.target.value)}
              error={errors[`${partner.id}_streetAddress`]}
            />
            <div className="grid grid-cols-3 gap-4">
              <SoftInput
                label="City/Suburb"
                required
                placeholder="Melbourne"
                value={partner.city}
                onChange={(e) => updatePartner(partner.id, "city", e.target.value)}
                error={errors[`${partner.id}_city`]}
              />
              <SoftSelect
                label="State"
                required
                options={[{ value: "", label: "Select" }, ...STATES]}
                value={partner.state}
                onChange={(e) => updatePartner(partner.id, "state", e.target.value)}
                error={errors[`${partner.id}_state`]}
              />
              <SoftInput
                label="Postcode"
                required
                placeholder="3000"
                value={partner.postcode}
                onChange={(e) => updatePartner(partner.id, "postcode", e.target.value)}
                error={errors[`${partner.id}_postcode`]}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftInput
                label="Email Address"
                required
                type="email"
                placeholder="john@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={partner.email}
                onChange={(e) => updatePartner(partner.id, "email", e.target.value)}
                error={errors[`${partner.id}_email`]}
              />
              <SoftInput
                label="Phone Number"
                required
                type="tel"
                placeholder="04XX XXX XXX"
                icon={<Phone className="w-4 h-4" />}
                value={partner.phone}
                onChange={(e) => updatePartner(partner.id, "phone", e.target.value)}
                error={errors[`${partner.id}_phone`]}
              />
            </div>

            {/* Percentage */}
            <div>
              <SoftInput
                label="Percentage Interest in Partnership"
                required
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={partner.percentage}
                onChange={(e) => updatePartner(partner.id, "percentage", e.target.value)}
                error={errors[`${partner.id}_percentage`]}
              />
              <p className="text-xs text-muted-foreground mt-1">Must total 100% across all partners</p>
            </div>
          </div>

          {index < partners.length - 1 && <hr className="border-border mt-4" />}
        </div>
      ))}

      {/* Add Partner */}
      <button
        type="button"
        onClick={addPartner}
        className="w-full border-2 border-dashed border-border rounded-xl py-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Another Partner
      </button>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={handleContinue} disabled={partners.length < 2} className="flex-1">
          Continue to Tax Setup
        </PrimaryButton>
      </div>
    </div>
  );
};
