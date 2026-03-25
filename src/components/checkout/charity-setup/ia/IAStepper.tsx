import React from "react";
import { Check, FileText, MapPin, User, Users, ClipboardList, CreditCard } from "lucide-react";

interface Step {
  number: number;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { number: 1, label: "Association Details", icon: <FileText size={16} /> },
  { number: 2, label: "Registered Address", icon: <MapPin size={16} /> },
  { number: 3, label: "Primary Contact", icon: <User size={16} /> },
  { number: 4, label: "Committee Members", icon: <Users size={16} /> },
  { number: 5, label: "Registration Details", icon: <ClipboardList size={16} /> },
  { number: 6, label: "Review & Pay", icon: <CreditCard size={16} /> },
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
    <div className="w-full px-4 py-5 md:px-8 md:py-6 bg-background">
      <div className="flex items-center justify-center max-w-4xl mx-auto">
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
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${status === "done" ? "bg-[hsl(var(--success))] text-white" : ""}
                    ${status === "active" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : ""}
                    ${status === "pending" ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {status === "done" ? <Check size={16} strokeWidth={2.5} /> : step.icon}
                </div>
                <p
                  className={`
                    mt-1.5 text-xs font-medium whitespace-nowrap hidden md:block
                    ${status === "done" || status === "active" ? "text-foreground" : "text-muted-foreground"}
                  `}
                >
                  {step.label}
                </p>
                <p className={`text-[10px] hidden md:block ${status === "active" ? "text-muted-foreground" : "text-transparent"}`}>
                  Step {step.number}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1 md:px-3 -mt-5 md:-mt-5">
                  <div
                    className={`
                      h-0.5 w-full transition-colors
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
