import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PAYROLL_PRICE_PER_STAFF } from "@/config/payroll.config";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, X, Users, Check, Minus, Plus, Info } from "lucide-react";

export const BNStepPayroll: React.FC = () => {
  const { selections, updateSelections, nextStep, prevStep } = useCheckout();

  const payrollEnabled = selections.payrollEnabled;
  const staffCount = selections.staffCount || 1;

  const handlePayrollToggle = (enabled: boolean) => {
    updateSelections({
      payrollEnabled: enabled,
      staffCount: enabled ? Math.max(1, staffCount) : 1,
    });
  };

  const adjustStaffCount = (delta: number) => {
    const newCount = Math.max(1, staffCount + delta);
    updateSelections({ staffCount: newCount });
  };

  const handleContinue = () => {
    nextStep();
  };

  const payrollCost = payrollEnabled ? staffCount * PAYROLL_PRICE_PER_STAFF : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Payroll Services</h2>
        <p className="text-muted-foreground mt-1">Are you looking to hire staff or manage payroll?</p>
      </div>

      {/* Payroll Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* No Payroll */}
        <div
          onClick={() => handlePayrollToggle(false)}
          className={cn(
            "relative rounded-xl border-2 p-5 cursor-pointer transition-all",
            !payrollEnabled
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              !payrollEnabled
                ? "bg-primary border-primary"
                : "border-border"
            )}>
              {!payrollEnabled && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <X className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">No Payroll Needed</h3>
              <p className="text-sm text-muted-foreground">Just me for now</p>
              <p className="text-xs text-muted-foreground mt-2">Perfect for solo founders and contractors</p>
            </div>
          </div>
        </div>

        {/* Yes Payroll */}
        <div
          onClick={() => handlePayrollToggle(true)}
          className={cn(
            "relative rounded-xl border-2 p-5 cursor-pointer transition-all",
            payrollEnabled
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              payrollEnabled
                ? "bg-primary border-primary"
                : "border-border"
            )}>
              {payrollEnabled && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Yes, Add Payroll</h3>
              <p className="text-sm text-muted-foreground">I have or will hire staff</p>
              <p className="text-sm font-medium text-primary mt-2">${PAYROLL_PRICE_PER_STAFF}/yr per staff member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Counter (only if payroll enabled) */}
      {payrollEnabled && (
        <div className="border border-border rounded-xl p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">How many staff members?</h3>
            <p className="text-sm text-muted-foreground">You can always adjust this later</p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => adjustStaffCount(-1)}
              disabled={staffCount <= 1}
              className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[hsl(var(--cta))] text-white hover:bg-[hsl(var(--cta)/0.85)] disabled:opacity-50"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-5xl font-bold text-foreground">{staffCount}</span>
              <p className="text-sm text-muted-foreground mt-1">Staff member{staffCount > 1 ? "s" : ""}</p>
              <p className="text-sm font-medium text-primary mt-1">+${payrollCost}/yr</p>
            </div>

            <button
              onClick={() => adjustStaffCount(1)}
              className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors bg-[hsl(var(--cta))] text-white hover:bg-[hsl(var(--cta)/0.85)] disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* What's included */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm">
              <span className="font-medium text-foreground">What's included: </span>
              <span className="text-muted-foreground">
                Payroll processing, PAYG withholding, superannuation compliance, payment summaries, and Single Touch Payroll (STP) lodgement.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="checkout-nav flex gap-4">
        <button
          onClick={prevStep}
          className="flex-1 h-12 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 h-12 bg-[hsl(var(--cta))] hover:bg-[hsl(var(--cta))]/90 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          Continue to Review
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
