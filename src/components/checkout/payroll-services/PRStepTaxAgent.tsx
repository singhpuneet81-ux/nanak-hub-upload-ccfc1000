import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TAX_AGENT_OPTIONS = [
  {
    id: "mygov",
    label: "Online via myGov (Recommended)",
    description: "Nominate us through Online Services for Business — fastest and most secure method",
    recommended: true,
  },
  {
    id: "call_ato",
    label: "Call ATO Directly",
    description: "Call 13 28 66 and provide our tax agent number (26019867)",
  },
  {
    id: "later",
    label: "I'll do this later",
    description: "We'll send you detailed instructions after onboarding is complete",
  },
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const PRStepTaxAgent: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const [method, setMethod] = useState((customer.prTaxAgentMethod as string) || "mygov");

  const handleContinue = () => {
    updateCustomer({ prTaxAgentMethod: method });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tax Agent Nomination</h2>
        <p className="text-muted-foreground mt-1">Nominate us as your registered tax agent</p>
      </div>

      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={18} className="text-[hsl(var(--success))]" />
          <h3 className="font-bold text-foreground">How would you like to nominate us?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Required for us to lodge your tax returns and manage compliance</p>

        <div className="space-y-3">
          {TAX_AGENT_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setMethod(opt.id)}
              className={cn(
                "border-2 rounded-xl p-4 cursor-pointer transition-all",
                method === opt.id
                  ? "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.03)]"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5", method === opt.id ? "border-[hsl(var(--success))]" : "border-muted-foreground/40")}>
                  {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {opt.recommended && <CheckCircle size={14} className="text-[hsl(var(--success))]" />}
                    <p className="font-medium text-foreground">{opt.label}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-primary" />
          <p className="font-semibold text-primary text-sm">Tax Agent Nomination</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Call ATO at <span className="font-medium text-foreground">13 28 66</span> and provide our tax agent number:{" "}
          <span className="font-bold text-foreground">26019867</span>
        </p>
      </div>

      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue to Payment <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
