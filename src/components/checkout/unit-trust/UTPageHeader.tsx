import React from "react";
import { Building2, HelpCircle, Clock, Lock, CheckCircle } from "lucide-react";

export const UTPageHeader: React.FC = () => {
  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Unit Trust Setup</h1>
            <p className="text-sm text-muted-foreground">Secure checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>Estimated time</span>
            <span className="font-semibold text-foreground">10-15 mins</span>
          </div>
          <button className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium">
            <HelpCircle size={16} />
            Need help?
          </button>
        </div>
      </div>

      {/* Trust bar */}
      <div className="bg-primary/5 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-6 text-sm text-primary flex-wrap">
          <span className="flex items-center gap-1.5">
            <Lock size={14} className="text-[hsl(var(--success))]" />
            <CheckCircle size={12} className="text-[hsl(var(--success))]" />
            Secure SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-[hsl(var(--success))]" />
            ASIC Registered Agents
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-[hsl(var(--success))]" />
            100% Satisfaction Guarantee
          </span>
        </div>
      </div>
    </div>
  );
};
