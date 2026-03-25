import React from "react";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

const steps: Step[] = [
  { number: 1, label: "Trust Details" },
  { number: 2, label: "Unitholders" },
  { number: 3, label: "Trustee" },
  { number: 4, label: "Add-ons" },
  { number: 5, label: "Package" },
  { number: 6, label: "Payment" },
];

interface UTStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const UTStepper: React.FC<UTStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full px-4 py-5 md:px-8 md:py-6 bg-card border-b border-border">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isClickable = step.number < currentStep && onStepClick;

          return (
            <React.Fragment key={step.number}>
              {/* Step item */}
              <div
                className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : ""}`}
                onClick={() => isClickable && onStepClick(step.number)}
              >
                {/* Icon circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm font-semibold
                    ${status === "done" ? "bg-[hsl(var(--success))] text-white" : ""}
                    ${status === "active" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : ""}
                    ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {status === "done" ? (
                    <Check size={20} strokeWidth={2.5} />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Labels - hidden on mobile for non-current steps */}
                <div
                  className={`
                    mt-2 text-center
                    ${status === "active" ? "" : "hidden md:block"}
                  `}
                >
                  <p
                    className={`
                      text-xs font-medium whitespace-nowrap
                      ${status === "done" ? "text-[hsl(var(--success))]" : ""}
                      ${status === "active" ? "text-foreground" : ""}
                      ${status === "pending" ? "text-muted-foreground" : ""}
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1 md:px-2 -mt-6 md:-mt-5">
                  <div
                    className={`
                      h-0.5 w-full
                      ${step.number < currentStep ? "bg-[hsl(var(--success))]" : "bg-border"}
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
