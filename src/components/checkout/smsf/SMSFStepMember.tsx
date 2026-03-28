import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { validateEmail, validatePhone, validateTFNOptional } from "@/utils/validation";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { FileUpload } from "@/components/checkout/abn/FileUpload";
import { Counter } from "@/components/checkout/Counter";
import { STATES } from "@/config/yourDetails.config";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  User, MapPin, Briefcase, Shield, Upload, Heart, FileText,
  CalendarIcon, Plus, Trash2, ChevronDown, ChevronUp, Info
} from "lucide-react";

const TITLE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
  { value: "Miss", label: "Miss" },
  { value: "Dr", label: "Dr" },
];

const MARITAL_OPTIONS = [
  { value: "", label: "Select" },
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "de_facto", label: "De Facto" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "Select" },
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "", label: "Select relationship" },
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "none", label: "None" },
];

interface Beneficiary {
  id: string;
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  percentage: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
}

const createEmptyBeneficiary = (): Beneficiary => ({
  id: crypto.randomUUID(),
  fullName: "",
  relationship: "",
  dateOfBirth: "",
  percentage: "",
  address: "",
  city: "",
  state: "",
  postcode: "",
});

const COMPLIANCE_QUESTIONS = [
  "Have any of the Members/directors been convicted of an offence in regard of dishonest conduct in the Commonwealth, or any state, territory or foreign country?",
  "Has a civil penalty order ever been made in relation to any of the Members/directors?",
  "Are any of the Members/directors an undischarged bankrupt?",
  "Have any of the Members/directors been notified that they are a disqualified person by the Regulator (ATO)?",
  "Have any of the Members/directors have a history of bankruptcy? If yes, the SMSF ABN registration details and super rollover process may be delayed by the ATO.",
  "Do any of the Members/directors have a current tax debt or tax payment plan with the ATO? If yes, the SMSF ABN registration details and super rollover process may be delayed by the ATO.",
  "Have you previously had a Self-Managed Super Fund? If yes, the SMSF ABN registration details and super rollover process may be delayed by the ATO.",
  "Do any of the Members/directors and any associated entities (trusts, company, etc) have a current tax debt or tax payment plan with the ATO? If yes, the SMSF ABN registration details and super rollover process may be delayed by the ATO.",
];

interface SMSFStepMemberProps {
  memberIndex: number; // 0-based
  onNext: () => void;
  onBack: () => void;
}

