import React from "react";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

const steps: Step[] = [
  { number: 1, label: "Details" },
  { number: 2, label: "Address" },
  { number: 3, label: "Contact" },
  { number: 4, label: "Committee" },
  { number: 5, label: "Registration" },
  { number: 6, label: "Review & Pay" },
];

interface IAStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const IAStepper: React.FC<IAStepperProps> = ({ currentStep, onStepClick }) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full px-2 py-3 sm:px-8 sm:py-6 bg-background">
      <div className="flex items-center justify-center max-w-4xl mx-auto">
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
                    w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center
                    text-xs sm:text-sm font-semibold transition-all
                    ${status === "done" ? "bg-[hsl(var(--success))] text-white" : ""}
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
                <div className="flex-1 flex items-center px-0.5 sm:px-3 -mt-3 sm:-mt-5">
                  <div
                    className={`h-0.5 w-full transition-colors ${step.number < currentStep ? "bg-[hsl(var(--success))]" : "bg-border"}`}
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
