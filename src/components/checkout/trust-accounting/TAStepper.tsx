import React from "react";
import { Check } from "lucide-react";

const steps = [
  { number: 1, label: "Package Selection", sub: "Choose your plan" },
  { number: 2, label: "Add-ons", sub: "Customize your package" },
  { number: 3, label: "Trust Details", sub: "Your information" },
  { number: 4, label: "Tax Agent Nomination", sub: "Nominate us as your agent" },
  { number: 5, label: "Payment", sub: "Secure checkout" },
];

interface Props { currentStep: number; onStepClick?: (step: number) => void; }

export const TAStepper: React.FC<Props> = ({ currentStep, onStepClick }) => {
  const getStatus = (n: number) => { if (n < currentStep) return "done"; if (n === currentStep) return "active"; return "pending"; };
  return (
    <div className="w-full px-4 py-5 md:px-8 md:py-6 bg-background">
      <div className="flex items-center justify-center max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const status = getStatus(step.number);
          const isClickable = step.number < currentStep && onStepClick;
          return (
            <React.Fragment key={step.number}>
              <div className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : ""}`} onClick={() => isClickable && onStepClick(step.number)}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${status === "done" ? "bg-[hsl(var(--success))] text-white" : ""} ${status === "active" ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : ""} ${status === "pending" ? "bg-muted text-muted-foreground" : ""}`}>
                  {status === "done" ? <Check size={16} strokeWidth={2.5} /> : step.number}
                </div>
                <p className={`mt-1.5 text-xs font-medium whitespace-nowrap hidden md:block text-center ${status === "active" ? "text-[hsl(var(--cta))]" : ""} ${status === "done" ? "text-foreground" : ""} ${status === "pending" ? "text-muted-foreground" : ""}`}>{step.label}</p>
                <p className="text-[10px] text-muted-foreground hidden md:block text-center">{step.sub}</p>
              </div>
              {index < steps.length - 1 && (<div className="flex-1 flex items-center px-1 md:px-3 -mt-7"><div className={`h-0.5 w-full transition-colors ${step.number < currentStep ? "bg-[hsl(var(--success))]" : "bg-border"}`} /></div>)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
