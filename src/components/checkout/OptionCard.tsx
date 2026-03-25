import React from "react";
import { Check } from "lucide-react";

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  features?: string[];
  price?: string;
  priceLabel?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: "recommended" | "popular";
  };
  savingsText?: string;
  highlighted?: boolean;
  footnote?: string;
  children?: React.ReactNode;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  selected,
  onClick,
  title,
  subtitle,
  features,
  price,
  priceLabel,
  icon,
  badge,
  savingsText,
  highlighted = false,
  footnote,
  children,
}) => {
  return (
    <div
      className={`
        option-card relative
        ${selected ? "option-card-selected" : ""}
        ${highlighted ? "option-card-highlighted" : ""}
      `}
      onClick={onClick}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-4">
          <span
            className={
              badge.variant === "recommended"
                ? "badge-recommended"
                : "badge-popular"
            }
          >
            {badge.variant === "recommended" && <Check size={12} className="mr-1" />}
            {badge.text}
          </span>
        </div>
      )}

      {/* Selection indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`radio-indicator ${selected ? "radio-indicator-selected" : ""}`}
        />
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 pr-8">
        {icon && (
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center shrink-0
              ${selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
            `}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Savings strip */}
      {savingsText && (
        <div className="savings-strip mb-4">
          <span>↗</span>
          {savingsText}
        </div>
      )}

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="text-[hsl(var(--success))] mt-0.5 shrink-0" size={16} />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Price */}
      {price && (
        <div className="mt-4">
          <span className="text-2xl font-bold text-foreground">{price}</span>
          {priceLabel && (
            <span className="text-sm text-muted-foreground ml-1">
              {priceLabel}
            </span>
          )}
        </div>
      )}

      {/* Footnote */}
      {footnote && (
        <p className="mt-3 text-xs text-[hsl(var(--badge-popular))] flex items-center gap-1">
          <span>⚡</span>
          {footnote}
        </p>
      )}

      {/* Custom children */}
      {children}
    </div>
  );
};
