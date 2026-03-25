import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput } from "@/components/checkout/FormInputs";
import { validateABN } from "@/utils/validation";
import { BackButton, PrimaryButton } from "@/components/checkout/Buttons";
import { Building2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const BTStepSMSFDetails: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const smsfEstablished = customer.btSmsfEstablished || "";

  const isValid = () => {
    const abnErr = validateABN(customer.btSmsfAbn || "");
    return (
      (customer.btSmsfName || "").trim() !== "" &&
      !abnErr &&
      (customer.btSmsfAbn || "").trim() !== "" &&
      smsfEstablished === "yes"
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">SMSF Details</h2>
            <p className="text-sm text-muted-foreground">Information about your Self-Managed Super Fund</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            How the Bare Trust Works
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            The Bare Trust exists <strong>solely to hold the property on trust for your SMSF</strong> until the loan is fully repaid. Once
            the loan is repaid, legal title transfers from the Bare Trust to the SMSF. The SMSF is always the beneficial owner.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <SoftInput
              label="SMSF Name"
              required
              placeholder="e.g., The Smith Family Superannuation Fund"
              value={customer.btSmsfName || ""}
              onChange={(e) => updateCustomer({ btSmsfName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">The full legal name of your Self-Managed Superannuation Fund</p>
          </div>

          <div>
            <SoftInput
              label="SMSF ABN"
              required
              placeholder="XX XXX XXX XXX"
              value={customer.btSmsfAbn || ""}
              onChange={(e) => updateCustomer({ btSmsfAbn: e.target.value })}
              error={validateABN(customer.btSmsfAbn || "") || undefined}
            />
            <p className="text-xs text-muted-foreground mt-1">Your SMSF's Australian Business Number (11 digits)</p>
          </div>

          {/* SMSF established? */}
          <div>
            <h3 className="font-semibold text-foreground mb-1">Is the SMSF already established?</h3>
            <p className="text-xs text-muted-foreground mb-3">Has your SMSF been formally set up with a Trust Deed and registered with the ATO?</p>
            <div className="grid grid-cols-2 gap-3">
              {["yes", "no"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateCustomer({ btSmsfEstablished: val })}
                  className={cn(
                    "py-3 rounded-lg border-2 text-sm font-medium transition-all",
                    smsfEstablished === val
                      ? val === "yes"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-destructive bg-destructive/5 text-destructive"
                      : "border-border bg-background text-foreground hover:border-muted-foreground/40"
                  )}
                >
                  {val === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          {/* Warning if SMSF not established */}
          {smsfEstablished === "no" && (
            <div className="border-l-4 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-r-xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--cta))] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[hsl(var(--cta))]">SMSF Must Be Established First</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your SMSF must be fully established before we can create the Bare Trust. The SMSF needs to exist as the
                    beneficial owner of the property.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    We can help you establish your SMSF first. Please contact our team or visit our{" "}
                    <a href="/smsf-setup" className="text-primary font-medium hover:underline">SMSF Setup page</a>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <BackButton onClick={prevStep} />
        <PrimaryButton onClick={nextStep} disabled={!isValid()}>
          Continue to Trustee Details
        </PrimaryButton>
      </div>
    </div>
  );
};
