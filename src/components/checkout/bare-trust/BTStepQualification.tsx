import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton } from "@/components/checkout/Buttons";
import { Info, CheckCircle2, AlertTriangle, Lock, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

export const BTStepQualification: React.FC = () => {
  const { customer, updateCustomer, nextStep } = useCheckout();

  const propertyBySmsf = customer.btPropertyBySmsf || "";
  const borrowingToAcquire = customer.btBorrowingToAcquire || "";

  const bothYes = propertyBySmsf === "yes" && borrowingToAcquire === "yes";
  const anyNo = propertyBySmsf === "no" || borrowingToAcquire === "no";

  const isValid = bothYes;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="content-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CircleDot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Confirm Bare Trust Requirement</h2>
            <p className="text-sm text-muted-foreground">Let's make sure you need a Bare Trust</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          What is a Bare Trust for SMSF?
        </h4>
        <p className="text-sm text-muted-foreground mt-2">
          A <strong>Bare Trust</strong> (also known as a Holding Trust or Security Trust) is required when an SMSF borrows money to
          purchase property under a <strong>Limited Recourse Borrowing Arrangement (LRBA)</strong>. The Bare Trust holds legal
          title to the property until the loan is fully repaid, at which point title transfers to the SMSF.
        </p>
      </div>

      {/* Question 1 */}
      <div className="content-card">
        <h3 className="font-semibold text-foreground mb-1">Is the property being purchased by an SMSF?</h3>
        <p className="text-xs text-muted-foreground mb-3">The Self-Managed Super Fund must be the ultimate beneficiary of the property</p>
        <div className="grid grid-cols-2 gap-3">
          {["yes", "no"].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => updateCustomer({ btPropertyBySmsf: val })}
              className={cn(
                "py-3 rounded-lg border-2 text-sm font-medium transition-all",
                propertyBySmsf === val
                  ? val === "yes"
                    ? "border-[hsl(142_71%_45%)] bg-[hsl(142_76%_94%)] text-[hsl(142_71%_35%)]"
                    : "border-destructive bg-destructive/5 text-destructive"
                  : "border-border bg-background text-foreground hover:border-muted-foreground/40"
              )}
            >
              {val === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>

      {/* Question 2 */}
      <div className="content-card">
        <h3 className="font-semibold text-foreground mb-1">Will the SMSF be borrowing to acquire the property?</h3>
        <p className="text-xs text-muted-foreground mb-3">This includes loans from banks, related parties, or any other lender</p>
        <div className="grid grid-cols-2 gap-3">
          {["yes", "no"].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => updateCustomer({ btBorrowingToAcquire: val })}
              className={cn(
                "py-3 rounded-lg border-2 text-sm font-medium transition-all",
                borrowingToAcquire === val
                  ? val === "yes"
                    ? "border-[hsl(142_71%_45%)] bg-[hsl(142_76%_94%)] text-[hsl(142_71%_35%)]"
                    : "border-destructive bg-destructive/5 text-destructive"
                  : "border-border bg-background text-foreground hover:border-muted-foreground/40"
              )}
            >
              {val === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>

      {/* Result: Bare Trust Required */}
      {bothYes && (
        <div className="border-l-4 border-[hsl(142_71%_45%)] bg-[hsl(142_76%_94%)] rounded-r-xl p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-[hsl(142_71%_35%)] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[hsl(142_71%_35%)]">✓ Bare Trust Required</h4>
              <p className="text-sm text-[hsl(142_71%_45%)] mt-1">
                Based on your answers, you <strong>do require</strong> a Bare Trust to comply with SMSF borrowing rules. The Bare Trust will
                hold the property on trust for your SMSF under a Limited Recourse Borrowing Arrangement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result: Not Required */}
      {anyNo && (
        <div className="border-l-4 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-r-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--cta))] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[hsl(var(--cta))]">Bare Trust May Not Be Required</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your answers, a Bare Trust may not be needed. A Bare Trust is only required when an SMSF borrows to purchase property.
                Please contact our team if you'd like to discuss your specific situation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Important Disclaimer */}
      <div className="border-l-4 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-r-xl p-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-[hsl(var(--cta))]" />
          Important Disclaimer
        </h4>
        <p className="text-sm text-muted-foreground mt-2">
          We are a firm of accountants and not financial advisers. We do not provide any financial product advice or
          recommend that an SMSF LRBA is suitable for you. What we are providing you is an execution-only service, as
          you have instructed us to set up a Bare Trust. You should consider taking advice from an AFS Licensee before
          making a decision.
        </p>
      </div>

      {/* Continue */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 hidden sm:flex">
          <Lock className="w-4 h-4" />
          Your information is encrypted and secure
        </p>
        <PrimaryButton onClick={nextStep} disabled={!isValid} className="flex-1 sm:flex-none">
          Continue to Property Details
        </PrimaryButton>
      </div>
    </div>
  );
};
