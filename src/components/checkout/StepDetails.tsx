import { ServiceConfig } from "@/types/services";
import { Button } from "@/components/ui/button";
import DynamicFormField from "./DynamicFormField";

interface StepDetailsProps {
  config: ServiceConfig;
  formData: Record<string, string>;
  onFieldChange: (name: string, value: string) => void;
  onNext: () => void;
}

const StepDetails = ({ config, formData, onFieldChange, onNext }: StepDetailsProps) => {
  const visibleFields = config.formFields.filter((field) => {
    if (!field.conditionalOn) return true;
    const condVal = field.conditionalOn.value;
    const current = formData[field.conditionalOn.field];
    return Array.isArray(condVal) ? condVal.includes(current) : current === condVal;
  });

  const requiredFields = visibleFields.filter((f) => f.required);
  const allFilled = requiredFields.every((f) => formData[f.name]?.trim());

  return (
    <div className="animate-fade-in">
      <div className="checkout-card">
        <h2 className="text-xl font-heading font-bold text-foreground mb-1">
          Your Details
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Please fill in your details for {config.displayName.toLowerCase()}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {config.formFields.map((field) => (
            <DynamicFormField
              key={field.name}
              field={field}
              value={formData[field.name] || ""}
              onChange={onFieldChange}
              allValues={formData}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} disabled={!allFilled} size="lg">
          Continue to Package Selection
        </Button>
      </div>
    </div>
  );
};

export default StepDetails;
