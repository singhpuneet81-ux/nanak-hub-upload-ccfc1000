import React, { useState } from "react";
import { ArrowRight, Info, Check, Building2 } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";


const businessActivities = [
  "Property Investment",
  "Transport & Logistics",
  "Construction & Trades",
  "Retail or E-commerce",
  "IT & Tech Consulting",
  "Cleaning Services",
  "Real Estate Services",
  "NDIS or Aged Care",
  "Childcare & Education",
  "Import/Export",
  "Accounting & Tax",
  "Migration Services",
  "Medical or Health Services",
  "Legal Services",
  "Farming or Agriculture",
  "Beauty & Personal Care",
  "Other (Please Specify)",
];


interface FTStepTrustDetailsProps {
  onNext: () => void;
}

export const FTStepTrustDetails: React.FC<FTStepTrustDetailsProps> = ({ onNext }) => {
  const { updateCustomer, customer } = useCheckout();

  const [trustName, setTrustName] = useState(customer.trustName || "");
  const [trusteeName, setTrusteeName] = useState(customer.trusteeName || "");
  const [businessActivity, setBusinessActivity] = useState(customer.businessActivity || "");

  const [otherBusinessActivity, setOtherBusinessActivity] = useState(
  customer.otherBusinessActivity || ""
);

  const handleContinue = () => {
  updateCustomer({
    trustName,
    trusteeName,
    businessActivity,
    otherBusinessActivity:
      businessActivity === "Other (Please Specify)"
        ? otherBusinessActivity
        : "",
  });
  onNext();
};

const isValid =
  trustName &&
  trusteeName &&
  businessActivity &&
  (businessActivity !== "Other (Please Specify)" || otherBusinessActivity.trim());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Trust & Trustee Details</h2>
        <p className="text-muted-foreground mt-1">
          Let's start with naming your family trust and corporate trustee
        </p>
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-medium text-primary mb-2">What's the difference?</p>
            <p className="text-foreground">
              <span className="font-medium">Family Trust:</span> The legal structure that holds and manages assets for your family (e.g., "Smith Family Trust")
            </p>
            <p className="text-foreground mt-1">
              <span className="font-medium">Corporate Trustee:</span> The company that operates and controls the trust (e.g., "XYZ Pty Ltd")
            </p>
            <p className="text-[hsl(var(--success))] mt-2 flex items-center gap-1">
              <Check size={14} />
              We handle all registrations and paperwork for you!
            </p>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        {/* Trust Name */}
        <div className="space-y-2">
          <Label htmlFor="trustName" className="text-foreground">
            Proposed Family Trust Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="trustName"
            placeholder="e.g., Smith Family Trust"
            value={trustName}
            onChange={(e) => setTrustName(e.target.value)}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">Enter your desired name for the trust</p>
        </div>

        {/* Corporate Trustee Name */}
        <div className="space-y-2">
          <Label htmlFor="trusteeName" className="text-foreground">
            Proposed Corporate Trustee Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="trusteeName"
            placeholder="e.g., XYZ Pty Limited"
            value={trusteeName}
            onChange={(e) => setTrusteeName(e.target.value)}
            className="h-12"
          />
          
        </div>

{/* Business Activity */}
<div className="space-y-2">
  <Label className="text-foreground">
    Primary Business Activity <span className="text-destructive">*</span>
  </Label>

  <Select
    value={businessActivity}
    onValueChange={(value) => {
      setBusinessActivity(value);
      if (value !== "Other (Please Specify)") {
        setOtherBusinessActivity("");
      }
    }}
  >
  <SelectTrigger className="h-12 flex items-center gap-2 justify-start">
  <Building2 className="text-muted-foreground shrink-0" size={18} />

  <SelectValue
    placeholder="Select primary business activity"
    className="text-left"
  />
</SelectTrigger>


    <SelectContent>
      {businessActivities.map((activity) => (
        <SelectItem key={activity} value={activity}>
          {activity}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  <p className="text-xs text-muted-foreground">
    What will the trust primarily be used for?
  </p>

  {businessActivity === "Other (Please Specify)" && (
    <Input
      className="h-12 mt-2"
      placeholder="Please specify your business activity"
      value={otherBusinessActivity}
      onChange={(e) => setOtherBusinessActivity(e.target.value)}
    />
  )}
</div>


      </div>

      {/* Why Nanak box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary text-lg">👤</span>
          </div>
          <div>
            <p className="font-medium text-primary mb-2">Why Nanak for Your Family Trust?</p>
            <ul className="space-y-1.5 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <Check className="text-[hsl(var(--success))] shrink-0 mt-0.5" size={14} />
                1,000+ family trusts established - proven track record
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-[hsl(var(--success))] shrink-0 mt-0.5" size={14} />
                Experienced legal team ensuring ATO compliance
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-[hsl(var(--success))] shrink-0 mt-0.5" size={14} />
                Complete asset protection and tax planning advice included
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Continue button */}
    <button
  onClick={handleContinue}
  disabled={!isValid}
  className={cn(
    "w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all",
    isValid
      ? "bg-[hsl(var(--cta))] hover:bg-[hsl(var(--cta))]/90 disabled:opacity-50"
      : "bg-[hsl(var(--cta))]/40 cursor-not-allowed disabled:opacity-50"
  )}
>
  Continue to Appointor & Beneficiaries
  <ArrowRight size={18} />
</button>

    </div>
  );
};
