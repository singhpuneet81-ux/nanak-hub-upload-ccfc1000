import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Zap, AlertTriangle, Search, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { usePayrollPricing } from "@/hooks/usePayrollPricing";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const PRStepAddons: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const { pricing } = usePayrollPricing();
  const addonPrices = pricing.addonPrices;

  const paydaySuper = !!customer.prPaydaySuper;
  const termination = !!customer.prTermination;
  const backPay = !!customer.prBackPay;
  const healthCheck = !!customer.prHealthCheck;

  const addons = [
    {
      key: "prPaydaySuper",
      checked: paydaySuper,
      icon: <Zap size={18} className="text-[hsl(var(--cta))]" />,
      name: "Payday Super Setup",
      desc: "System migration, clearing house setup & payroll reconfiguration for July 2026",
      urgent: "Required by 1 July 2026 — all businesses",
      price: addonPrices.paydaysuper,
      note: "one-time",
    },
    {
      key: "prTermination",
      checked: termination,
      icon: <AlertTriangle size={18} className="text-[hsl(var(--cta))]" />,
      name: "Termination / Redundancy Calculation",
      desc: "Final pay, leave entitlements, ETP & ATO notification",
      price: addonPrices.termination,
      note: "per employee",
    },
    {
      key: "prBackPay",
      checked: backPay,
      icon: <Search size={18} className="text-[hsl(var(--cta))]" />,
      name: "Back-Pay / Underpayment Review",
      desc: "Award reconciliation, STP amendments & ATO rectification",
      price: addonPrices.backpay,
      note: "quoted on scope",
    },
    {
      key: "prHealthCheck",
      checked: healthCheck,
      icon: <HeartPulse size={18} className="text-[hsl(var(--cta))]" />,
      name: "Payroll Health Check",
      desc: "Full STP Phase 2 audit, award compliance review & super reconciliation",
      price: addonPrices.healthcheck,
      note: "one-time",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">One-Time Services</h2>
        <p className="text-muted-foreground mt-1">Event-based · quoted separately or fixed fee</p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
        {addons.map((addon) => (
          <div
            key={addon.key}
            onClick={() => updateCustomer({ [addon.key]: !addon.checked })}
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <Checkbox
                checked={addon.checked}
                onCheckedChange={(c) => updateCustomer({ [addon.key]: !!c })}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 sm:mt-0"
              />
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">{addon.desc}</p>
                    {addon.urgent && (
                      <p className="text-xs font-semibold text-[hsl(var(--cta))] mt-0.5">{addon.urgent}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2 sm:ml-4">
              <p className="font-semibold text-foreground text-sm">${addon.price}</p>
              <p className="text-[10px] text-muted-foreground">{addon.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={onNext} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
