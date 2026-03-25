import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { FileText, ChevronDown, ChevronUp, Shield, Star, CheckCircle, Clock } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

export const CSOrderSummary: React.FC = () => {
  const { customer } = useCheckout();
  const { packages } = usePricingPackages();
  const [isExpanded, setIsExpanded] = useState(false);

  const charityStructure = customer?.charityStructure as string | undefined;
  const applyDGR = customer?.applyDGR as boolean | undefined;

  // Dynamic pricing from API
  const CHARITY_STRUCTURES: Record<string, { name: string; price: number }> = {
    incorporated_association: { name: "Incorporated Association", price: packages.charity_ia.foundation.price },
    company_limited_guarantee: { name: "Company Limited by Guarantee", price: packages.charity_clg.foundation.price },
    charitable_trust: { name: "Charitable Trust", price: packages.charity.foundation.price },
  };

  const structure = charityStructure ? CHARITY_STRUCTURES[charityStructure] : null;
  const structurePrice = structure?.price || 0;
  const total = structurePrice;


  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
      <div className="bg-primary text-primary-foreground rounded-t-2xl px-5 py-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>

      <div className="p-6 space-y-4">

      {/* Structure selection */}
      {structure && (
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium text-foreground">{structure.name}</p>
            <p className="text-sm text-muted-foreground">Charity structure registration</p>
          </div>
          <span className="font-semibold text-[hsl(var(--cta))]">
            {formatCurrency(structure.price)}
          </span>
        </div>
      )}

      {/* DGR Status */}
      {applyDGR && (
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-medium text-foreground">DGR Status Application</p>
            <p className="text-sm text-muted-foreground">Tax deductible donations</p>
          </div>
          <span className="font-semibold text-[hsl(var(--success))]">Included</span>
        </div>
      )}

      {/* What's Included collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full py-3 text-primary text-sm font-medium border-t border-border mt-3"
      >
        <span>What's Included</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <ul className="text-sm text-muted-foreground space-y-2 pb-3">
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[hsl(var(--success))] mt-0.5 shrink-0" />
            ACNC charity registration
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[hsl(var(--success))] mt-0.5 shrink-0" />
            ABN/TFN application
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[hsl(var(--success))] mt-0.5 shrink-0" />
            GST-free & income tax exemption
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[hsl(var(--success))] mt-0.5 shrink-0" />
            Constitution/Rules preparation
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[hsl(var(--success))] mt-0.5 shrink-0" />
            Ongoing compliance support for 12 months
          </li>
        </ul>
      )}

      {/* Total */}
      <div className="border-t border-border pt-4 mt-2">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-foreground">Total</span>
          <span className="text-2xl font-bold text-[hsl(var(--cta))]">
            {total > 0 ? formatCurrency(total) : "$0"}
          </span>
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="mt-4 p-3 bg-[hsl(var(--success)/0.1)] rounded-lg border border-[hsl(var(--success)/0.2)]">
        <div className="flex items-center gap-2 text-[hsl(var(--success))] font-medium text-sm">
          <Shield size={16} />
          100% Money-Back Guarantee
        </div>
        <p className="text-xs text-[hsl(var(--success))] mt-1">
          Full refund if registration unsuccessful
        </p>
      </div>

      {/* Trust markers */}
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          <span>Setup: 4-8 weeks (structure dependent)</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-[hsl(var(--success))]" />
          <span>ACNC & ATO compliant</span>
        </div>
      </div>

      <NeedHelpCall />
      <TPBBadge />
      </div>
    </div>
  );
};
