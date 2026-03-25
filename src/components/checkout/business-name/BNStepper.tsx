import React from "react";
import { Check, User, Calendar, Sparkles, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BNStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  steps?: string[];
}

const DEFAULT_STEPS = [
  "Your Details",
  "Registration Term",
  "Plan Selection",
  "Payroll",
  "Review & Pay",
];

const ICON_MAP: Record<string, React.ElementType> = {
  "Your Details": User,
  "Registration Term": Calendar,
  "Plan Selection": Sparkles,
  "Payroll": Users,
  "Review & Pay": Lock,
};

export const BNStepper: React.FC<BNStepperProps> = ({ currentStep, onStepClick, steps }) => {
  const stepLabels = steps || DEFAULT_STEPS;

  return (
    <div className="bg-[hsl(var(--primary)/0.03)] border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isActive = currentStep === stepNumber;
            const isPending = currentStep < stepNumber;
            const Icon = ICON_MAP[label] || Sparkles;

            return (
              <React.Fragment key={index}>
                <div
                  className={cn(
                    "flex items-center gap-2 cursor-pointer transition-opacity",
                    isPending && "opacity-50"
                  )}
                  onClick={() => isCompleted && onStepClick?.(stepNumber)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      isCompleted && "bg-[hsl(142_71%_45%)] text-white",
                      isActive && "bg-primary text-white",
                      isPending && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isActive && "text-foreground",
                        isCompleted && "text-foreground",
                        isPending && "text-muted-foreground"
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">Step {stepNumber}</p>
                  </div>
                </div>

                {index < stepLabels.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-[2px] mx-2 transition-colors",
                      currentStep > stepNumber + 1 || (currentStep > stepNumber)
                        ? "bg-[hsl(142_71%_45%)]"
                        : "bg-border border-dashed border-t-2 border-border h-0"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
