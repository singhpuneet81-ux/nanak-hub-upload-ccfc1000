import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { validateABN, validateEmail, validatePhone, validateTFNOptional } from "@/utils/validation";
import { FileUpload } from "../abn/FileUpload";
import { cn } from "@/lib/utils";
import { ArrowRight, User, Building, Mail, Phone, Hash, FileText, PenTool, Check } from "lucide-react";

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <h3 className="text-sm font-medium">{title}</h3>
    </div>
    {children}
  </div>
);

const sectionVisibility = {
  "Sole Trader": {
    personal: true,
    entity: false,
    abn: false,
    contact: false,
    address: false,
  },
  Partnership: {
    personal: false,
    entity: true,
    abn: true,
    contact: true,
    address: true,
  },
  Company: {
    personal: false,
    entity: true,
    abn: true,
    contact: true,
    address: true,
  },
  "Family Trust": {
    personal: false,
    entity: true,
    abn: true,
    contact: true,
    address: true,
  },
  "Unit Trust": {
    personal: false,
    entity: true,
    abn: true,
    contact: true,
    address: true,
  },
} as const;

const clearHiddenFields = (structure: string) => {
  if (structure === "Sole Trader") {
    return {
      entityName: "",
      abn: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
    };
  }

  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tfn: "",
  };
};

const entityConfig = {
  Partnership: {
    title: "Partnership Details",
    entityLabel: "Partnership Name",
  },
  Company: {
    title: "Company Details",
    entityLabel: "Company Name",
  },
  "Family Trust": {
    title: "Trust Details",
    entityLabel: "Trust Name",
  },
  "Unit Trust": {
    title: "Trust Details",
    entityLabel: "Trust Name",
  },
};



const BUSINESS_STRUCTURES = [
  "Sole Trader",
  "Partnership",
  "Company",
  // "Trust",
  "Family Trust",
  "Unit Trust",
];


