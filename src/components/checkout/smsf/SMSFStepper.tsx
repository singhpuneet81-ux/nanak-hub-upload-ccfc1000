import React from "react";
import { Check, CircleDot, User, Star, Lock } from "lucide-react";

interface Step {
  label: string;
  icon: React.ReactNode;
}

interface SMSFStepperProps {
  steps: Step[];
  currentStep: number; // 0-based
  onStepClick?: (step: number) => void;
}

export const SMSFStepper: React.FC<SMSFStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4 overflow-x-auto">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;
          const isClickable = isDone && onStepClick;

          return (
            <React.Fragment key={index}>
              <div
                className={`flex flex-col items-center shrink-0 ${isClickable ? "cursor-pointer" : ""}`}
                onClick={() => isClickable && onStepClick(index)}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${isDone ? "bg-[hsl(var(--stepper-done))] text-white" : ""}
                    ${isActive ? "bg-[hsl(var(--stepper-active))] text-white" : ""}
                    ${isPending ? "bg-card border-2 border-[hsl(var(--stepper-line))] text-muted-foreground" : ""}
                  `}
                >
                  {isDone ? <Check size={20} strokeWidth={2.5} /> : step.icon}
                </div>
                <p
                  className={`
                    mt-2 text-xs font-medium whitespace-nowrap text-center
                    ${isDone ? "text-[hsl(var(--stepper-done))]" : ""}
                    ${isActive ? "text-primary" : ""}
                    ${isPending ? "text-muted-foreground" : ""}
                    ${!isActive ? "hidden sm:block" : ""}
                  `}
                >
                  {step.label}
                </p>
                <p className={`text-[10px] text-muted-foreground ${!isActive ? "hidden sm:block" : ""}`}>
                  Step {index + 1}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1 sm:px-3 -mt-6 sm:-mt-8">
                  <div
                    className={`
                      stepper-line-dashed w-full
                      ${isDone ? "stepper-line-done" : ""}
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
