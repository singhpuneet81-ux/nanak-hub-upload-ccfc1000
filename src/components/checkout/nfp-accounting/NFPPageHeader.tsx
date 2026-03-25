import React from "react";
import { Users, Lock } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const STRUCTURE_LABELS: Record<string, string> = {
  ia: "Incorporated Association Accounting",
  charitable_org: "Charitable Organization Accounting",
  clg: "Company Limited by Guarantee Accounting",
  charity: "Charitable Trust Accounting",
};

export const NFPPageHeader: React.FC = () => {
  const [searchParams] = useSearchParams();
  const structure = searchParams.get("structure") || "";
  const title = STRUCTURE_LABELS[structure] || "NFP Accounting";

  return (
    <div className="bg-primary/5 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-[79px] h-[79px] object-contain" />
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">Configure your compliance package</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Lock size={16} />
          <span className="text-sm font-medium hidden sm:inline">Secure Payment</span>
        </div>
      </div>
    </div>
  );
};
