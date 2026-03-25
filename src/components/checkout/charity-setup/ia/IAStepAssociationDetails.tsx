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

interface IAStepAssociationDetailsProps {
  onNext: () => void;
}

export const IAStepAssociationDetails: React.FC<IAStepAssociationDetailsProps> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();

  const [associationName, setAssociationName] = useState((customer?.iaAssociationName as string) || "");
  const [altName1, setAltName1] = useState((customer?.iaAltName1 as string) || "");
  const [altName2, setAltName2] = useState((customer?.iaAltName2 as string) || "");
  const [charitySubtype, setCharitySubtype] = useState((customer?.iaCharitySubtype as string) || "");
  const [purposeStatement, setPurposeStatement] = useState((customer?.iaPurposeStatement as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!associationName.trim()) newErrors.associationName = "Proposed association name is required";
    if (!charitySubtype) newErrors.charitySubtype = "Please select an ACNC charity subtype";
    if (!purposeStatement.trim()) newErrors.purposeStatement = "Charitable purpose statement is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(associationName.trim() && charitySubtype && purposeStatement.trim());
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      iaAssociationName: associationName,
      iaAltName1: altName1,
      iaAltName2: altName2,
      iaCharitySubtype: charitySubtype,
      iaPurposeStatement: purposeStatement,
      charityStructure: "incorporated_association",
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Association Details</h2>
        <p className="text-muted-foreground mt-1">Basic information about your charitable association</p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">Service Availability - VIC & NSW Only</p>
            <p className="text-sm text-muted-foreground mt-1">
              We currently provide Incorporated Association registration services for <strong>Victoria (VIC)</strong> and <strong>New South Wales (NSW)</strong> only. Each state has unique incorporation requirements under their respective Associations Incorporation Acts. We're expanding to other states soon.
            </p>
          </div>
        </div>
      </div>

      {/* Proposed Association Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Proposed Association Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={associationName}
          onChange={(e) => setAssociationName(e.target.value)}
          placeholder="e.g., Community Support Association Inc."
          className={errors.associationName ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must include "Incorporated" or "Inc." in the name as per ACNC and state regulations
        </p>
        {errors.associationName && <p className="text-destructive text-sm mt-1">{errors.associationName}</p>}
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
          Must demonstrate public benefit and align with ACNC's definition of charity
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
