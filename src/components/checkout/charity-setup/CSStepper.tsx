import React from "react";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

const steps: Step[] = [
  { number: 1, label: "Structure" },
  { number: 2, label: "Details" },
  { number: 3, label: "Address" },
  { number: 4, label: "Trustees" },
  { number: 5, label: "Payment" },
  { number: 6, label: "Review & Pay" },
];

interface CSStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const CSStepper: React.FC<CSStepperProps> = ({ currentStep, onStepClick }) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full px-4 py-5 md:px-8 md:py-6">
      <div className="flex items-center justify-center max-w-xl mx-auto">
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
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${status === "done" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : ""}
                    ${status === "active" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : ""}
                    ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {status === "done" ? <Check size={16} strokeWidth={2.5} /> : step.number}
                </div>
                <p
                  className={`
                    mt-1.5 text-xs font-medium whitespace-nowrap hidden md:block
                    ${status === "done" || status === "active" ? "text-foreground" : "text-muted-foreground"}
                  `}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-2 md:px-4 -mt-5 md:-mt-5">
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