export const BNStepYourDetails: React.FC = () => {
  const { customer, updateCustomer, nextStep } = useCheckout();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate a single field immediately on change
  const validateField = (key: string, value: string) => {
    let error: string | null = null;
    if (key === "email") error = validateEmail(value);
    else if (key === "phone") error = validatePhone(value);
    else if (key === "contactEmail") error = validateEmail(value);
    else if (key === "contactPhone") error = validatePhone(value);
    else if (key === "abn") error = validateABN(value);
    else if (key === "tfn") error = validateTFNOptional(value);
    else if (key === "tfn") error = validateTFNOptional(value);
    setErrors((prev) => {
      if (!error) { const next = { ...prev }; delete next[key]; return next; }
      return { ...prev, [key]: error };
    });
  };

  const handleFieldChange = (key: string, value: string) => {
    updateCustomer({ [key]: value });
    validateField(key, value);
  };

  const visibility =
  customer.businessStructure
    ? sectionVisibility[
        customer.businessStructure as keyof typeof sectionVisibility
      ]
    : null;


  
 const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!customer.businessStructure)
    newErrors.businessStructure = "Required";

  if (!customer.proposedBusinessName?.trim())
    newErrors.proposedBusinessName = "Required";

  if (!customer.declarationAccepted)
    newErrors.declarationAccepted = "Required";

  if (!customer.signature?.trim())
    newErrors.signature = "Required";

  if (visibility?.personal) {
    if (!customer.firstName?.trim()) newErrors.firstName = "Required";
    if (!customer.lastName?.trim()) newErrors.lastName = "Required";
    const emailErr = validateEmail(customer.email || "");
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = validatePhone(customer.phone || "");
    if (phoneErr) newErrors.phone = phoneErr;
  }

  if (visibility?.entity && !customer.entityName?.trim())
    newErrors.entityName = "Required";

  if (visibility?.abn) {
    const abnErr = validateABN(customer.abn || "");
    if (abnErr) newErrors.abn = abnErr;
  }

  if (visibility?.contact) {
    if (!customer.contactName?.trim()) newErrors.contactName = "Required";
    const contactEmailErr = validateEmail(customer.contactEmail || "");
    if (contactEmailErr) newErrors.contactEmail = contactEmailErr;
    const contactPhoneErr = validatePhone(customer.contactPhone || "");
    if (contactPhoneErr) newErrors.contactPhone = contactPhoneErr;
  }

  if (visibility?.address && !customer.address?.trim())
    newErrors.address = "Required";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleContinue = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Your Name";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Your Details</h2>
        <p className="text-muted-foreground mt-1">Let's start with your information</p>
      </div>

      {/* Business Structure */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Business Structure <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={customer.businessStructure || ""}
onChange={(e) => {
  const value = e.target.value;
  updateCustomer({
    businessStructure: value,
    ...clearHiddenFields(value),
  });
}}

            className={cn(
              "w-full h-11 pl-10 pr-4 border rounded-lg text-sm bg-background appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              errors.businessStructure ? "border-destructive" : "border-border"
            )}
          >
            <option value="">Select structure</option>
            {BUSINESS_STRUCTURES.map((structure) => (
              <option key={structure} value={structure}>{structure}</option>
            ))}
          </select>
        </div>
      </div>

  {visibility?.personal && (

  <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">Your Personal Details</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={customer.firstName || ""}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              placeholder="Enter first name"
              className={cn(
                "w-full h-11 px-4 border rounded-lg text-sm bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                errors.firstName ? "border-destructive" : "border-border"
              )}
            />
            {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Last Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={customer.lastName || ""}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              placeholder="Enter last name"
              className={cn(
                "w-full h-11 px-4 border rounded-lg text-sm bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                errors.lastName ? "border-destructive" : "border-border"
              )}
            />
            {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email Address <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={customer.email || ""}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="example@email.com"
                className={cn(
                  "w-full h-11 pl-10 pr-4 border rounded-lg text-sm bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  errors.email ? "border-destructive" : "border-border"
                )}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={customer.phone || ""}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="+61 412 345 678"
                className={cn(
                  "w-full h-11 pl-10 pr-4 border rounded-lg text-sm bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  errors.phone ? "border-destructive" : "border-border"
                )}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
        </div>

        
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Tax File Number (Optional)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={customer.tfn || ""}
              onChange={(e) => handleFieldChange("tfn", e.target.value)}
              placeholder="Enter TFN"
              className={cn(
                "w-full h-11 pl-10 pr-4 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                errors.tfn ? "border-destructive" : "border-border"
              )}
            />
          </div>
          {errors.tfn && <p className="text-xs text-destructive mt-1">{errors.tfn}</p>}
        </div>
      </div>

   )}

        {/* ========== ENTITY DETAILS ========== */}
{visibility?.entity && (() => {
  const config =
    entityConfig[customer.businessStructure as keyof typeof entityConfig];

  if (!config) return null;

  return (
    <Section icon={<Building className="w-4 h-4" />} title={config.title}>
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {config.entityLabel} <span className="text-destructive">*</span>
        </label>
        <input
          value={customer.entityName || ""}
          onChange={(e) => updateCustomer({ entityName: e.target.value })}
          placeholder={`Enter ${config.entityLabel.toLowerCase()}`}
          className={cn(
            "w-full h-11 px-4 border rounded-lg text-sm",
            errors.entityName ? "border-destructive" : "border-border"
          )}
        />
      </div>
    </Section>
  );
})()}




{/* ========== ABN ========== */}
{visibility?.abn && (
  <Section icon={<Hash className="w-4 h-4" />} title="Business Identification">
    <div className="space-y-2">
      <label className="text-sm font-medium">
        ABN <span className="text-destructive">*</span>
      </label>
      <input
        value={customer.abn || ""}
        onChange={(e) => handleFieldChange("abn", e.target.value)}
        placeholder="12 345 678 901"
        className={cn(
          "w-full h-11 px-4 border rounded-lg",
          errors.abn ? "border-destructive" : "border-border"
        )}
      />
      {errors.abn && <p className="text-xs text-destructive mt-1">{errors.abn}</p>}
    </div>
  </Section>
)}


{/* ========== CONTACT PERSON ========== */}
{visibility?.contact && (
  <Section icon={<User className="w-4 h-4" />} title="Contact Person Details">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Full Name <span className="text-destructive">*</span>
        </label>
        <input
          value={customer.contactName || ""}
          onChange={(e) => handleFieldChange("contactName", e.target.value)}
          className={cn(
            "w-full h-11 px-4 border rounded-lg",
            errors.contactName ? "border-destructive" : "border-border"
          )}
        />
        {errors.contactName && <p className="text-xs text-destructive mt-1">{errors.contactName}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Phone <span className="text-destructive">*</span>
        </label>
        <input
          value={customer.contactPhone || ""}
          onChange={(e) => handleFieldChange("contactPhone", e.target.value)}
          className={cn(
            "w-full h-11 px-4 border rounded-lg",
            errors.contactPhone ? "border-destructive" : "border-border"
          )}
        />
        {errors.contactPhone && <p className="text-xs text-destructive mt-1">{errors.contactPhone}</p>}
      </div>

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          value={customer.contactEmail || ""}
          onChange={(e) => handleFieldChange("contactEmail", e.target.value)}
          className={cn(
            "w-full h-11 px-4 border rounded-lg",
            errors.contactEmail ? "border-destructive" : "border-border"
          )}
        />
        {errors.contactEmail && <p className="text-xs text-destructive mt-1">{errors.contactEmail}</p>}
      </div>
    </div>
  </Section>
)}



{/* ========== ADDRESS ========== */}
{visibility?.address && (
  <Section icon={<Building className="w-4 h-4" />} title="Business Address">
    <input
      value={customer.address || ""}
      onChange={(e) => updateCustomer({ address: e.target.value })}
      placeholder="Street, City, State, Postcode"
      className={cn(
        "w-full h-11 px-4 border rounded-lg",
        errors.address ? "border-destructive" : "border-border"
      )}
    />
  </Section>
)}






      {/* Business Name Registration Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Business Name Registration</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Proposed Business Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={customer.proposedBusinessName || ""}
            onChange={(e) => updateCustomer({ proposedBusinessName: e.target.value })}
            placeholder="Enter your desired business name"
            className={cn(
              "w-full h-11 px-4 border rounded-lg text-sm bg-background",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              errors.proposedBusinessName ? "border-destructive" : "border-border"
            )}
          />
        </div>
      </div>

      {/* Identification Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Identification (Optional)</span>
        </div>

        <FileUpload
          label="Driver License or Passport"
          required={false}
          value={customer.identificationFile}
          onChange={(file) => updateCustomer({ identificationFile: file })}
        />
      </div>

      {/* Declaration & Signature Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Declaration & Signature</span>
        </div>

        {/* Declaration Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">Applicant Declaration</h3>
              <p className="text-sm text-muted-foreground">
                Required by the Australian Securities and Investments Commission (ASIC)
              </p>
            </div>
          </div>

          <div className="bg-background rounded-lg p-4 space-y-3">
            <p className="text-sm">
              I, <span className="font-semibold text-primary">{fullName}</span>, declare that:
            </p>

            <div className="space-y-2.5">
              {[
                <>All information provided in this application is <strong>true and correct</strong> to the best of my knowledge at the time of signing</>,
                <>I have the necessary <strong>authority to register this business name</strong> on behalf of the entity specified in this application</>,
                <>I authorize <strong>Nanak Accountants & Associates</strong> to act as my registered agent in all matters relating to this business name registration with ASIC</>,
                <>I will comply with all <strong>ASIC requirements and regulations</strong> relating to the maintenance and renewal of this business name</>,
                <>I understand that providing <strong>false or misleading information</strong> is a serious offence under Australian law</>,
                <>I have read and agree to the <strong>Terms and Conditions</strong> of service</>,
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{text}</p>
                </div>
              ))}
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-amber-800">
                <span className="font-semibold text-amber-900">Important Notice: </span>
                By signing and accepting this declaration, you confirm that you have read and understood all information provided above. This electronic signature has the same legal effect as a handwritten signature.
              </p>
            </div>

            {/* Checkbox */}
            <label className={cn(
              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors mt-4",
              customer.declarationAccepted
                ? "bg-primary/5 border-primary"
                : errors.declarationAccepted
                ? "bg-destructive/5 border-destructive"
                : "bg-background border-border hover:border-primary/50"
            )}>
              <input
                type="checkbox"
                checked={customer.declarationAccepted || false}
                onChange={(e) => updateCustomer({ declarationAccepted: e.target.checked })}
                className="sr-only"
              />
              <div className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                customer.declarationAccepted
                  ? "bg-primary border-primary"
                  : "border-border"
              )}>
                {customer.declarationAccepted && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  I accept and agree to the above declaration <span className="text-destructive">*</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  By checking this box, I confirm that I have read, understood, and agree to all statements in this declaration
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Signature */}
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
            onChange={(e) => updateCustomer({ signature: e.target.value })}
            placeholder="Type your full name as signature"
            className={cn(
              "w-full h-11 px-4 border rounded-lg text-sm bg-background italic",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              errors.signature ? "border-destructive" : "border-border"
            )}
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" />
            By typing your name, you are providing a legal electronic signature
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        className="w-full h-12 bg-[hsl(var(--cta))] hover:bg-[hsl(var(--cta))]/90 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        Continue to Registration Term
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Lock icon component (inline for simplicity)
const Lock: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
