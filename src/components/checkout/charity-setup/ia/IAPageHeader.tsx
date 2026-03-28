import React from "react";
import { Users, HelpCircle, Clock, Lock, CheckCircle } from "lucide-react";

export const IAPageHeader: React.FC = () => {
  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-10 h-10 sm:w-[79px] sm:h-[79px] object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">Incorporated Association Setup</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Secure checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>Estimated time</span>
            <span className="font-semibold text-foreground">15-20 mins</span>
          </div>
          <button className="flex items-center gap-1 sm:gap-1.5 text-primary hover:underline text-xs sm:text-sm font-medium">
            <HelpCircle size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Need help?</span>
            <span className="sm:hidden">Help</span>
          </button>
        </div>
      </div>

      <div className="bg-primary/5 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-primary flex-wrap">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Lock size={12} className="text-[hsl(var(--success))] sm:w-3.5 sm:h-3.5" />
            <CheckCircle size={10} className="text-[hsl(var(--success))] sm:w-3 sm:h-3" />
            Secure SSL
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <CheckCircle size={10} className="text-[hsl(var(--success))] sm:w-3 sm:h-3" />
            ACNC Agents
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <CheckCircle size={12} className="text-[hsl(var(--success))]" />
            100% Satisfaction Guarantee
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <CheckCircle size={12} className="text-[hsl(var(--success))]" />
            500+ Charities Registered
          </span>
        </div>
      </div>
    </div>
  );
};
