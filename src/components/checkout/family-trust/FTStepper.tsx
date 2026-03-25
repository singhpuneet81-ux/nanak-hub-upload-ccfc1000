import React from "react";
import { Check, Building2, Users, UserCog, Sparkles, Package, CreditCard } from "lucide-react";

interface Step {
  number: number;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { number: 1, label: "Trust Details", sublabel: "Step 1", icon: <Building2 size={18} /> },
  { number: 2, label: "Appointor & Beneficiaries", sublabel: "Step 2", icon: <Users size={18} /> },
  { number: 3, label: "Directors & Shareholders", sublabel: "Step 3", icon: <UserCog size={18} /> },
  { number: 4, label: "Add-ons", sublabel: "Step 4", icon: <Sparkles size={18} /> },
  { number: 5, label: "Package", sublabel: "Step 5", icon: <Package size={18} /> },
  { number: 6, label: "Review & Pay", sublabel: "Step 6", icon: <CreditCard size={18} /> },
];

interface FTStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const FTStepper: React.FC<FTStepperProps> = ({
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
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${status === "done" ? "bg-[hsl(var(--success))] text-white" : ""}
                    ${status === "active" ? "bg-primary text-primary-foreground" : ""}
                    ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
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
                      ${status === "done" ? "text-[hsl(var(--success))]" : ""}
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

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1 md:px-2 -mt-6 md:-mt-8">
                  <div
                    className={`
                      h-0.5 w-full border-t-2 border-dashed
                      ${step.number < currentStep ? "border-[hsl(var(--success))]" : "border-border"}
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
