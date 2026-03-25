  import React, { useState } from "react";
  import { useCheckout } from "@/context/CheckoutFlowProvider";
  import { validateABNOptional, validateTFNOptional, validateEmail, validatePhone } from "@/utils/validation";
  import { SoftInput, SoftSelect, SoftTextarea } from "@/components/checkout/FormInputs";
  import { PillToggle } from "@/components/checkout/abn/PillToggle";
  import { FileUpload } from "@/components/checkout/abn/FileUpload";
  import { SignaturePad } from "@/components/checkout/abn/SignaturePad";
  import { ApplicantDeclaration } from "@/components/checkout/abn/ApplicantDeclaration";
  import { PrimaryButton } from "@/components/checkout/Buttons";
  import { STATES } from "@/config/yourDetails.config";
  import { Briefcase } from "lucide-react";
  import { PenTool, Lock } from "lucide-react";
  import { cn } from "@/lib/utils"; // if not already used in project



  // ABN Occupation options from Figma
  const ABN_OCCUPATIONS = [
    { value: "accountant", label: "Accountant" },
    { value: "architect", label: "Architect" },
    { value: "builder", label: "Builder" },
    { value: "carpenter", label: "Carpenter" },
    { value: "cleaner", label: "Cleaner" },
    { value: "consultant", label: "Consultant" },
    { value: "contractor", label: "Contractor" },
    { value: "designer", label: "Designer" },
    { value: "developer", label: "Developer" },
    { value: "driver", label: "Driver" },
    { value: "electrician", label: "Electrician" },
    { value: "engineer", label: "Engineer" },
    { value: "hairdresser", label: "Hairdresser" },
    { value: "handyman", label: "Handyman" },
    { value: "it_consultant", label: "IT Consultant" },
    { value: "landscaper", label: "Landscaper" },
    { value: "mechanic", label: "Mechanic" },
    { value: "painter", label: "Painter" },
    { value: "photographer", label: "Photographer" },
    { value: "plumber", label: "Plumber" },
    { value: "rideshare", label: "Rideshare / Uber Driver" },
    { value: "tradesperson", label: "Tradesperson" },
    { value: "writer", label: "Writer" },
    { value: "other", label: "Other" },
  ];

  const BUSINESS_STRUCTURES = [
    { value: "", label: "Select business structure" },
    { value: "sole_trader", label: "Sole Trader" },
    // { value: "partnership", label: "Partnership" },
    // { value: "company", label: "Company" },
    // { value: "trust", label: "Trust" },
    // { value: "family_trust", label: "Family Trust" },
    // { value: "unit_trust", label: "Unit Trust" },
  ];

  export const ABNStepYourDetails: React.FC = () => {
    const { customer, updateCustomer, nextStep } = useCheckout();
    

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validate a single field on change and update errors immediately
  const validateField = (key: string, value: string) => {
    let error: string | null = null;
    if (key === "email") error = validateEmail(value);
    else if (key === "phone") error = validatePhone(value);
    else if (key === "tfn") error = validateTFNOptional(value);
    else if (key === "previousABN") error = validateABNOptional(value);
    else return; // No validator for this field, skip state update
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
      const required = [
        "businessStructure",
        "appliedBefore",
        "firstName",
        "lastName",
        "street",
        "city",
        "state",
        "postcode",
        "phone",
        "email",
        "occupation",
        "signature",
        "declarationAccepted",
      ];

      if (customer.occupation === "other") {
        required.push("otherOccupation");
      }
      if (customer.appliedBefore === "yes") {
        required.push("previousABN");
      }

      for (const key of required) {
        const value = customer[key];
        if (!value) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (typeof value === "boolean" && !value) return false;
      }

      // idProof checked separately (File object)
      if (!customer.idProof) return false;

      // Format validations
      if (validateEmail(customer.email || "")) return false;
      if (validatePhone(customer.phone || "")) return false;
      if (validateTFNOptional(customer.tfn || "")) return false;
      if (customer.appliedBefore === "yes" && validateABNOptional(customer.previousABN || "")) return false;

      // No need to check fieldErrors separately — inline checks above cover all format validations

      return true;
    };

    const hasSelectedBusinessStructure = Boolean(customer.businessStructure);
    return (
      <div className="content-card animate-fade-in">
        {/* Section title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Your Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please provide your information for ABN registration
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Business Structure */}
          <SoftSelect
            label="Business Structure"
            required
            value={customer.businessStructure || ""}
            options={BUSINESS_STRUCTURES}
            onChange={(e) => handleChange("businessStructure", e.target.value)}
          />

          {hasSelectedBusinessStructure && (
            <>

              {/* Have you applied for ABN before? */}
              <div>
                <label className="form-label">
                  Have you applied for ABN before?
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <PillToggle
                  value={customer.appliedBefore || ""}
                  onChange={(val) => handleChange("appliedBefore", val)}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  helperText="This helps us process your application correctly"
                />
              </div>

              {/* Conditional: Previous ABN Number */}
              {customer.appliedBefore === "yes" && (
                <SoftInput
                  label="Previous ABN Number"
                  required
                  placeholder="Enter your previously registered ABN"
                  value={customer.previousABN || ""}
                  onChange={(e) => handleChange("previousABN", e.target.value)}
                  error={fieldErrors.previousABN}
                />
              )}

              {/* Full Name - side by side */}
              <div>
                <label className="form-label">
                  Full Name
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={customer.firstName || ""}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className={cn("soft-input", fieldErrors.firstName && "border-destructive")}
                    />
                    {fieldErrors.firstName ? (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.firstName}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">First Name</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={customer.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className={cn("soft-input", fieldErrors.lastName && "border-destructive")}
                    />
                    {fieldErrors.lastName ? (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.lastName}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Last Name</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <label className="form-label">
                  Address
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={customer.street || ""}
                      onChange={(e) => handleChange("street", e.target.value)}
                      className="soft-input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Street Address</p>
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        value={customer.city || ""}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="soft-input"
                      />
                      <p className="text-xs text-muted-foreground mt-1">City</p>
                    </div>
                    <div>
                      <select
                        value={customer.state || ""}
                        onChange={(e) => handleChange("state", e.target.value)}
                        className="soft-select"
                      >
                        <option value="">Select State</option>
                        {STATES.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">State / Territory</p>
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={customer.postcode || ""}
                      onChange={(e) => handleChange("postcode", e.target.value)}
                      className="soft-input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Postal Code</p>
                  </div>
                </div>
              </div>

              {/* Phone and Email - side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SoftInput
                  label="Phone Number"
                  required
                  type="tel"
                  placeholder="+61 412 345 678"
                  value={customer.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                  error={fieldErrors.phone}
                />
                <SoftInput
                  label="E-mail"
                  required
                  type="email"
                  placeholder="example@example.com"
                  value={customer.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={fieldErrors.email}
                />
              </div>

              {/* TFN Number */}
              <div>
                <SoftInput
                  label="TFN Number"
                  type="text"
                  placeholder="Enter TFN if available"
                  value={customer.tfn || ""}
                  onChange={(e) => handleChange("tfn", e.target.value)}
                  error={fieldErrors.tfn}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional – Or apply for TFN in the next step
                </p>
              </div>

              {/* ABN Occupation */}
              {/* ABN Occupation */}
              <div>
                <label className="form-label">
                  What will be your ABN occupation
                  <span className="text-destructive ml-0.5">*</span>
                </label>

                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={customer.occupation || ""}
                    onChange={(e) => {
                      handleChange("occupation", e.target.value);

                      // Reset otherOccupation if user changes away from "other"
                      if (e.target.value !== "other") {
                        handleChange("otherOccupation", "");
                      }
                    }}
                    className="soft-select pl-11"
                  >
                    <option value="">Select an occupation</option>
                    {ABN_OCCUPATIONS.map((occ) => (
                      <option key={occ.value} value={occ.value}>
                        {occ.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Select your primary business occupation
                </p>

                {/* ✅ Conditional: Other Occupation Input */}
                {customer.occupation === "other" && (
                  <div className="mt-4">
                    <SoftInput
                      label="Please specify your occupation"
                      required
                      placeholder="Enter your occupation"
                      value={customer.otherOccupation || ""}
                      onChange={(e) =>
                        handleChange("otherOccupation", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>


              {/* File Upload */}
              <FileUpload
                label="Please upload – Driver License or Passport"
                required
                value={customer.idProof || null}
                onChange={(file) => handleChange("idProof", file)}
              />
              {/* Signature */}
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



              {/* Applicant Declaration */}
            

              {/* Continue Button */}
          
            </>
          )}
            <ApplicantDeclaration
                firstName={customer.firstName || ""}
                lastName={customer.lastName || ""}
                accepted={customer.declarationAccepted || false}
                onAcceptChange={(accepted) => handleChange("declarationAccepted", accepted)}
              />
                <div className="mt-8 hidden md:flex justify-end">
                <PrimaryButton onClick={nextStep} disabled={!isValid()}>
                  Continue
                </PrimaryButton>
              </div>

        </div>
      </div>
    );
  };
