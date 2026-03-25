import React from "react";
import nanakLogo from "@/assets/logo-nanak.webp";

interface CheckoutLoaderProps {
  visible: boolean;
}

export const CheckoutLoader: React.FC<CheckoutLoaderProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <img src={nanakLogo} alt="Nanak Accountants" className="w-24 h-24 object-contain animate-pulse mb-4" />
      <p className="text-lg font-semibold text-foreground">Redirecting to payment page…</p>
      <p className="text-sm text-muted-foreground mt-1">Please don't refresh or close this page.</p>
    </div>
  );
};
