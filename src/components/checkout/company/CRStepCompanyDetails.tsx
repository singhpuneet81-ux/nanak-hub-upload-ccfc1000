import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowRight, Info, Building2, MapPin, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BUSINESS_ACTIVITIES = [
  "Property Investment & Development",
  "Construction & Building Services",
  "Transport & Logistics",
  "Retail or E-commerce",
  "IT & Technology Services",
  "Professional Consulting",
  "Cleaning Services",
  "Real Estate Services",
  "Healthcare & Medical",
  "NDIS or Aged Care",
  "Childcare & Education",
  "Import/Export",
  "Accounting & Tax Services",
  "Migration Services",
  "Legal Services",
  "Farming or Agriculture",
  "Beauty & Personal Care",
  "Marketing & Design",
  "Hospitality & Events",
  "Automotive Services",
  "Financial Services",
  "Manufacturing",
  "Wholesale Trade",
  "Other (Please Specify)",
];

const AUSTRALIAN_STATES = [
  { value: "VIC", label: "VIC - Victoria" },
  { value: "NSW", label: "NSW - New South Wales" },
  { value: "QLD", label: "QLD - Queensland" },
  { value: "WA", label: "WA - Western Australia" },
  { value: "SA", label: "SA - South Australia" },
  { value: "TAS", label: "TAS - Tasmania" },
  { value: "NT", label: "NT - Northern Territory" },
  { value: "ACT", label: "ACT - Australian Capital Territory" },
];

interface CRStepCompanyDetailsProps {
  onNext: () => void;
}

