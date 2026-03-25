import React from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import nanakLogo from "@/assets/logo-nanak.webp";

interface CheckoutHeaderProps {
  serviceName: string;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  serviceName,
}) => {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <img src="/favicon.webp" alt="Nanak Accountants" className="h-9 w-auto" />
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {serviceName}
              </h1>
              <p className="text-xs text-muted-foreground">Secure checkout</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle size={16} />
            <span className="hidden sm:inline">Need help?</span>
          </button>
        </div>
      </div>
    </header>
  );
};
