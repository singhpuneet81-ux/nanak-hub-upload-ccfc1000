import React from "react";
import { Lock } from "lucide-react";

export const PTPageHeader: React.FC = () => (
  <div className="bg-primary/5 border-b border-border">
    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
        <div><h1 className="text-xl font-bold text-foreground">Partnership Tax & Accounting</h1><p className="text-sm text-muted-foreground">Secure Checkout</p></div>
      </div>
      <div className="flex items-center gap-2 text-primary"><Lock size={16} /><span className="text-sm font-medium hidden sm:inline">Secure Payment</span></div>
    </div>
  </div>
);
