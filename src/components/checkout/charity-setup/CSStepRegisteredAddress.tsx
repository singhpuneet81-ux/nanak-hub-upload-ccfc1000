import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AUSTRALIAN_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

interface CSStepRegisteredAddressProps {
  onNext: () => void;
  onBack: () => void;
}

export const CSStepRegisteredAddress: React.FC<CSStepRegisteredAddressProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [streetAddress, setStreetAddress] = useState((customer?.officeStreetAddress as string) || "");
  const [suburb, setSuburb] = useState((customer?.officeSuburb as string) || "");
  const [state, setState] = useState((customer?.officeState as string) || "");
  const [postcode, setPostcode] = useState((customer?.officePostcode as string) || "");
  const [hasExistingABN, setHasExistingABN] = useState((customer?.hasExistingABN as boolean) || false);
  const [existingABN, setExistingABN] = useState((customer?.existingABN as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }
    if (!suburb.trim()) {
      newErrors.suburb = "Suburb is required";
    }
    if (!state) {
      newErrors.state = "State is required";
    }
    if (!postcode.trim()) {
      newErrors.postcode = "Postcode is required";
    } else if (!/^\d{4}$/.test(postcode)) {
      newErrors.postcode = "Please enter a valid 4-digit postcode";
    }
    if (hasExistingABN && !existingABN.trim()) {
      newErrors.existingABN = "Please enter your existing ABN";
    } else if (hasExistingABN && !/^\d{11}$/.test(existingABN.replace(/\s/g, ""))) {
      newErrors.existingABN = "ABN must be 11 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const isFormValid = !!(streetAddress.trim() && suburb.trim() && state && postcode.trim());
  const handleContinue = () => {
    if (!validate()) return;

    updateCustomer({
      officeStreetAddress: streetAddress,
      officeSuburb: suburb,
      officeState: state,
      officePostcode: postcode,
      hasExistingABN,
      existingABN: hasExistingABN ? existingABN : "",
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Registered Office Address</h2>
        <p className="text-muted-foreground mt-1">Provide the principal place of administration</p>
      </div>

      {/* Requirements info */}
      <div className="bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.2)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-[hsl(var(--success))] mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">Registered Office Requirements</p>
            <p className="text-sm text-muted-foreground mt-1">
              This must be a physical address in Australia (not a PO Box). This address will be publicly listed on the ACNC Charity Register.
            </p>
          </div>
        </div>
      </div>

      {/* Address fields */}
      <div className="bg-muted/30 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Street Address <span className="text-destructive">*</span>
          </label>
          <Input
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="Street address"
            className={errors.streetAddress ? "border-destructive" : ""}
          />
          {errors.streetAddress && <p className="text-destructive text-sm mt-1">{errors.streetAddress}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Suburb <span className="text-destructive">*</span>
            </label>
            <Input
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              placeholder="Suburb"
              className={errors.suburb ? "border-destructive" : ""}
            />
            {errors.suburb && <p className="text-destructive text-sm mt-1">{errors.suburb}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              State <span className="text-destructive">*</span>
            </label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {AUSTRALIAN_STATES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Postcode <span className="text-destructive">*</span>
            </label>
            <Input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Postcode"
              maxLength={4}
              className={errors.postcode ? "border-destructive" : ""}
            />
            {errors.postcode && <p className="text-destructive text-sm mt-1">{errors.postcode}</p>}
          </div>
        </div>
      </div>

      {/* Existing ABN */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={hasExistingABN} 
            onCheckedChange={(checked) => setHasExistingABN(checked as boolean)}
          />
          <div className="flex-1">
            <p className="font-medium text-foreground">I already have an ABN for this organization</p>
            <p className="text-sm text-muted-foreground">If you're converting an existing entity to a charity</p>
          </div>
        </div>

        {hasExistingABN && (
          <div className="mt-4 pl-7">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Existing ABN <span className="text-destructive">*</span>
            </label>
            <Input
              value={existingABN}
              onChange={(e) => setExistingABN(e.target.value)}
              placeholder="XX XXX XXX XXX"
              maxLength={14}
              className={errors.existingABN ? "border-destructive" : ""}
            />
            {errors.existingABN && <p className="text-destructive text-sm mt-1">{errors.existingABN}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="hidden md:flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleContinue} disabled={!isFormValid}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
