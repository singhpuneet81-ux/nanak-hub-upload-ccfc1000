import React from "react";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: "Company Details" },
  { number: 2, label: "Address" },
  { number: 3, label: "Directors" },
  { number: 4, label: "Members" },
  { number: 5, label: "Additional" },
  { number: 6, label: "Review & Pay" },
];

interface CLGStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const CLGStepper: React.FC<CLGStepperProps> = ({ currentStep, onStepClick }) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full py-3 sm:py-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-2 sm:px-4">
        {STEPS.map((step, index) => {
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
                    w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                    text-xs sm:text-sm font-semibold transition-all duration-300
                    ${status === "done" ? "bg-[hsl(var(--stepper-done))] text-white" : ""}
                    ${status === "active" ? "bg-[hsl(var(--stepper-active))] text-white" : ""}
                    ${status === "pending" ? "bg-card border-2 border-[hsl(var(--stepper-line))] text-muted-foreground" : ""}
                  `}
                >
                  {status === "done" ? <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={2.5} /> : step.number}
                </div>
                <p
                  className={`
                    mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-center
                    ${status === "done" ? "text-[hsl(var(--stepper-done))]" : ""}
                    ${status === "active" ? "text-primary" : ""}
                    ${status === "pending" ? "text-muted-foreground" : ""}
                    ${status !== "active" ? "hidden sm:block" : ""}
                  `}
                >
                  {step.label}
                </p>
              </div>

              {index < STEPS.length - 1 && (
                <div className="flex-1 flex items-center px-0.5 sm:px-4 -mt-3 sm:-mt-8">
                  <div
                    className={`
                      stepper-line-dashed w-full
                      ${step.number < currentStep ? "stepper-line-done" : ""}
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
