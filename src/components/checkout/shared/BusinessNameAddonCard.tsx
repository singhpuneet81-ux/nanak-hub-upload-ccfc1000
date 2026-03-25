import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePricingPackages } from "@/hooks/usePricingPackages";

// ASIC fees are government-set, not in API
export const BN_ASIC_FEES = {
  "1yr": 45,
  "3yr": 104,
} as const;

export type BNTerm = keyof typeof BN_ASIC_FEES;

interface BusinessNameAddonCardProps {
  isSelected: boolean;
  onToggle: () => void;
  proposedName: string;
  onNameChange: (name: string) => void;
  term: BNTerm;
  onTermChange: (term: BNTerm) => void;
}

export const BusinessNameAddonCard: React.FC<BusinessNameAddonCardProps> = ({
  isSelected,
  onToggle,
  proposedName,
  onNameChange,
  term,
  onTermChange,
}) => {
  const { packages } = usePricingPackages();
  const bnServiceFee = packages.business_name.foundation.price;

  const TERM_CONFIG = {
    "1yr": { label: "1 Year", asicFee: BN_ASIC_FEES["1yr"] },
    "3yr": { label: "3 Years", asicFee: BN_ASIC_FEES["3yr"], savings: 100 },
  };

  return (
    <div
      onClick={onToggle}
      className={cn(
        "border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      {/* Card Header Row */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-1 transition-colors",
            isSelected
              ? "bg-primary border-primary"
              : "border-muted-foreground/40 hover:border-primary"
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Title + Price + Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground">Register Business Name</h3>
            <span className="text-lg font-bold text-foreground whitespace-nowrap">${bnServiceFee}</span>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            Secure your business name with ASIC registration (required if trading under a name different from your ABN)
          </p>

          {/* Conditional expanded fields when selected */}
          {isSelected && (
            <div
              className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Business Name Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Proposed Business Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={proposedName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Enter your proposed business name"
                  className="w-full h-11 px-4 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Registration Term */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Registration Term <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(TERM_CONFIG) as [BNTerm, { label: string; asicFee: number; savings?: number }][]).map(
                    ([id, config]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onTermChange(id)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all",
                          term === id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{config.label}</p>
                          {"savings" in config && config.savings && (
                            <span className="text-xs font-bold text-green-600">
                              SAVE ${config.savings}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          ${config.asicFee} (ASIC Fee)
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
