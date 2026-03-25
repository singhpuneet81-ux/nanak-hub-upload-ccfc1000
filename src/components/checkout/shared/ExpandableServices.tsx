import React, { useState } from "react";
import { Info, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableServicesProps {
  extraServices: string[];
  accentColor?: "primary" | "cta";
}

export const ExpandableServices: React.FC<ExpandableServicesProps> = ({
  extraServices,
  accentColor = "primary",
}) => {
  const [expanded, setExpanded] = useState(false);
  const count = extraServices.length;
  const isCta = accentColor === "cta";
  const colorClass = isCta ? "text-[hsl(var(--cta))]" : "text-primary";
  const checkColor = isCta ? "text-[hsl(var(--cta))]" : "text-[hsl(var(--success))]";

  return (
    <div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className={cn(
          "flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group w-full",
          colorClass
        )}
      >
        <Info size={14} className="shrink-0" />
        <span className="text-sm font-medium">
          ...plus {count} more services
        </span>
        {expanded ? (
          <ChevronUp size={14} className="ml-auto shrink-0" />
        ) : (
          <ChevronDown size={14} className="ml-auto shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5 pl-1 animate-in slide-in-from-top-1 duration-200">
          {extraServices.map((service, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className={cn("w-3.5 h-3.5 shrink-0", checkColor)} />
              <span className="text-sm text-foreground">{service}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
