import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  showArrow?: boolean;
  variant?: "cta" | "secondary";
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  showArrow = true,
  variant = "cta",
  fullWidth = false,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`
        ${variant === "cta" ? "btn-cta" : "btn-secondary"}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
      {showArrow && variant === "cta" && (
        <ArrowRight size={18} />
      )}
    </button>
  );
};

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fullWidth = false,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`btn-secondary ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
};

interface ButtonGroupProps {
  onBack?: () => void;
  onContinue?: () => void;
  continueText: string;
  continueDisabled?: boolean;
  showBack?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  onBack,
  onContinue,
  continueText,
  continueDisabled = false,
  showBack = true,
}) => {
  return (
    <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 mt-8">
      {showBack && onBack && (
        <BackButton onClick={onBack} className="sm:w-32" />
      )}
      <PrimaryButton
        onClick={onContinue}
        disabled={continueDisabled}
        className="flex-1"
      >
        {continueText}
      </PrimaryButton>
    </div>
  );
};
