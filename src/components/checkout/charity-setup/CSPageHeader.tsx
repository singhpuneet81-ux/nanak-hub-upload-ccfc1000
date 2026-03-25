import React from "react";
import { Heart, HelpCircle } from "lucide-react";

export const CSPageHeader: React.FC = () => {
  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Charity Setup</h1>
            <p className="text-sm text-muted-foreground">Establish Your Not-for-Profit Organization</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium">
          <HelpCircle size={16} />
          Need help?
        </button>
      </div>
    </div>
  );
};
