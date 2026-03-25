import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import {
  SoftInput,
  SoftSelect,
  SoftTextarea,
} from "@/components/checkout/FormInputs";
import { UploadBox } from "@/components/checkout/UploadBox";
import { DeclarationBox } from "@/components/checkout/DeclarationBox";
import { ButtonGroup } from "@/components/checkout/Buttons";
import { YOUR_DETAILS_FORMS } from "@/config/yourDetails.config";

/* ================================
   NORMALIZE SELECT OPTIONS
================================ */
const normalizeOptions = (options: any[] = []) =>
  options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

/* ================================
   FIELD RENDERER
================================ */
const renderField = (
  field: any,
  value: any,
  onChange: (key: string, value: any) => void
) => {
  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "date":
      return (
        <SoftInput
          label={field.label}
          required={field.required}
          type={field.type}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "phone":
      return (
        <SoftInput
          label={field.label}
          required={field.required}
          placeholder="04XX XXX XXX"
          value={value || ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "textarea":
      return (
        <SoftTextarea
          label={field.label}
          required={field.required}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "select":
      return (
        <SoftSelect
          label={field.label}
          required={field.required}
          value={value || ""}
          options={[
            { value: "", label: "Select an option" },
            ...normalizeOptions(field.options),
          ]}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "radio":
      return (
        <div className="space-y-2">
          <label className="form-label">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </label>

          <div className="flex flex-wrap gap-4">
            {field.options?.map((opt: string) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={field.key}
                  checked={value === opt}
                  onChange={() => onChange(field.key, opt)}
                />
                {opt}
              </label>
            ))}
          </div>

          {field.helperText && (
            <p className="text-xs text-muted-foreground">
              {field.helperText}
            </p>
          )}
        </div>
      );

    case "file":
      return (
        <UploadBox
          label={field.label}
          selectedFile={value}
          onFileSelect={(file) => onChange(field.key, file)}
        />
      );

    case "signature":
      return (
        <DeclarationBox
          accepted={true}
          onAcceptChange={() => {}}
          signature={value || ""}
          onSignatureChange={(sig) => onChange(field.key, sig)}
        />
      );

    default:
      return null;
  }
};

/* ================================
   MAIN COMPONENT
================================ */
export const StepYourDetails: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep, isStepValid, serviceKey } =
    useCheckout();

  // Get form config based on serviceKey from context
  const formConfig = YOUR_DETAILS_FORMS[serviceKey];

  if (!formConfig) {
    return <p className="text-red-500">Invalid service selected.</p>;
  }

  const handleFieldChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
  };

  return (
    <div className="content-card animate-fade-in overflow-visible">
      <h2 className="text-2xl font-bold mb-6">Your Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formConfig.fields.map((field) => (
          <div
            key={field.key}
            className={
              ["textarea", "file", "signature"].includes(field.type)
                ? "md:col-span-2"
                : ""
            }
          >
            {renderField(field, customer[field.key as keyof typeof customer], handleFieldChange)}
          </div>
        ))}
      </div>

      <ButtonGroup
        continueText="Continue"
        onContinue={nextStep}
        onBack={prevStep}
        continueDisabled={!isStepValid(1)}
        showBack
      />
    </div>
  );
};
