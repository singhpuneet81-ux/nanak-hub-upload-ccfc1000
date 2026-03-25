import React, { forwardRef } from "react";

interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
}

export const SoftInput = forwardRef<HTMLInputElement, SoftInputProps>(
  ({ label, icon, error, required, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${icon ? "soft-input-with-icon" : "soft-input"} ${
              error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

SoftInput.displayName = "SoftInput";

interface SoftSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}

export const SoftSelect = forwardRef<HTMLSelectElement, SoftSelectProps>(
  ({ label, options, error, required, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`soft-select ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

SoftSelect.displayName = "SoftSelect";

interface SoftTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const SoftTextarea = forwardRef<HTMLTextAreaElement, SoftTextareaProps>(
  ({ label, error, required, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`soft-textarea ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

SoftTextarea.displayName = "SoftTextarea";
