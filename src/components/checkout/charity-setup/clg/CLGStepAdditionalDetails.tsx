import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GUARANTEE_AMOUNTS = [
  { value: "10", label: "$10 (Standard)" },
  { value: "20", label: "$20" },
  { value: "50", label: "$50" },
  { value: "100", label: "$100" },
];

const REVENUE_RANGES = [
  { value: "under_250k", label: "Under $250,000 (Small)" },
  { value: "250k_1m", label: "$250,000 - $1,000,000 (Medium)" },
  { value: "1m_5m", label: "$1,000,000 - $5,000,000 (Large)" },
  { value: "over_5m", label: "Over $5,000,000 (Large)" },
];

interface CLGStepAdditionalDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export const CLGStepAdditionalDetails: React.FC<CLGStepAdditionalDetailsProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [guaranteeAmount, setGuaranteeAmount] = useState((customer?.clgGuaranteeAmount as string) || "10");
  const [annualRevenue, setAnnualRevenue] = useState((customer?.clgAnnualRevenue as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!guaranteeAmount) newErrors.guaranteeAmount = "Please select a guarantee amount";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(guaranteeAmount);
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      clgGuaranteeAmount: guaranteeAmount,
      clgAnnualRevenue: annualRevenue,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Additional Details</h2>
        <p className="text-muted-foreground mt-1">Final details for ASIC and ACNC registration</p>
      </div>

      {/* Guarantee Amount */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Guarantee Amount per Member <span className="text-destructive">*</span>
        </label>
        <Select value={guaranteeAmount} onValueChange={setGuaranteeAmount}>
          <SelectTrigger className={errors.guaranteeAmount ? "border-destructive" : ""}>
            <SelectValue placeholder="Select guarantee amount" />
          </SelectTrigger>
          <SelectContent>
            {GUARANTEE_AMOUNTS.map((g) => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          This is the amount each member guarantees in the event of winding up. $10 is standard for charities.
        </p>
        {errors.guaranteeAmount && <p className="text-destructive text-sm mt-1">{errors.guaranteeAmount}</p>}
      </div>

      {/* Estimated Annual Revenue */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Estimated Annual Revenue (for ACNC reporting)
        </label>
        <Select value={annualRevenue} onValueChange={setAnnualRevenue}>
          <SelectTrigger>
            <SelectValue placeholder="Select range..." />
          </SelectTrigger>
          <SelectContent>
            {REVENUE_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Determines ACNC reporting requirements under Governance Standard 2
        </p>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} disabled={!isFormValid} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Review & Submit <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
