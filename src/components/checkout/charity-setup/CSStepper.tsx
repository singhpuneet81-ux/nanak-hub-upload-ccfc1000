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
    <div className="w-full px-2 py-3 sm:px-8 sm:py-6">
      <div className="flex items-center justify-center max-w-xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isClickable = step.number < currentStep && onStepClick;

          return (
            <React.Fragment key={step.number}>
              <div
                className={`flex flex-col items-center shrink-0 ${isClickable ? "cursor-pointer" : ""}`}
                onClick={() => isClickable && onStepClick(step.number)}
              >
                <div
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                    text-xs sm:text-sm font-semibold transition-all
                    ${status === "done" ? "bg-[hsl(var(--cta))] text-white" : ""}
                    ${status === "active" ? "bg-[hsl(var(--cta))] text-white" : ""}
                    ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {status === "done" ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} /> : step.number}
                </div>
                <p
                  className={`
                    mt-1 sm:mt-1.5 text-[10px] sm:text-xs font-medium text-center
                    ${status === "done" || status === "active" ? "text-foreground" : "text-muted-foreground"}
                    ${status !== "active" ? "hidden sm:block" : ""}
                  `}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1 sm:px-4 -mt-3 sm:-mt-5">
                  <div
                    className={`h-0.5 w-full transition-colors ${step.number < currentStep ? "bg-[hsl(var(--cta))]" : "bg-border"}`}
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
