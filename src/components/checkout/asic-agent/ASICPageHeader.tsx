import React from "react";
import { Shield, Check, Clock } from "lucide-react";

export const ASICPageHeader: React.FC = () => {
  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ASIC Agent Services Application</h1>
          <p className="text-sm text-muted-foreground">Complete your onboarding in a few simple steps</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">Estimated time</p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4" />
            5-8 mins
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
          <span>Registered ASIC Agent</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[hsl(142_71%_35%)]">
          <Check className="w-3 h-3" />
          <span>100% Satisfaction Guarantee</span>
        </div>
      </div>
    </div>
  );
};
