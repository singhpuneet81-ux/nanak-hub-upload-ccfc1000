import React from "react";
import { HelpCircle } from "lucide-react";

export const BNPageHeader: React.FC = () => {
  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Business Name Registration</h1>
            <p className="text-sm text-muted-foreground">Secure checkout</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-primary hover:underline text-sm font-medium">
          <HelpCircle className="w-4 h-4" />
          Need help?
        </button>
      </div>
    </div>
  );
};
