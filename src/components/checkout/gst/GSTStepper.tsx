import React from "react";
import { Check } from "lucide-react";

interface GSTStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  steps?: string[];
}

export const GSTStepper: React.FC<GSTStepperProps> = ({
  currentStep,
  onStepClick,
  steps = ["Your Details", "Package", "Add-Ons", "Review & Pay"],
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const isClickable = stepNumber < currentStep && onStepClick;

          return (
            <React.Fragment key={stepNumber}>
              <div
                className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : ""}`}
                onClick={() => isClickable && onStepClick(stepNumber)}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    text-sm font-semibold transition-all duration-300
                    ${status === "done" ? "bg-[hsl(var(--stepper-done))] text-white" : ""}
                    ${status === "active" ? "bg-[hsl(var(--stepper-active))] text-white" : ""}
                    ${status === "pending" ? "bg-card border-2 border-[hsl(var(--stepper-line))] text-muted-foreground" : ""}
                  `}
                >
                  {status === "done" ? <Check size={20} strokeWidth={2.5} /> : stepNumber}
                </div>
                <p
                  className={`
                    mt-2 text-xs font-medium whitespace-nowrap text-center
                    ${status === "done" ? "text-[hsl(var(--stepper-done))]" : ""}
                    ${status === "active" ? "text-primary" : ""}
                    ${status === "pending" ? "text-muted-foreground" : ""}
                    ${status !== "active" ? "hidden sm:block" : ""}
                  `}
                >
                  {label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-2 sm:px-4 -mt-6 sm:-mt-8">
                  <div
                    className={`stepper-line-dashed w-full ${stepNumber < currentStep ? "stepper-line-done" : ""}`}
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
