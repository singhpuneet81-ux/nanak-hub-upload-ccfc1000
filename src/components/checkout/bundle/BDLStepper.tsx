import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Your Details" },
  { number: 2, label: "Declaration" },
];

interface BDLStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const BDLStepper: React.FC<BDLStepperProps> = ({ currentStep, onStepClick }) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.number);
          const isClickable = step.number < currentStep && onStepClick;
          return (
            <React.Fragment key={step.number}>
              <div className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : ""}`} onClick={() => isClickable && onStepClick(step.number)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${status === "done" ? "bg-[hsl(var(--stepper-done))] text-white" : ""}
                  ${status === "active" ? "bg-[hsl(var(--stepper-active))] text-white" : ""}
                  ${status === "pending" ? "bg-card border-2 border-[hsl(var(--stepper-line))] text-muted-foreground" : ""}
                `}>
                  {status === "done" ? <Check size={20} strokeWidth={2.5} /> : step.number}
                </div>
                <p className={`mt-2 text-xs font-medium whitespace-nowrap text-center
                  ${status === "done" ? "text-[hsl(var(--stepper-done))]" : ""}
                  ${status === "active" ? "text-primary" : ""}
                  ${status === "pending" ? "text-muted-foreground" : ""}
                  ${status !== "active" ? "hidden sm:block" : ""}
                `}>
                  {step.label}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 flex items-center px-2 sm:px-4 -mt-6 sm:-mt-8">
                  <div className={`stepper-line-dashed w-full ${step.number < currentStep ? "stepper-line-done" : ""}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
