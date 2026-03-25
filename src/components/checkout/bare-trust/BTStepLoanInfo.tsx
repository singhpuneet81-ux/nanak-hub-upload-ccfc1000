import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput } from "@/components/checkout/FormInputs";
import { BackButton, PrimaryButton } from "@/components/checkout/Buttons";
import { TrendingUp, Info, AlertTriangle, Building2, Users, DollarSign, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const BTStepLoanInfo: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const loanType = customer.btLoanType || "";
  const limitedRecourse = customer.btLimitedRecourse || "";

  const isValid = () => {
    return (
      (customer.btLenderName || "").trim() !== "" &&
      loanType !== "" &&
      (customer.btLoanAmount || "").trim() !== "" &&
      limitedRecourse !== ""
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Loan & Lender Information</h2>
            <p className="text-sm text-muted-foreground">Details about the Limited Recourse Borrowing</p>
          </div>
        </div>

        {/* Compliance Info */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            LRBA Compliance Requirements
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            SMSF loans <strong>must be limited recourse</strong> and secured <strong>only against the property</strong> being acquired. The lender
            cannot have recourse to other SMSF assets if the loan defaults. This is a strict ATO requirement.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <SoftInput
              label="Lender Name"
              required
              placeholder="e.g., Commonwealth Bank, Westpac, or individual name"
              value={customer.btLenderName || ""}
              onChange={(e) => updateCustomer({ btLenderName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Name of the financial institution or individual providing the loan</p>
          </div>

          {/* Loan Type */}
          <div>
            <label className="form-label">
              Loan Type <span className="text-destructive">*</span>
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => updateCustomer({ btLoanType: "bank" })}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  loanType === "bank"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Bank / Financial Institution</p>
                      <p className="text-xs text-muted-foreground">Commercial lender (bank, credit union, specialist SMSF lender)</p>
                    </div>
                  </div>
                  {loanType === "bank" && <Check className="w-5 h-5 text-primary" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateCustomer({ btLoanType: "related_party" })}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  loanType === "related_party"
                    ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[hsl(var(--cta))]" />
                    <div>
                      <p className="font-medium text-foreground">Related Party</p>
                      <p className="text-xs text-muted-foreground">Loan from SMSF member or related party (requires extra compliance)</p>
                    </div>
                  </div>
                  {loanType === "related_party" && <Check className="w-5 h-5 text-[hsl(var(--cta))]" />}
                </div>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Who is providing the loan to the SMSF?</p>
          </div>

          {/* Related Party Warning */}
          {loanType === "related_party" && (
            <div className="border-l-4 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-r-xl p-4">
              <h4 className="font-semibold text-[hsl(var(--cta))] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Related Party Loan - Extra Requirements
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                Related party loans have additional compliance requirements:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Must be on commercial terms (market interest rate)</li>
                <li>Formal loan agreement required</li>
                <li>Regular repayments must be made</li>
                <li>Must comply with sole purpose test</li>
              </ul>
            </div>
          )}

          {/* Loan Amount */}
          <div>
            <SoftInput
              label="Approximate Loan Amount"
              required
              placeholder="e.g., 500,000"
              icon={<DollarSign className="w-4 h-4" />}
              value={customer.btLoanAmount || ""}
              onChange={(e) => updateCustomer({ btLoanAmount: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Estimated total loan amount for the property purchase</p>
          </div>

          {/* Limited Recourse */}
          <div>
            <h3 className="font-semibold text-foreground mb-1">Is the loan limited recourse?</h3>
            <p className="text-xs text-muted-foreground mb-3">The lender's recourse must be limited to the property only (ATO requirement)</p>
            <div className="grid grid-cols-2 gap-3">
              {["yes", "no"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateCustomer({ btLimitedRecourse: val })}
                  className={cn(
                    "py-3 rounded-lg border-2 text-sm font-medium transition-all",
                    limitedRecourse === val
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

          {/* Non-compliant warning */}
          {limitedRecourse === "no" && (
            <div className="border-l-4 border-destructive bg-destructive/5 rounded-r-xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive">⚠ Non-Compliant Loan Structure</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Warning:</strong> SMSF loans <strong>must be limited recourse</strong> to comply with ATO rules. A non-limited recourse loan will
                    cause your SMSF to be non-compliant and may result in severe penalties. Please speak with your lender or our
                    team urgently.
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
          Continue to Declarations
        </PrimaryButton>
      </div>
    </div>
  );
};
