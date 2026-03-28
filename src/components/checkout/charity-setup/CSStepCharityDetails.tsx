import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Info, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHARITABLE_PURPOSES = [
  { id: "social_welfare", label: "Advancing social or public welfare", description: "Community services, aged care, disability support" },
  { id: "culture", label: "Advancing culture", description: "Arts, heritage, cultural activities" },
  { id: "reconciliation", label: "Advancing reconciliation", description: "Mutual respect between Indigenous and non-Indigenous Australians" },
  { id: "environment", label: "Advancing the natural environment", description: "Conservation, environmental protection" },
  { id: "animal_welfare", label: "Promoting animal welfare", description: "Prevention of cruelty to animals" },
  { id: "human_rights", label: "Advancing human rights", description: "Promoting civil liberties, equality" },
  { id: "security", label: "Advancing the security or safety of Australia", description: "Defense, emergency services" },
  { id: "other_community", label: "Other purposes beneficial to the community", description: "Other charitable purposes recognized under common law" },
];

const DGR_CATEGORIES = [
  "Public Benevolent Institution",
  "Health Promotion Charity",
  "Public or University Library",
  "Public Museum or Art Gallery",
  "Environmental Organisation",
  "Harm Prevention Charity",
  "Cultural Organisation",
];

const REVENUE_BRACKETS = [
  { value: "under_50k", label: "Under $50,000 (Small charity)" },
  { value: "50k_250k", label: "$50,000 - $250,000 (Medium charity)" },
  { value: "250k_1m", label: "$250,000 - $1,000,000 (Large charity)" },
  { value: "over_1m", label: "Over $1,000,000 (Large charity)" },
];

interface CSStepCharityDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export const CSStepCharityDetails: React.FC<CSStepCharityDetailsProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  
  const [charityName, setCharityName] = useState((customer?.charityName as string) || "");
  const [purposes, setPurposes] = useState<string[]>((customer?.charitablePurposes as string[]) || []);
  const [mainPurpose, setMainPurpose] = useState((customer?.mainPurpose as string) || "");
  const [applyDGR, setApplyDGR] = useState((customer?.applyDGR as boolean) || false);
  const [dgrCategory, setDgrCategory] = useState((customer?.dgrCategory as string) || "");
  const [expectedRevenue, setExpectedRevenue] = useState((customer?.expectedRevenue as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const togglePurpose = (purposeId: string) => {
    setPurposes(prev => 
      prev.includes(purposeId) 
        ? prev.filter(p => p !== purposeId)
        : [...prev, purposeId]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!charityName.trim()) {
      newErrors.charityName = "Charity name is required";
    }
    if (purposes.length === 0) {
      newErrors.purposes = "Please select at least one charitable purpose";
    }
    if (!mainPurpose.trim()) {
      newErrors.mainPurpose = "Please describe your charity's main purpose";
    }
    if (applyDGR && !dgrCategory) {
      newErrors.dgrCategory = "Please select a DGR category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(charityName.trim() && mainPurpose.trim() && dgrCategory);
  const handleContinue = () => {
    if (!validate()) return;

    updateCustomer({
      charityName,
      charitablePurposes: purposes,
      mainPurpose,
      applyDGR,
      dgrCategory: applyDGR ? dgrCategory : "",
      expectedRevenue,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Charity Details</h2>
        <p className="text-muted-foreground mt-1">Tell us about your charitable organization</p>
      </div>

      {/* ACNC Requirements info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">ACNC Registration Requirements</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your charity must be not-for-profit, have only charitable purposes, and be for public benefit. We'll help ensure compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Proposed Charity Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Proposed Charity Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={charityName}
          onChange={(e) => setCharityName(e.target.value)}
          placeholder="Enter charity name"
          className={errors.charityName ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">Must include appropriate suffix (Inc, Ltd, Trust)</p>
        {errors.charityName && <p className="text-destructive text-sm mt-1">{errors.charityName}</p>}
      </div>

      {/* Charitable Purposes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Charitable Purposes <span className="text-destructive">*</span>
        </label>
        <p className="text-sm text-muted-foreground mb-3">Select all that apply (ACNC recognizes 12 charitable purposes):</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHARITABLE_PURPOSES.map((purpose) => {
            const isSelected = purposes.includes(purpose.id);
            return (
              <div
                key={purpose.id}
                onClick={() => togglePurpose(purpose.id)}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${isSelected 
                    ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]" 
                    : "border-border hover:border-muted-foreground/30"
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <Checkbox checked={isSelected} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{purpose.label}</p>
                    <p className="text-xs text-muted-foreground">{purpose.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.purposes && <p className="text-destructive text-sm mt-2">{errors.purposes}</p>}
      </div>

      {/* Main Purpose */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Describe Your Charity's Main Purpose <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={mainPurpose}
          onChange={(e) => setMainPurpose(e.target.value)}
          placeholder="Describe your charity's primary purpose and activities..."
          rows={4}
          className={errors.mainPurpose ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">This will be used for ACNC registration</p>
        {errors.mainPurpose && <p className="text-destructive text-sm mt-1">{errors.mainPurpose}</p>}
      </div>

      {/* DGR Status */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={applyDGR} 
            onCheckedChange={(checked) => setApplyDGR(checked as boolean)}
          />
          <div>
            <p className="font-medium text-foreground">Apply for DGR (Deductible Gift Recipient) Status</p>
            <p className="text-sm text-muted-foreground">
              DGR status allows donors to claim tax deductions for donations over $2
            </p>
          </div>
        </div>

        {applyDGR && (
          <div className="mt-4 pl-7">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              DGR Category <span className="text-destructive">*</span>
            </label>
            <Select value={dgrCategory} onValueChange={setDgrCategory}>
              <SelectTrigger className={errors.dgrCategory ? "border-destructive" : ""}>
                <SelectValue placeholder="Select DGR category" />
              </SelectTrigger>
              <SelectContent>
                {DGR_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">DGR endorsement adds 4-8 weeks to setup time</p>
            {errors.dgrCategory && <p className="text-destructive text-sm mt-1">{errors.dgrCategory}</p>}
          </div>
        )}
      </div>

      {/* Expected Annual Revenue */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Expected Annual Revenue
        </label>
        <Select value={expectedRevenue} onValueChange={setExpectedRevenue}>
          <SelectTrigger>
            <SelectValue placeholder="Select expected revenue" />
          </SelectTrigger>
          <SelectContent>
            {REVENUE_BRACKETS.map((bracket) => (
              <SelectItem key={bracket.value} value={bracket.value}>{bracket.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Determines ACNC reporting requirements</p>
      </div>

      {/* Navigation */}
      <div className="checkout-nav hidden md:flex justify-between pt-4">
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
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
