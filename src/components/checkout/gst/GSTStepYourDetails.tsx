import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { validateABN, validateEmail, validatePhone } from "@/utils/validation";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { FileUpload } from "@/components/checkout/abn/FileUpload";
import { ApplicantDeclaration } from "@/components/checkout/abn/ApplicantDeclaration";
import { PrimaryButton } from "@/components/checkout/Buttons";
import { STATES } from "@/config/yourDetails.config";
import { Building2, PenTool, Lock, MapPin, Phone, Mail, CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BUSINESS_STRUCTURES = [
  { value: "", label: "Select your business structure" },
  { value: "sole_trader", label: "Sole Trader" },
  { value: "partnership", label: "Partnership" },
  { value: "company", label: "Company" },
  { value: "family_trust", label: "Family Trust" },
  { value: "unit_trust", label: "Unit Trust" },
];

const GST_TURNOVER_OPTIONS = [
  { value: "0-74999", label: "$0 - $74,999" },
  { value: "75000-149999", label: "$75,000 - $149,999" },
  { value: "150000-1999999", label: "$150,000 - $1,999,999" },
  { value: "2000000+", label: "$2 million - $9,999,999" },
];

const LODGEMENT_OPTIONS = [
  { value: "quarterly", label: "Quarterly", tooltip: { title: "Quarterly Lodgement", desc: "Lodge your BAS every 3 months. Most common option for small to medium businesses." } },
  { value: "annually", label: "Annually", tooltip: { title: "Annual Lodgement", desc: "Only available if your turnover is under $75,000" } },
];

const ACCOUNTING_BASIS_OPTIONS = [
  { value: "cash", label: "Cash Basis", tooltip: { title: "Cash Basis Accounting", desc: "Record income when you receive payment and expenses when you pay them. Simpler method, suitable for small businesses." } },
  { value: "accrual", label: "Accrual Basis", tooltip: { title: "Accrual Basis Accounting", desc: "Record income when earned (invoiced) and expenses when incurred, regardless of when payment is received or made. Required for businesses with turnover over $10 million." } },
];

/* Radio card with optional tooltip */
const RadioCard: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
  tooltip?: { title: string; desc: string };
}> = ({ label, selected, onClick, tooltip }) => (
  <div
    onClick={onClick}
    className={cn(
      "flex items-center justify-between gap-3 px-4 py-3.5 border rounded-xl cursor-pointer transition-all",
      selected
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/40 bg-background"
    )}
  >
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
          selected ? "border-primary" : "border-muted-foreground/40"
        )}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
    {tooltip && (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Info className="w-4 h-4 text-muted-foreground/60 hover:text-primary cursor-help flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-[280px] bg-[hsl(220_30%_15%)] text-white border-none px-4 py-3 rounded-lg shadow-xl"
          >
            <p className="font-semibold text-sm mb-1">{tooltip.title}</p>
            <p className="text-xs text-white/80 leading-relaxed">{tooltip.desc}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

/* --- Conditional field config per structure --- */
const STRUCTURE_FIELDS: Record<
  string,
  {
    abnLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    nameHelper: string;
    nameRequired: boolean;
  }
> = {
  sole_trader: {
    abnLabel: "Your ABN",
    nameLabel: "Business/Trading Name",
    namePlaceholder: "Your business or trading name (if applicable)",
    nameHelper: "Leave blank if operating under your own name",
    nameRequired: false,
  },
  partnership: {
    abnLabel: "Partnership ABN",
    nameLabel: "Business/Trading Name",
    namePlaceholder: "Your business or trading name (if applicable)",
    nameHelper: "Leave blank if operating under your own name",
    nameRequired: false,
  },
  company: {
    abnLabel: "Company ABN",
    nameLabel: "Company Name",
    namePlaceholder: "Enter your registered company name",
    nameHelper: "Must match your ASIC registered company name",
    nameRequired: true,
  },
  family_trust: {
    abnLabel: "Trust ABN",
    nameLabel: "Business/Trading Name",
    namePlaceholder: "Your business or trading name (if applicable)",
    nameHelper: "Leave blank if operating under your own name",
    nameRequired: false,
  },
  unit_trust: {
    abnLabel: "Trust ABN",
    nameLabel: "Business/Trading Name",
    namePlaceholder: "Your business or trading name (if applicable)",
    nameHelper: "Leave blank if operating under your own name",
    nameRequired: false,
  },
};

export const GSTStepYourDetails: React.FC = () => {
  const { customer, updateCustomer, nextStep } = useCheckout();

  const structure = customer.businessStructure || "";
  const hasSelectedBusinessStructure = Boolean(structure);
  const structureConfig = STRUCTURE_FIELDS[structure];

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validate a single field immediately on change
  const validateField = (key: string, value: string) => {
    let error: string | null = null;
    if (key === "email") error = validateEmail(value);
    else if (key === "phone") error = validatePhone(value);
    else if (key === "abn") error = validateABN(value);
    setFieldErrors((prev) => {
      if (!error) { const next = { ...prev }; delete next[key]; return next; }
      return { ...prev, [key]: error };
    });
  };

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
    if (typeof value === "string") validateField(key, value);
  };

  const isValid = () => {
    if (!customer.businessStructure) return false;

    const required = [
      "businessStructure",
      "firstName",
      "lastName",
      "phone",
      "email",
      "street",
      "suburb",
      "state",
      "postcode",
      "abn",
      "gstStartDate",
      "lodgementCycle",
      "accountingBasis",
      "gstTurnover",
      "idProof",
      "signature",
      "declarationAccepted",
    ];

    // Company requires businessName
    if (structure === "company") {
      required.push("businessName");
    }

    for (const key of required) {
      const value = customer[key];
      if (!value) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (typeof value === "boolean" && !value) return false;
    }

    // Format validations
    if (validateEmail(customer.email || "")) return false;
    if (validatePhone(customer.phone || "")) return false;
    if (validateABN(customer.abn || "")) return false;

    return true;
  };

  return (
    <div className="content-card animate-fade-in">
      {/* Section title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Your Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please provide your information for GST registration
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Business Structure */}
        <div>
          <label className="form-label">
            Business Structure
            <span className="text-destructive ml-0.5">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <select
              value={structure}
              onChange={(e) => handleChange("businessStructure", e.target.value)}
              className="soft-select pl-11"
            >
              {BUSINESS_STRUCTURES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasSelectedBusinessStructure && structureConfig && (
          <>
            {/* Contact Person Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftInput
                label="Contact Person First Name"
                required
                placeholder="First Name"
                value={customer.firstName || ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <SoftInput
                label="Contact Person Last Name"
                required
                placeholder="Last Name"
                value={customer.lastName || ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftInput
                label="Phone Number"
                required
                placeholder="0400 000 000"
                icon={<Phone className="w-4 h-4" />}
                value={customer.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={fieldErrors.phone}
              />
              <SoftInput
                label="Email Address"
                required
                type="email"
                placeholder="your@email.com"
                icon={<Mail className="w-4 h-4" />}
                value={customer.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                error={fieldErrors.email}
              />
            </div>

            {/* Business Address */}
            <div>
              <label className="form-label">
                Business Address
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    value={customer.street || ""}
                    onChange={(e) => handleChange("street", e.target.value)}
                    className="soft-input pl-11"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Suburb"
                      value={customer.suburb || ""}
                      onChange={(e) => handleChange("suburb", e.target.value)}
                      className="soft-input"
                    />
                  </div>
                  <div>
                    <select
                      value={customer.state || ""}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="soft-select"
                    >
                      <option value="">State</option>
                      {STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Postcode"
                      value={customer.postcode || ""}
                      onChange={(e) => handleChange("postcode", e.target.value)}
                      className="soft-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ABN - label changes per structure */}
            <div>
              <SoftInput
                label={structureConfig.abnLabel}
                required
                placeholder="12 345 678 910"
                value={customer.abn || ""}
                onChange={(e) => handleChange("abn", e.target.value)}
                error={fieldErrors.abn}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your 11-digit Australian Business Number
              </p>
            </div>

            {/* Business/Company Name - label, placeholder, required change per structure */}
            <div>
              <SoftInput
                label={structureConfig.nameLabel}
                required={structureConfig.nameRequired}
                placeholder={structureConfig.namePlaceholder}
                value={customer.businessName || ""}
                onChange={(e) => handleChange("businessName", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {structureConfig.nameHelper}
              </p>
            </div>

            {/* Date of GST Registration */}
            <div>
              <label className="form-label">
                Date of GST Registration <span className="text-destructive ml-0.5">*</span>
              </label>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !customer.gstStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customer.gstStartDate || <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={customer.gstStartDate ? new Date(customer.gstStartDate.split("-").reverse().join("-")) : undefined}
                    onSelect={(date) => date && handleChange("gstStartDate", format(date, "dd-MM-yyyy"))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                Click to select the date when you want the registration to start
              </p>
            </div>

            {/* Lodgement Cycle */}
            <div>
              <label className="form-label">
                Lodgement Cycle
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LODGEMENT_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    label={opt.label}
                    selected={customer.lodgementCycle === opt.value}
                    onClick={() => handleChange("lodgementCycle", opt.value)}
                    tooltip={opt.tooltip}
                  />
                ))}
              </div>
            </div>

            {/* Accounting Basis */}
            <div>
              <label className="form-label">
                Accounting Basis
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ACCOUNTING_BASIS_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    label={opt.label}
                    selected={customer.accountingBasis === opt.value}
                    onClick={() => handleChange("accountingBasis", opt.value)}
                    tooltip={opt.tooltip}
                  />
                ))}
              </div>
            </div>

            {/* GST Turnover */}
            <div>
              <label className="form-label">
                GST Turnover
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <div className="space-y-2">
                {GST_TURNOVER_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    label={opt.label}
                    selected={customer.gstTurnover === opt.value}
                    onClick={() => handleChange("gstTurnover", opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* File Upload */}
            <FileUpload
              label="Please upload – Driver License or Passport"
              required
              value={customer.idProof || null}
              onChange={(file) => handleChange("idProof", file)}
            />

            {/* Signature - Text Input Style (like ABN/BN) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  Your Signature <span className="text-destructive">*</span>
                </label>
              </div>

              <input
                type="text"
                value={customer.signature || ""}
                onChange={(e) =>
                  handleChange(
                    "signature",
                    e.target.value.replace(/\b\w/g, (c) => c.toUpperCase())
                  )
                }
                placeholder="Type your full name as signature"
                className={cn(
                  "w-full h-11 px-4 border rounded-lg text-sm bg-background italic",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  customer.signature ? "border-primary" : "border-border"
                )}
              />

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                By typing your name, you are providing a legal electronic signature
              </p>
            </div>

          
          </>
        )}
          {/* Applicant Declaration */}
            <ApplicantDeclaration
              firstName={customer.firstName || ""}
              lastName={customer.lastName || ""}
              accepted={customer.declarationAccepted || false}
              onAcceptChange={(accepted) => handleChange("declarationAccepted", accepted)}
            />

            {/* Continue Button */}
            <div className="mt-8 flex justify-end">
              <PrimaryButton onClick={nextStep} disabled={!isValid()}>
                Continue
              </PrimaryButton>
            </div>
      </div>
    </div>
  );
};
