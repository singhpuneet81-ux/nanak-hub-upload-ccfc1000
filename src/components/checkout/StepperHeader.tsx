import React from "react";
import { Check, User, Calendar, Sparkles, Users, CreditCard } from "lucide-react";

interface Step {
  number: number;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { number: 1, label: "Your Details", sublabel: "Step 1", icon: <User size={18} /> },
  { number: 2, label: "Registration Term", sublabel: "Step 2", icon: <Calendar size={18} /> },
  { number: 3, label: "Plan Selection", sublabel: "Step 3", icon: <Sparkles size={18} /> },
  { number: 4, label: "Payroll", sublabel: "Step 4", icon: <Users size={18} /> },
  { number: 5, label: "Review & Pay", sublabel: "Step 5", icon: <CreditCard size={18} /> },
];

interface StepperHeaderProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  currentStep,
  onStepClick,
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "done";
    if (stepNumber === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="w-full px-4 py-5 md:px-8 md:py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
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
                    stepper-icon
                    ${status === "done" ? "stepper-icon-done" : ""}
                    ${status === "active" ? "stepper-icon-active" : ""}
                    ${status === "pending" ? "stepper-icon-pending" : ""}
                  `}
                >
                  {status === "done" ? (
                    <Check size={20} strokeWidth={2.5} />
                  ) : (
                    step.icon
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
                      ${status === "done" ? "text-[hsl(var(--stepper-done))]" : ""}
                      ${status === "active" ? "text-primary" : ""}
                      ${status === "pending" ? "text-muted-foreground" : ""}
                    `}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {step.sublabel}
                  </p>
                </div>
              </div>

              {/* Connector line - dashed style matching screenshot */}
              {index < steps.length - 1 && (
                <div 
                  className="flex-1 flex items-center px-2 md:px-3 -mt-6 md:-mt-8"
                >
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
