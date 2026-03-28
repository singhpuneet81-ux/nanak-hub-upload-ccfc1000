import React, { useState } from "react";
import { ArrowRight, Info, Target } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATES } from "@/config/yourDetails.config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UTStepTrustDetailsProps {
  onNext: () => void;
}

const businessActivities = [
  { value: "property", label: "Property Investment" },
  { value: "shares", label: "Share Trading/Investment" },
  { value: "import_export", label: "Import/Export" },
  { value: "consulting", label: "Consulting Services" },
  { value: "retail", label: "Retail Trade" },
  { value: "construction", label: "Construction" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "technology", label: "Technology/IT Services" },
  { value: "healthcare", label: "Healthcare Services" },
  { value: "hospitality", label: "Hospitality/Food Services" },
  { value: "other", label: "Other" },
];

export const UTStepTrustDetails: React.FC<UTStepTrustDetailsProps> = ({
  onNext,
}) => {
  const { customer, updateCustomer } = useCheckout();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customer?.unitTrustName?.trim()) {
      newErrors.unitTrustName = "Unit trust name is required";
    }

    if (!customer?.corporateTrusteeName?.trim()) {
      newErrors.corporateTrusteeName = "Corporate trustee name is required";
    }

 if (!customer?.primaryBusinessActivity) {
  newErrors.primaryBusinessActivity = "Please select a business activity";
}

if (
  customer.primaryBusinessActivity === "other" &&
  !customer.otherBusinessActivity?.trim()
) {
  newErrors.otherBusinessActivity = "Please specify your business activity";
}


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Trust & Trustee Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Let's start with naming your unit trust and corporate trustee
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[hsl(var(--cta))] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">What's a Unit Trust?</p>
            <p className="text-muted-foreground mt-1">
              <strong>Unit Trust:</strong> A trust where beneficiaries hold
              specific units representing fixed entitlements to income and
              capital (e.g., "ABC Unit Trust")
            </p>
            <p className="text-muted-foreground mt-1">
              <strong>Corporate Trustee:</strong> The company that manages and
              operates the trust (e.g., "XYZ Pty Ltd")
            </p>
            <p className="text-muted-foreground mt-2 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Perfect for joint ventures, property syndicates, and business
              investments!
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Unit Trust Name */}
        <div className="space-y-2">
          <Label htmlFor="unitTrustName">
            Proposed Unit Trust Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unitTrustName"
            placeholder="e.g., ABC Unit Trust"
            value={customer?.unitTrustName || ""}
            onChange={(e) => updateCustomer({ unitTrustName: e.target.value })}
            className={errors.unitTrustName ? "border-destructive" : ""}
          />
          {errors.unitTrustName ? (
            <p className="text-xs text-destructive">{errors.unitTrustName}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter your desired name for the unit trust
            </p>
          )}
        </div>

        {/* Corporate Trustee Name */}
        <div className="space-y-2">
          <Label htmlFor="corporateTrusteeName">
            Proposed Corporate Trustee Name{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="corporateTrusteeName"
            placeholder="e.g., XYZ Pty Ltd"
            value={customer?.corporateTrusteeName || ""}
            onChange={(e) =>
              updateCustomer({ corporateTrusteeName: e.target.value })
            }
            className={errors.corporateTrusteeName ? "border-destructive" : ""}
          />
          {errors.corporateTrusteeName && (
            <p className="text-xs text-destructive">
              {errors.corporateTrusteeName}
            </p>
          )}
        </div>

        {/* Primary Business Activity */}
        <div className="space-y-2">
          <Label htmlFor="primaryBusinessActivity">
            Primary Business Activity{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={customer?.primaryBusinessActivity || ""}
           onValueChange={(value) =>
  updateCustomer({
    primaryBusinessActivity: value,
    ...(value !== "other" ? { otherBusinessActivity: "" } : {}),
  })
}
          >
            <SelectTrigger
              className={errors.primaryBusinessActivity ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select business activity" />
            </SelectTrigger>
            <SelectContent>
              {businessActivities.map((activity) => (
                <SelectItem key={activity.value} value={activity.value}>
                  {activity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Other Business Activity (Conditional) */}
{customer.primaryBusinessActivity === "other" && (
  <div className="space-y-2 mt-3">
    <Label htmlFor="otherBusinessActivity">
      Please Specify Business Activity{" "}
      <span className="text-destructive">*</span>
    </Label>
    <Input
      id="otherBusinessActivity"
      placeholder="Describe your business activity"
      value={customer.otherBusinessActivity || ""}
      onChange={(e) =>
        updateCustomer({ otherBusinessActivity: e.target.value })
      }
      className={errors.otherBusinessActivity ? "border-destructive" : ""}
    />
    {errors.otherBusinessActivity ? (
      <p className="text-xs text-destructive">
        {errors.otherBusinessActivity}
      </p>
    ) : (
      <p className="text-xs text-muted-foreground">
        Briefly describe the main activity of the trust
      </p>
    )}
  </div>
)}

        {errors.primaryBusinessActivity && customer.primaryBusinessActivity !== "other" && (
  <p className="text-xs text-destructive">
    {errors.primaryBusinessActivity}
  </p>
)}
        </div>

        {/* State / Territory */}
        <div className="space-y-2">
          <Label>State / Territory <span className="text-destructive">*</span></Label>
          <div className="relative">
            <select
              value={customer?.trustState || ""}
              onChange={(e) => updateCustomer({ trustState: e.target.value })}
              className="h-12 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.96a.75.75 0 111.08 1.04l-4.24 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">The state where the trust will be established</p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="checkout-nav pt-4">
        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-[hsl(var(--cta))] hover:opacity-90 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        >
          Continue to Unitholders
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
