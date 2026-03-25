import React from "react";

interface PillToggleProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  helperText?: string;
}

export const PillToggle: React.FC<PillToggleProps> = ({
  label,
  required,
  value,
  onChange,
  options,
  helperText,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="checkout-nav flex gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex-1 h-12 rounded-lg font-medium text-sm transition-all duration-200
              ${
                value === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:border-primary/50"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
      {helperText && (
        <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};
