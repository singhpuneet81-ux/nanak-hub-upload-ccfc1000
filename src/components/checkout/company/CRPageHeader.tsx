import React from "react";
import { Shield, Building, HelpCircle } from "lucide-react";

export const CRPageHeader: React.FC = () => {
  return (
    <div className="bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm text-primary font-medium">
        <Shield size={14} />
        <span>Secure Checkout · SSL Encrypted</span>
      </div>
      <div className="flex items-center justify-center gap-3 pb-6 pt-2">
        <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Company Registration</h1>
          <p className="text-muted-foreground mt-1">Register your Australian company in minutes</p>
        </div>
      </div>
    </div>
  );
};
