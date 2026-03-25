import React from "react";
import { Shield, HelpCircle, CheckCircle, Check } from "lucide-react";

export const FTPageHeader: React.FC = () => {
  return (
    <div className="bg-card border-b border-border">
      {/* Top header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Family Trust Setup</h1>
            <p className="text-sm text-muted-foreground">Secure checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Estimated time</p>
            <p className="text-sm font-medium text-foreground">12-15 mins</p>
          </div>
          <a href="tel:1300626258" className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium">
            <HelpCircle size={16} />
            1300 626 258
          </a>
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