export const SMSFStepMember: React.FC<SMSFStepMemberProps> = ({
  memberIndex,
  onNext,
  onBack,
}) => {
  const { customer, updateCustomer } = useCheckout();
  const memberCount = customer.smsfMemberCount || 1;

  const memberKey = `smsfMember${memberIndex}`;
  const member = customer[memberKey] || {};

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "personal", "address", "additional", "din", "identity", "compliance"
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMember = (field: string, value: any) => {
    updateCustomer({
      [memberKey]: { ...member, [field]: value },
    });
    // Real-time validation for key fields
    if (typeof value === "string") {
      let error: string | null = null;
      if (field === "email") error = validateEmail(value);
      else if (field === "phone") error = validatePhone(value);
      else if (field === "tfn") error = validateTFNOptional(value);
      setErrors((prev) => {
        if (!error) { const next = { ...prev }; delete next[field]; return next; }
        return { ...prev, [field]: error };
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Beneficiaries
  const beneficiaries: Beneficiary[] = member.beneficiaries || [createEmptyBeneficiary()];

  const updateBeneficiary = (id: string, field: string, value: any) => {
    const updated = beneficiaries.map((b) =>
      b.id === id ? { ...b, [field]: value } : b
    );
    updateMember("beneficiaries", updated);
  };

  const addBeneficiary = () => {
    updateMember("beneficiaries", [...beneficiaries, createEmptyBeneficiary()]);
  };

  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length <= 1) return;
    updateMember("beneficiaries", beneficiaries.filter((b) => b.id !== id));
  };

  // Compliance answers
  const complianceAnswers: Record<number, string> = member.complianceAnswers || {};
  const updateCompliance = (qIndex: number, answer: string) => {
    updateMember("complianceAnswers", { ...complianceAnswers, [qIndex]: answer });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!(member.firstName || "").trim()) newErrors.firstName = "Required";
    if (!(member.lastName || "").trim()) newErrors.lastName = "Required";
    const emailErr = validateEmail(member.email || "");
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = validatePhone(member.phone || "");
    if (phoneErr) newErrors.phone = phoneErr;
    if (!(member.dateOfBirth || "").trim()) newErrors.dateOfBirth = "Required";
    if (!(member.addressLine1 || "").trim()) newErrors.addressLine1 = "Required";
    if (!(member.state || "").trim()) newErrors.state = "Required";
    if (!(member.postcode || "").trim()) newErrors.postcode = "Required";
    if (!(member.occupation || "").trim()) newErrors.occupation = "Required";
    if (member.placeOfBirth === "overseas" && !(member.countryOfBirth || "").trim()) newErrors.countryOfBirth = "Required";
    if (member.hasDIN === "yes" && !(member.dinNumber || "").trim()) newErrors.dinNumber = "Required";
    // TFN is optional but validate format if provided
    const tfnErr = validateTFNOptional(member.tfn || "");
    if (tfnErr) newErrors.tfn = tfnErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    onNext();
  };

  const SectionHeader = ({ icon, title, subtitle, section, optional }: { icon: React.ReactNode; title: string; subtitle: string; section: string; optional?: boolean }) => (
    <button
      type="button"
      className="flex items-center justify-between w-full"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {title}
            {optional && (
              <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Optional</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {expandedSections.includes(section) ? (
        <ChevronUp className="w-5 h-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Member Header */}
      <div className="bg-primary text-primary-foreground rounded-xl p-5">
        <p className="text-sm opacity-80">Step {memberIndex + 2} of {memberCount + 3}</p>
        <h2 className="text-xl font-bold">Member {memberIndex + 1} Details</h2>
        <p className="text-sm opacity-80 mt-1">This member will be a director and shareholder of the trustee company</p>
      </div>

      {/* Personal Details */}
      <div className="content-card">
        <SectionHeader icon={<User className="w-4 h-4 text-primary" />} title="Personal Details" subtitle="Legal name as it appears on official documents" section="personal" />
        {expandedSections.includes("personal") && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SoftSelect
                label="Title"
                options={TITLE_OPTIONS}
                value={member.title || ""}
                onChange={(e) => updateMember("title", e.target.value)}
              />
              <div>
                <SoftInput
                  label="First Name"
                  required
                  placeholder="First name"
                  value={member.firstName || ""}
                  onChange={(e) => updateMember("firstName", e.target.value)}
                  error={errors.firstName}
                />
              </div>
              <div>
                <SoftInput
                  label="Middle Name"
                  placeholder="Middle name"
                  value={member.middleName || ""}
                  onChange={(e) => updateMember("middleName", e.target.value)}
                />
              </div>
              <div>
                <SoftInput
                  label="Last Name"
                  required
                  placeholder="Last name"
                  value={member.lastName || ""}
                  onChange={(e) => updateMember("lastName", e.target.value)}
                  error={errors.lastName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SoftInput
                  label="Email Address"
                  required
                  type="email"
                  placeholder="email@example.com"
                  value={member.email || ""}
                  onChange={(e) => updateMember("email", e.target.value)}
                  error={errors.email}
                />
                <p className="text-xs text-muted-foreground mt-1">For super statements and fund correspondence</p>
              </div>
              <div>
                <SoftInput
                  label="Phone Number"
                  required
                  type="tel"
                  placeholder="04XX XXX XXX"
                  value={member.phone || ""}
                  onChange={(e) => updateMember("phone", e.target.value)}
                  error={errors.phone}
                />
                <p className="text-xs text-muted-foreground mt-1">ATO-required contact number</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !member.dateOfBirth && "text-muted-foreground",
                        errors.dateOfBirth && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {member.dateOfBirth || <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={member.dateOfBirth ? new Date(member.dateOfBirth.split("-").reverse().join("-")) : undefined}
                      onSelect={(date) => updateMember("dateOfBirth", date ? format(date, "dd-MM-yyyy") : "")}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">Used for age-based super regulations</p>
                {errors.dateOfBirth && <p className="text-destructive text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
              <SoftInput
                label="Tax File Number (TFN)"
                placeholder="XXX XXX XXX"
                value={member.tfn || ""}
                onChange={(e) => updateMember("tfn", e.target.value)}
                error={errors.tfn}
              />
            </div>
          </div>
        )}
      </div>

      {/* Residential Address */}
      <div className="content-card">
        <SectionHeader icon={<MapPin className="w-4 h-4 text-primary" />} title="Residential Address" subtitle="Current home address" section="address" />
        {expandedSections.includes("address") && (
          <div className="mt-4 space-y-4">
            <SoftInput
              label="Address Line 1"
              required
              placeholder="Street address"
              value={member.addressLine1 || ""}
              onChange={(e) => updateMember("addressLine1", e.target.value)}
              error={errors.addressLine1}
            />
            <SoftInput
              label="Address Line 2"
              placeholder="Apartment, suite, unit (optional)"
              value={member.addressLine2 || ""}
              onChange={(e) => updateMember("addressLine2", e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SoftInput
                label="City / Suburb"
                required
                placeholder="City"
                value={member.city || ""}
                onChange={(e) => updateMember("city", e.target.value)}
              />
              <SoftSelect
                label="State"
                required
                options={[{ value: "", label: "Select" }, ...STATES]}
                value={member.state || ""}
                onChange={(e) => updateMember("state", e.target.value)}
                error={errors.state}
              />
              <SoftInput
                label="Postcode"
                required
                placeholder="0000"
                value={member.postcode || ""}
                onChange={(e) => updateMember("postcode", e.target.value)}
                error={errors.postcode}
              />
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="content-card">
        <SectionHeader icon={<Briefcase className="w-4 h-4 text-primary" />} title="Additional Information" subtitle="Required for compliance" section="additional" />
        {expandedSections.includes("additional") && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SoftInput
                  label="Occupation"
                  required
                  placeholder="e.g., Accountant, Engineer"
                  value={member.occupation || ""}
                  onChange={(e) => updateMember("occupation", e.target.value)}
                  error={errors.occupation}
                />
                <p className="text-xs text-muted-foreground mt-1">Your current or most recent occupation</p>
              </div>
              <SoftSelect
                label="Marital Status"
                options={MARITAL_OPTIONS}
                value={member.maritalStatus || ""}
                onChange={(e) => updateMember("maritalStatus", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SoftSelect
                  label="Employment Status"
                  options={EMPLOYMENT_OPTIONS}
                  value={member.employmentStatus || ""}
                  onChange={(e) => updateMember("employmentStatus", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">ATO required for contribution validations</p>
              </div>
              <div>
                <SoftInput
                  label="Relationship to Other Members"
                  placeholder="e.g., Spouse, Parent, Sibling, None"
                  value={member.relationshipToOthers || ""}
                  onChange={(e) => updateMember("relationshipToOthers", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">ATO required for related party transaction rules</p>
              </div>
            </div>
            <div>
              <label className="form-label">
                Place of Birth <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`${memberKey}-birthPlace`}
                    value="australia"
                    checked={member.placeOfBirth === "australia"}
                    onChange={() => updateMember("placeOfBirth", "australia")}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">Born in Australia</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`${memberKey}-birthPlace`}
                    value="overseas"
                    checked={member.placeOfBirth === "overseas"}
                    onChange={() => updateMember("placeOfBirth", "overseas")}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">Born outside Australia</span>
                </label>
              </div>
              {member.placeOfBirth === "australia" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <SoftSelect
                    label="State"
                    required
                    options={[{ value: "", label: "Select" }, ...STATES]}
                    value={member.birthState || ""}
                    onChange={(e) => updateMember("birthState", e.target.value)}
                  />
                  <SoftInput
                    label="City"
                    required
                    placeholder="e.g., Sydney, Melbourne"
                    value={member.birthCity || ""}
                    onChange={(e) => updateMember("birthCity", e.target.value)}
                  />
                </div>
              )}
              {member.placeOfBirth === "overseas" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <SoftInput
                    label="Country of Birth"
                    required
                    placeholder="e.g., India, United Kingdom, China"
                    value={member.countryOfBirth || ""}
                    onChange={(e) => updateMember("countryOfBirth", e.target.value)}
                    error={errors.countryOfBirth}
                  />
                  <SoftInput
                    label="City"
                    required
                    placeholder="e.g., Mumbai, London"
                    value={member.birthCity || ""}
                    onChange={(e) => updateMember("birthCity", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Director Identification Number (DIN) */}
      <div className="content-card">
        <SectionHeader icon={<Shield className="w-4 h-4 text-primary" />} title="Director Identification Number (DIN)" subtitle="Required for corporate trustees" section="din" />
        {expandedSections.includes("din") && (
          <div className="mt-4 space-y-3">
            <label className="form-label">
              Do you have a Director Identification Number? <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`${memberKey}-din`}
                  value="yes"
                  checked={member.hasDIN === "yes"}
                  onChange={() => updateMember("hasDIN", "yes")}
                  className="accent-primary"
                />
                <span className="text-sm font-medium text-foreground">Yes, I have a DIN</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`${memberKey}-din`}
                  value="no"
                  checked={member.hasDIN === "no"}
                  onChange={() => updateMember("hasDIN", "no")}
                  className="accent-primary"
                />
                <span className="text-sm font-medium text-foreground">No, I need to apply</span>
              </label>
            </div>

            {member.hasDIN === "yes" && (
              <SoftInput
                label="DIN Number"
                required
                placeholder="Enter your Director Identification Number"
                value={member.dinNumber || ""}
                onChange={(e) => updateMember("dinNumber", e.target.value)}
                error={errors.dinNumber}
              />
            )}

            <p className="text-xs text-muted-foreground">
              A DIN is mandatory for all company directors. view your DIN at{" "}
              <a href="https://www.abrs.gov.au" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                abrs.gov.au
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Identity Verification */}
      <div className="content-card">
        <SectionHeader icon={<Upload className="w-4 h-4 text-primary" />} title="Identity Verification" subtitle="Upload passport or driver's licence" section="identity" />
        {expandedSections.includes("identity") && (
          <div className="mt-4">
            <FileUpload
              label="Click to upload documents"
              required={false}
              value={member.identityDoc || null}
              onChange={(file) => updateMember("identityDoc", file)}
            />
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max 5MB each)</p>
          </div>
        )}
      </div>

      {/* Indicative Beneficiary Details */}
      <div className="content-card">
        <SectionHeader icon={<Heart className="w-4 h-4 text-primary" />} title="Indicative Beneficiary Details (Death Benefit Planning)" subtitle="Identify your intended beneficiaries" section="beneficiary" optional />
        {expandedSections.includes("beneficiary") && (
          <div className="mt-4 space-y-4">
            <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                The information below is collected to understand your intended beneficiaries.
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                This is not a Binding Death Benefit Nomination <span className="font-normal text-muted-foreground">and does not, by itself, determine who will receive SMSF benefits on death.</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Final outcomes depend on trustee decisions and formal documentation executed after the SMSF is established.
              </p>
            </div>

            {beneficiaries.map((ben, i) => (
              <div key={ben.id} className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Beneficiary {i + 1}</h4>
                  {beneficiaries.length > 1 && (
                    <button onClick={() => removeBeneficiary(ben.id)} className="text-destructive text-sm hover:underline flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SoftInput
                    label="Full Name"
                    required
                    placeholder="Beneficiary name"
                    value={ben.fullName}
                    onChange={(e) => updateBeneficiary(ben.id, "fullName", e.target.value)}
                  />
                  <SoftSelect
                    label="Relationship"
                    required
                    options={RELATIONSHIP_OPTIONS}
                    value={ben.relationship}
                    onChange={(e) => updateBeneficiary(ben.id, "relationship", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !ben.dateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {ben.dateOfBirth || <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                        <Calendar
                          mode="single"
                          selected={ben.dateOfBirth ? new Date(ben.dateOfBirth.split("-").reverse().join("-")) : undefined}
                          onSelect={(date) => date && updateBeneficiary(ben.id, "dateOfBirth", format(date, "dd-MM-yyyy"))}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <SoftInput
                    label="Percentage (%)"
                    placeholder="e.g., 50"
                    value={ben.percentage}
                    onChange={(e) => updateBeneficiary(ben.id, "percentage", e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Must total 100% across all beneficiaries</p>
                <SoftInput
                  label="Address"
                  required
                  placeholder="Street address"
                  value={ben.address}
                  onChange={(e) => updateBeneficiary(ben.id, "address", e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SoftInput
                    label="City"
                    placeholder="City"
                    value={ben.city}
                    onChange={(e) => updateBeneficiary(ben.id, "city", e.target.value)}
                  />
                  <SoftSelect
                    label="State"
                    options={[{ value: "", label: "Select" }, ...STATES]}
                    value={ben.state}
                    onChange={(e) => updateBeneficiary(ben.id, "state", e.target.value)}
                  />
                  <SoftInput
                    label="Postcode"
                    placeholder="0000"
                    value={ben.postcode}
                    onChange={(e) => updateBeneficiary(ben.id, "postcode", e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addBeneficiary}
              className="w-full border-2 border-dashed border-primary/30 rounded-lg py-3 text-sm font-medium text-primary hover:bg-primary/5 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Another Beneficiary
            </button>
          </div>
        )}
      </div>

      {/* Compliance Declarations */}
      <div className="content-card">
        <SectionHeader icon={<FileText className="w-4 h-4 text-primary" />} title="Compliance Declarations" subtitle="As relates to all Members/Directors of the SMSF" section="compliance" />
        {expandedSections.includes("compliance") && (
          <div className="mt-4 space-y-4">
            {COMPLIANCE_QUESTIONS.map((question, qIndex) => (
              <div key={qIndex} className="rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground mb-3">{question}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateCompliance(qIndex, "yes")}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      complianceAnswers[qIndex] === "yes"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:bg-muted"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCompliance(qIndex, "no")}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      complianceAnswers[qIndex] === "no"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:bg-muted"
                    )}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={onBack} className="sm:w-32" />
        <PrimaryButton onClick={handleContinue} disabled={!(member.firstName || "").trim() || !(member.lastName || "").trim() || !(member.email || "").trim()} className="flex-1">
          {memberIndex < memberCount - 1
            ? `Continue to Member ${memberIndex + 2} Details`
            : "Continue to Add-ons"}
        </PrimaryButton>
      </div>
    </div>
  );
};
