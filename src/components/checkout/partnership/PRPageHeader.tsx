import React from "react";
import { Shield, Check, Clock, Users } from "lucide-react";

export const PRPageHeader: React.FC = () => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-10 h-10 sm:w-[79px] sm:h-[79px] object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Partnership ATO Registration</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Fast, simple partnership tax registrations</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">Estimated time</p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4" />
            10-15 mins
          </p>
        </div>
      </div>

      <div className="bg-[hsl(142_76%_94%)] border border-[hsl(142_71%_85%)] rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[hsl(142_71%_35%)]">
          <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>SSL Encrypted</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-[hsl(142_71%_35%)]">
          <Check className="w-3 h-3" />
          <span>Registered Tax Agents</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[hsl(142_71%_35%)]">
          <Check className="w-3 h-3" />
          <span>100% Guarantee</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-[hsl(142_71%_35%)]">
          <Check className="w-3 h-3" />
          <span>500+ Partnerships Registered</span>
        </div>
      </div>
    </div>
  );
};
