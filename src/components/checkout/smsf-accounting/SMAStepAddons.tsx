import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useSMSFPricing } from "@/hooks/useSMSFPricing";

interface Props { onNext: () => void; onBack: () => void; }

export const SMAStepAddons: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const { cfg } = useSMSFPricing();
  const taxPlanning = !!customer.smaTaxPlanning;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-foreground">Optional Add-ons</h2><p className="text-muted-foreground mt-1">Enhance your SMSF package</p></div>
      <div onClick={() => updateCustomer({ smaTaxPlanning: !taxPlanning })} className={cn("border-2 rounded-xl p-5 cursor-pointer transition-all", taxPlanning ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]" : "border-border hover:border-primary/40")}>
        <div className="flex items-start gap-3">
          <Checkbox checked={taxPlanning} onCheckedChange={(c) => updateCustomer({ smaTaxPlanning: !!c })} onClick={(e) => e.stopPropagation()} className="mt-1" />
          <div><div className="flex items-center gap-2"><TrendingUp size={16} className="text-primary" /><h3 className="font-bold text-foreground">SMSF Strategy Session</h3></div><p className="text-sm text-muted-foreground mt-1">One-on-one consultation on investment strategy, pension planning & contribution optimisation</p><p className="text-xl font-bold text-foreground mt-2">${cfg.strategySessionFee} <span className="text-sm font-normal text-muted-foreground">one-time</span></p></div>
        </div>
      </div>
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"><ArrowLeft size={18} /> Back</button>
        <button onClick={onNext} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">Continue <ArrowRight size={18} /></button>
      </div>
    </div>
  );
};
