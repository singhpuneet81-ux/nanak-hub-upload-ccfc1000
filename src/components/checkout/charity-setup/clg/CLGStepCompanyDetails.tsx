import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACNC_SUBTYPES = [
  { value: "advancing_health", label: "Advancing Health" },
  { value: "advancing_education", label: "Advancing Education" },
  { value: "advancing_social_welfare", label: "Advancing Social or Public Welfare" },
  { value: "advancing_religion", label: "Advancing Religion" },
  { value: "advancing_culture", label: "Advancing Culture" },
  { value: "advancing_natural_environment", label: "Advancing Natural Environment" },
  { value: "advancing_reconciliation", label: "Advancing Reconciliation, Mutual Respect and Tolerance" },
  { value: "advancing_human_rights", label: "Advancing Human Rights" },
  { value: "advancing_security", label: "Advancing Security/Safety of Australia or Australian Public" },
  { value: "preventing_animal_suffering", label: "Preventing or Relieving Suffering of Animals" },
  { value: "other_community", label: "Other Purpose Beneficial to Community" },
];

interface CLGStepCompanyDetailsProps {
  onNext: () => void;
}

export const CLGStepCompanyDetails: React.FC<CLGStepCompanyDetailsProps> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();

  const [companyName, setCompanyName] = useState((customer?.clgCompanyName as string) || "");
  const [altName1, setAltName1] = useState((customer?.clgAltName1 as string) || "");
  const [altName2, setAltName2] = useState((customer?.clgAltName2 as string) || "");
  const [charitySubtype, setCharitySubtype] = useState((customer?.clgCharitySubtype as string) || "");
  const [purposeStatement, setPurposeStatement] = useState((customer?.clgPurposeStatement as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = "Proposed company name is required";
    if (!charitySubtype) newErrors.charitySubtype = "Please select an ACNC charity subtype";
    if (!purposeStatement.trim()) newErrors.purposeStatement = "Charitable purpose statement is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(companyName.trim() && charitySubtype && purposeStatement.trim());
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      clgCompanyName: companyName,
      clgAltName1: altName1,
      clgAltName2: altName2,
      clgCharitySubtype: charitySubtype,
      clgPurposeStatement: purposeStatement,
      charityStructure: "company_limited_guarantee",
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Details</h2>
        <p className="text-muted-foreground mt-1">Basic information about your charitable company</p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">Company Limited by Guarantee - All States</p>
            <p className="text-sm text-muted-foreground mt-1">
              This structure is registered with <strong>ASIC (Australian Securities and Investments Commission)</strong> under the Corporations Act 2001 and is available nationwide. It's ideal for larger charities and not-for-profits requiring a more robust corporate structure with ACNC registration.
            </p>
          </div>
        </div>
      </div>

      {/* Proposed Company Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Proposed Company Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Community Foundation Australia Limited"
          className={errors.companyName ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must end with "Limited" as per ASIC naming requirements for companies limited by guarantee
        </p>
        {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName}</p>}
      </div>

      {/* Alternative Name 1 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Alternative Name 1 (Optional)
        </label>
        <Input
          value={altName1}
          onChange={(e) => setAltName1(e.target.value)}
          placeholder="In case your first choice is unavailable"
        />
      </div>

      {/* Alternative Name 2 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Alternative Name 2 (Optional)
        </label>
        <Input
          value={altName2}
          onChange={(e) => setAltName2(e.target.value)}
          placeholder="Second alternative name"
        />
      </div>

      {/* Charity Subtype */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Charity Subtype (ACNC Classification) <span className="text-destructive">*</span>
        </label>
        <Select value={charitySubtype} onValueChange={setCharitySubtype}>
          <SelectTrigger className={errors.charitySubtype ? "border-destructive" : ""}>
            <SelectValue placeholder="Select ACNC charity subtype..." />
          </SelectTrigger>
          <SelectContent>
            {ACNC_SUBTYPES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          As per ACNC Governance Standard 1 - Charitable Purpose
        </p>
        {errors.charitySubtype && <p className="text-destructive text-sm mt-1">{errors.charitySubtype}</p>}
      </div>

      {/* Charitable Purpose Statement */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Charitable Purpose Statement <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={purposeStatement}
          onChange={(e) => setPurposeStatement(e.target.value)}
          placeholder="Describe the charitable purpose and how it benefits the public or community..."
          rows={5}
          className={errors.purposeStatement ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must demonstrate public benefit and align with both ASIC and ACNC requirements
        </p>
        {errors.purposeStatement && <p className="text-destructive text-sm mt-1">{errors.purposeStatement}</p>}
      </div>

      {/* Continue */}
      <div className="checkout-nav flex justify-end pt-4">
        <button
          onClick={handleContinue} disabled={!isFormValid}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue to Registered Address
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
