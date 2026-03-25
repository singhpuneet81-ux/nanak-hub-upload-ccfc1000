import React from "react";
import { Phone, Mail } from "lucide-react";

export const NeedHelpCall: React.FC = () => (
  <div className="border-t border-border pt-3">
    <p className="font-semibold text-foreground text-sm mb-2">Need Help?</p>
    <div className="space-y-1.5">
      <a
        href="tel:1300626258"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Phone size={14} className="shrink-0" />
        <span>1300 626 258</span>
      </a>
      <a
        href="mailto:info@nanakaccountants.com.au"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Mail size={14} className="shrink-0" />
        <span>info@nanakaccountants.com.au</span>
      </a>
    </div>
  </div>
);