export const CRStepCompanyDetails: React.FC<CRStepCompanyDetailsProps> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();

  const [companyName, setCompanyName] = useState((customer?.crCompanyName as string) || "");
  const [businessActivity, setBusinessActivity] = useState((customer?.crBusinessActivity as string) || "");
  const [otherActivity, setOtherActivity] = useState((customer?.crOtherActivity as string) || "");
  const [street, setStreet] = useState((customer?.crStreet as string) || "");
  const [suburb, setSuburb] = useState((customer?.crSuburb as string) || "");
  const [state, setState] = useState((customer?.crState as string) || "VIC");
  const [postcode, setPostcode] = useState((customer?.crPostcode as string) || "");
  const [principalPlace, setPrincipalPlace] = useState<"same" | "different">(
    (customer?.crPrincipalPlace as "same" | "different") || "same"
  );
  const [differentAddress, setDifferentAddress] = useState((customer?.crDifferentAddress as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!businessActivity) newErrors.businessActivity = "Please select a business activity";
    if (businessActivity === "Other (Please Specify)" && !otherActivity.trim()) {
      newErrors.otherActivity = "Please specify your business activity";
    }
    if (!street.trim()) newErrors.street = "Street address is required";
    if (!suburb.trim()) newErrors.suburb = "Suburb is required";
    if (!postcode.trim()) newErrors.postcode = "Postcode is required";
    if (principalPlace === "different" && !differentAddress.trim()) {
      newErrors.differentAddress = "Please enter the principal place of business address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(
    companyName.trim() &&
    businessActivity &&
    (businessActivity !== "Other (Please Specify)" || otherActivity.trim()) &&
    street.trim() &&
    suburb.trim() &&
    postcode.trim() &&
    (principalPlace === "same" || differentAddress.trim())
  );
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      crCompanyName: companyName,
      crBusinessActivity: businessActivity,
      crOtherActivity: otherActivity,
      crStreet: street,
      crSuburb: suburb,
      crState: state,
      crPostcode: postcode,
      crPrincipalPlace: principalPlace,
      crDifferentAddress: differentAddress,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Details</h2>
        <p className="text-muted-foreground mt-1">Let's start with your company information</p>
      </div>

      {/* Proposed Company Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Proposed Company Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder='e.g., ABC Pty Ltd'
          className={errors.companyName ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must end with "Pty Ltd", "Pty Limited", "Proprietary Limited" or "Limited"
        </p>
        {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName}</p>}
      </div>

      {/* Primary Business Activity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          Primary Business Activity <span className="text-destructive">*</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={14} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs bg-[hsl(220,40%,13%)] text-white border-none">
              <p className="text-sm">Select the main activity your company will undertake. This helps ASIC categorize your business and ensures proper compliance requirements.</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Select value={businessActivity} onValueChange={setBusinessActivity}>
          <SelectTrigger className={`h-12 ${errors.businessActivity ? "border-destructive" : ""}`}>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-muted-foreground" />
              <SelectValue placeholder="Select primary business activity" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_ACTIVITIES.map((activity) => (
              <SelectItem key={activity} value={activity}>{activity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.businessActivity && <p className="text-destructive text-sm mt-1">{errors.businessActivity}</p>}
      </div>

      {/* Other activity text field */}
      {businessActivity === "Other (Please Specify)" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Specify Business Activity <span className="text-destructive">*</span>
          </label>
          <Input
            value={otherActivity}
            onChange={(e) => setOtherActivity(e.target.value)}
            placeholder="Describe your primary business activity"
            className={errors.otherActivity ? "border-destructive" : ""}
          />
          {errors.otherActivity && <p className="text-destructive text-sm mt-1">{errors.otherActivity}</p>}
        </div>
      )}

      {/* Registered Office Address */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Registered Office Address <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          This is your company's official address for ASIC
        </p>

        <div className="space-y-3">
          <div>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street address"
              className={errors.street ? "border-destructive" : ""}
            />
            {errors.street && <p className="text-destructive text-sm mt-1">{errors.street}</p>}
          </div>

          <div>
            <Input
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              placeholder="Suburb"
              className={errors.suburb ? "border-destructive" : ""}
            />
            {errors.suburb && <p className="text-destructive text-sm mt-1">{errors.suburb}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-12">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {AUSTRALIAN_STATES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Postcode"
                className={errors.postcode ? "border-destructive" : ""}
              />
              {errors.postcode && <p className="text-destructive text-sm mt-1">{errors.postcode}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Principal Place of Business */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Principal Place of Business
        </label>
        <div className="space-y-2">
          <label
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              principalPlace === "same"
                ? "border-primary bg-[hsl(var(--card-selected-bg))]"
                : "border-border hover:border-primary/40"
            }`}
            onClick={() => { setPrincipalPlace("same"); setDifferentAddress(""); }}
          >
            <input type="radio" name="principalPlace" value="same" checked={principalPlace === "same"} onChange={() => { setPrincipalPlace("same"); setDifferentAddress(""); }} className="sr-only" />
            <div className={`radio-indicator ${principalPlace === "same" ? "radio-indicator-selected" : ""}`} />
            <span className="text-sm font-medium text-foreground">Same as registered office address</span>
          </label>

          <label
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              principalPlace === "different"
                ? "border-primary bg-[hsl(var(--card-selected-bg))]"
                : "border-border hover:border-primary/40"
            }`}
            onClick={() => setPrincipalPlace("different")}
          >
            <input type="radio" name="principalPlace" value="different" checked={principalPlace === "different"} onChange={() => setPrincipalPlace("different")} className="sr-only" />
            <div className={`radio-indicator ${principalPlace === "different" ? "radio-indicator-selected" : ""}`} />
            <span className="text-sm font-medium text-foreground">Different address</span>
          </label>
        </div>

        {principalPlace === "different" && (
          <div className="mt-3">
            <Textarea
              value={differentAddress}
              onChange={(e) => setDifferentAddress(e.target.value)}
              placeholder="Full street address including suburb, state and postcode"
              rows={3}
              className={errors.differentAddress ? "border-destructive" : ""}
            />
            {errors.differentAddress && <p className="text-destructive text-sm mt-1">{errors.differentAddress}</p>}
          </div>
        )}
      </div>

      {/* Continue */}
      <div className="checkout-nav flex justify-end pt-4">
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
