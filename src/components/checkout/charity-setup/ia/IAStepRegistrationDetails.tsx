import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGISTRATION_STATES = [
  { value: "VIC", label: "Victoria" },
  { value: "NSW", label: "New South Wales" },
];

const REVENUE_RANGES = [
  { value: "under_250k", label: "Under $250,000 (Small)" },
  { value: "250k_1m", label: "$250,000 - $1,000,000 (Medium)" },
  { value: "1m_5m", label: "$1,000,000 - $5,000,000 (Large)" },
  { value: "over_5m", label: "Over $5,000,000 (Large)" },
];

interface IAStepRegistrationDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export const IAStepRegistrationDetails: React.FC<IAStepRegistrationDetailsProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [regState, setRegState] = useState((customer?.iaRegState as string) || "VIC");
  const [annualRevenue, setAnnualRevenue] = useState((customer?.iaAnnualRevenue as string) || "");
  const [expectedMembers, setExpectedMembers] = useState((customer?.iaExpectedMembers as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!regState) newErrors.regState = "Please select a state for registration";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(regState);
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      iaRegState: regState,
      iaAnnualRevenue: annualRevenue,
      iaExpectedMembers: expectedMembers,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">State Registration Details</h2>
        <p className="text-muted-foreground mt-1">Additional information for state incorporation and ACNC registration</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Preferred State for Registration <span className="text-destructive">*</span>
        </label>
        <Select value={regState} onValueChange={setRegState}>
          <SelectTrigger className={errors.regState ? "border-destructive" : ""}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGISTRATION_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          We currently only offer incorporation services for Victoria and New South Wales
        </p>
        {errors.regState && <p className="text-destructive text-sm mt-1">{errors.regState}</p>}
      </div>

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

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Expected Number of Members
        </label>
        <Input
          value={expectedMembers}
          onChange={(e) => setExpectedMembers(e.target.value)}
          placeholder="Approximate number"
        />
      </div>

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
