import React from "react";
import { Check } from "lucide-react";

const steps = [
  { number: 1, label: "Company Details" },
  { number: 2, label: "Package Selection" },
  { number: 3, label: "Add-ons" },
  { number: 4, label: "Review & Complete" },
];

interface ASICStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const ASICStepper: React.FC<ASICStepperProps> = ({ currentStep, onStepClick }) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full px-4 py-5 md:px-8 md:py-6 bg-background">
      <div className="flex items-center justify-center max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isClickable = step.number < currentStep && onStepClick;

          return (
            <React.Fragment key={step.number}>
              <div
                className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : ""}`}
                onClick={() => isClickable && onStepClick(step.number)}
              >
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${status === "done" ? "bg-[hsl(var(--success))] text-white" : ""}
                    ${status === "active" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : ""}
                    ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {status === "done" ? <Check size={16} strokeWidth={2.5} /> : step.number}
                </div>
                <p
                  className={`
                    mt-1.5 text-xs font-medium whitespace-nowrap
                    ${status === "active" ? "text-[hsl(var(--cta))]" : ""}
                    ${status === "done" ? "text-foreground" : ""}
                    ${status === "pending" ? "text-muted-foreground" : ""}
                    ${status !== "active" ? "hidden sm:block" : ""}
                  `}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1 md:px-3 -mt-5 md:-mt-5">
                  <div
                    className={`
                      h-0.5 w-full transition-colors
                      ${step.number < currentStep ? "bg-[hsl(var(--cta))] disabled:opacity-50" : "bg-border"}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
