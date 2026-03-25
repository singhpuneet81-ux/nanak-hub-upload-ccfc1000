import React from "react";
import { Building2, Shield, Check, Clock } from "lucide-react";

interface ABNPageHeaderProps {
  title?: string;
  subtitle?: string;
  estimatedTime?: string;
}

export const ABNPageHeader: React.FC<ABNPageHeaderProps> = ({
  title = "ABN Registration",
  subtitle = "Join 5,000+ businesses registered through Nanak",
  estimatedTime = "5-8 mins",
}) => {
  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">Estimated time</p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4" />
            {estimatedTime}
          </p>
        </div>
      </div>

      {/* Trust strip - green */}
      <div className="bg-[hsl(142_76%_94%)] border border-[hsl(142_71%_85%)] rounded-xl px-4 py-3 flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-[hsl(142_71%_35%)]">
          <Shield className="w-4 h-4" />
          <Check className="w-3 h-3" />
          <span>Secure SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[hsl(142_71%_35%)]">
          <Check className="w-3 h-3" />
          <span>ATO Registered Agents</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[hsl(142_71%_35%)]">
          <Check className="w-3 h-3" />
          <span>100% Satisfaction Guarantee</span>
        </div>
      </div>
    </div>
  );
};
