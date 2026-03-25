import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface CLGStepRegisteredAddressProps {
  onNext: () => void;
  onBack: () => void;
}

export const CLGStepRegisteredAddress: React.FC<CLGStepRegisteredAddressProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [streetAddress, setStreetAddress] = useState((customer?.clgStreetAddress as string) || "");
  const [suburb, setSuburb] = useState((customer?.clgSuburb as string) || "");
  const [postcode, setPostcode] = useState((customer?.clgPostcode as string) || "");
  const [state, setState] = useState((customer?.clgState as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!streetAddress.trim()) newErrors.streetAddress = "Street address is required";
    if (!suburb.trim()) newErrors.suburb = "Suburb is required";
    if (!postcode.trim()) {
      newErrors.postcode = "Postcode is required";
    } else if (!/^\d{4}$/.test(postcode)) {
      newErrors.postcode = "Please enter a valid 4-digit postcode";
    }
    if (!state) newErrors.state = "State/Territory is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(streetAddress.trim() && suburb.trim() && postcode.trim() && state);
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      clgStreetAddress: streetAddress,
      clgSuburb: suburb,
      clgPostcode: postcode,
      clgState: state,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Registered Office Address</h2>
        <p className="text-muted-foreground mt-1">Official address for the company (ASIC requirement)</p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">ASIC Registered Office Requirements</p>
            <p className="text-sm text-muted-foreground mt-1">
              Must be a physical Australian address (not a PO Box) where ASIC correspondence can be served. This address will be publicly listed on the ASIC register.
            </p>
          </div>
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Street Address <span className="text-destructive">*</span>
        </label>
        <Input
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="Unit/Level, Street Number and Name"
          className={errors.streetAddress ? "border-destructive" : ""}
        />
        {errors.streetAddress && <p className="text-destructive text-sm mt-1">{errors.streetAddress}</p>}
      </div>

      {/* Suburb & Postcode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Postcode <span className="text-destructive">*</span>
          </label>
          <Input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="0000"
            maxLength={4}
            className={errors.postcode ? "border-destructive" : ""}
          />
          {errors.postcode && <p className="text-destructive text-sm mt-1">{errors.postcode}</p>}
        </div>
      </div>

      {/* State/Territory */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          State/Territory <span className="text-destructive">*</span>
        </label>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className={errors.state ? "border-destructive" : ""}>
            <SelectValue placeholder="Select State/Territory" />
          </SelectTrigger>
          <SelectContent>
            {AUSTRALIAN_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleContinue} disabled={!isFormValid}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue to Directors
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
