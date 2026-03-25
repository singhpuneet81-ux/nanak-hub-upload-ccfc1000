import React from "react";
import tpbBadge from "@/assets/tax-practitioners-board.png";
import ipaLogo from "@/assets/ipa-logo.png";
import { Star } from "lucide-react";

export const TPBBadge: React.FC = () => (
  <div className="mt-4 flex flex-col items-center gap-3 pt-4 border-t border-border">
    <div className="flex items-center justify-center gap-0.5">
      <img src={tpbBadge} alt="Tax Practitioners Board Registered" className="w-28 h-28 object-contain" />
      <img src={ipaLogo} alt="Institute of Public Accountants" className="h-24 object-contain" />
    </div>
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-xs text-muted-foreground font-medium">Trusted by 5,000+ Australian businesses</p>
    </div>
  </div>
);
