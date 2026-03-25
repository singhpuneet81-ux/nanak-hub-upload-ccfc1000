import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const REVENUE_PRICES: Record<string, { essential: number; pro: number }> = {
  "up-to-100k": { essential: 2990, pro: 4490 },
  "100k-250k": { essential: 3490, pro: 4990 },
  "250k-500k": { essential: 3990, pro: 5490 },
  "500k-1m": { essential: 4490, pro: 5990 },
  "1m-2m": { essential: 5490, pro: 6990 },
  "2m-5m": { essential: 6990, pro: 8990 },
};

const TAX_AGENT_OPTIONS = [
  {
    id: "mygov",
    label: "Online via myGov (Recommended)",
    description: "Nominate us through Online Services for Business - fastest and most secure method",
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
  onBack: () => void;
}

export const ASICStepReviewComplete: React.FC<Props> = ({ onBack }) => {
  const { customer } = useCheckout();
  const { packages } = usePricingPackages();
  const ASIC_BASE = packages.asic_agent.foundation.price;

  const [taxAgentMethod, setTaxAgentMethod] = useState("mygov");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build pricing
  const pkg = (customer.asicPackage as string) || "asic_only";
  const revenue = (customer.asicRevenue as string) || "";
  const billing = (customer.asicBilling as "monthly" | "annual") || "monthly";
  const packageLevel = (customer.asicPackageLevel as string) || "essential";
  const officeEnabled = !!customer.asicAddonOffice;
  const officePrice = officeEnabled ? 300 : 0;
  const payrollEnabled = !!customer.asicPayroll;
  const staffCount = (customer.asicStaffCount as number) || 1;
  const payrollFee = payrollEnabled ? staffCount * 20 : 0;

  let accountingFee = 0;
  if (pkg === "bundle_accounting" && revenue && REVENUE_PRICES[revenue]) {
    const prices = REVENUE_PRICES[revenue];
    const annualPrice = packageLevel === "pro" ? prices.pro : prices.essential;
    accountingFee = billing === "annual" ? annualPrice : Math.round(annualPrice / 10);
  }

  const total = ASIC_BASE + accountingFee + officePrice + payrollFee;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!termsAccepted) e.terms = "You must accept the terms & conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "asic_agent_services",
        customer: {
          ...customer,
          taxAgentMethod,
          termsAccepted,
        },
        selections: {
          package: pkg,
          revenue,
          billing,
          packageLevel,
          registeredOffice: officeEnabled,
          payroll: payrollEnabled,
          staffCount: payrollEnabled ? staffCount : 0,
        },
        pricing: {
          asicFee: ASIC_BASE,
          accountingFee,
          registeredOfficeFee: officePrice,
          payrollFee,
          total,
        },
      });
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tax Agent Nomination & Review</h2>
        <p className="text-muted-foreground mt-1">Final step - nominate us as your tax agent and review your order</p>
      </div>

      {/* Tax Agent Nomination */}
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={18} className="text-primary" />
          <h3 className="font-bold text-foreground">Tax Agent Nomination</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Required for us to lodge your tax returns</p>

        <p className="text-sm font-medium text-foreground mb-3">How would you like to nominate us as your tax agent?</p>

        <div className="space-y-3">
          {TAX_AGENT_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setTaxAgentMethod(opt.id)}
              className={cn(
                "border-2 rounded-xl p-4 cursor-pointer transition-all",
                taxAgentMethod === opt.id
                  ? "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.03)]"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                    taxAgentMethod === opt.id ? "border-[hsl(var(--success))]" : "border-muted-foreground/40"
                  )}
                >
                  {taxAgentMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {opt.recommended && (
                      <CheckCircle size={14} className="text-[hsl(var(--success))]" />
                    )}
                    <p className="font-medium text-foreground">{opt.label}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="border border-border rounded-xl p-5">
        <h3 className="font-bold text-foreground mb-3">Terms & Conditions <span className="text-destructive">*</span></h3>
        <div className="flex items-start gap-3">
          <Checkbox
            id="asic-terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
            className="mt-0.5"
          />
          <label htmlFor="asic-terms" className="text-sm text-muted-foreground cursor-pointer">
            I acknowledge that I have read and agree to the{" "}
            <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.{" "}
            I authorize Nanak Accountants & Associates to act as my ASIC agent and tax agent, and to charge the amount shown to my payment method.
          </label>
        </div>
        {errors.terms && <p className="text-destructive text-sm mt-2">{errors.terms}</p>}
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !termsAccepted}
          className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <CreditCard size={18} />
          {isSubmitting ? "Processing..." : "Complete Application"}
        </button>
      </div>
    </div>
    </>
  );
};
