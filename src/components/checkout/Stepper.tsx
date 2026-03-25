import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

const Stepper = ({ currentStep, steps }: StepperProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`step-badge ${
                  isComplete
                    ? "step-badge-complete"
                    : isActive
                    ? "step-badge-active"
                    : "step-badge-inactive"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-primary"
                      : isComplete
                      ? "text-success"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mt-[-1.5rem] ${
                  isComplete ? "bg-success" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
