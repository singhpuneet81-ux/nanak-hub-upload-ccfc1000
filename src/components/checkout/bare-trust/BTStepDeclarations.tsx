import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { BackButton, PrimaryButton } from "@/components/checkout/Buttons";
import { FileText, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const DECLARATIONS = [
  "I understand that the Bare Trust must be established before settlement. I authorize Nanak Accountants & Associates to coordinate the timing of trust establishment.",
  "I confirm that the information provided is accurate and complete to the best of my knowledge. I understand that incorrect information may result in a non-compliant trust structure.",
  "I understand that this Bare Trust setup does not constitute financial advice regarding whether the SMSF should borrow or purchase property. I have obtained independent financial advice or made my own decision to proceed.",
];

const IMPORTANT_INFO = [
  "The Bare Trust deed will be prepared by specialist lawyers",
  "Documents will be sent for e-signing by all relevant parties",
  "We coordinate with your solicitor/conveyancer if required",
  "You'll receive certified copies for your lender and settlement",
];

export const BTStepDeclarations: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const accepted: boolean[] = customer.btDeclarations || [false, false, false];

  const toggleDeclaration = (index: number) => {
    const updated = [...accepted];
    updated[index] = !updated[index];
    updateCustomer({ btDeclarations: updated });
  };

  const allAccepted = accepted.length === DECLARATIONS.length && accepted.every(Boolean);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Acknowledgements & Declarations</h2>
            <p className="text-sm text-muted-foreground">Please review and confirm</p>
          </div>
        </div>

        {/* Compliance Warning */}
        <div className="border-l-4 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--cta))]" />
            Common SMSF Compliance Error
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Incorrect Bare Trust timing is one of the most common SMSF compliance errors.</strong> Establishing the trust at
            the wrong time (especially in VIC and NSW) can result in non-compliance, costly rectification, and potential
            ATO penalties. We take care of the timing for you.
          </p>
        </div>

        {/* Mandatory Declarations */}
        <div className="border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Mandatory Declarations</h3>
          <div className="space-y-4">
            {DECLARATIONS.map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <Checkbox
                  id={`decl-${i}`}
                  checked={accepted[i] || false}
                  onCheckedChange={() => toggleDeclaration(i)}
                  className="mt-1"
                />
                <label htmlFor={`decl-${i}`} className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  <strong>I {i === 0 ? "understand" : i === 1 ? "confirm" : "understand"}</strong>{" "}
                  {text.substring(text.indexOf(" ") + 1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mt-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Important Information
          </h4>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1.5 list-disc list-inside">
            {IMPORTANT_INFO.map((info, i) => (
              <li key={i}>{info}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <BackButton onClick={prevStep} />
        <PrimaryButton onClick={nextStep} disabled={!allAccepted}>
          Continue to Payment
        </PrimaryButton>
      </div>
    </div>
  );
};
