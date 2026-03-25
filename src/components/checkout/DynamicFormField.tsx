import { FormFieldConfig } from "@/types/services";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: string;
  onChange: (name: string, value: string) => void;
  allValues: Record<string, string>;
}

const DynamicFormField = ({ field, value, onChange, allValues }: DynamicFormFieldProps) => {
  // Conditional rendering check
  if (field.conditionalOn) {
    const condField = field.conditionalOn.field;
    const condValue = field.conditionalOn.value;
    const currentVal = allValues[condField];

    if (Array.isArray(condValue)) {
      if (!condValue.includes(currentVal)) return null;
    } else {
      if (currentVal !== condValue) return null;
    }
  }

  const id = `field-${field.name}`;

  return (
    <div className={field.halfWidth ? "col-span-1" : "col-span-2"}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground mb-1.5 block">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {field.type === "select" ? (
        <Select value={value || ""} onValueChange={(v) => onChange(field.name, v)}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          id={id}
          value={value || ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      ) : (
        <Input
          id={id}
          type={field.type}
          value={value || ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
};

export default DynamicFormField;
