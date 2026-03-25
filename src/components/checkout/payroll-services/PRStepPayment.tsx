import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { usePayrollPricing } from "@/hooks/usePayrollPricing";

interface Props {
  onBack: () => void;
}

export const PRStepPayment: React.FC<Props> = ({ onBack }) => {
  const { customer } = useCheckout();
  const { pricing, annualDiscount } = usePayrollPricing();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tiers = pricing.tiers;
  const addonPrices = pricing.addonPrices;
  const selectedTierIdx = (customer.prTierIdx as number) ?? 1;
  const billing = (customer.prBilling as "monthly" | "annual") || "annual";
  const isAnnual = billing === "annual";
  const weeklyPayRuns = !!customer.prWeeklyPayRuns;
  const extraEmployees = (customer.prExtraEmployees as number) || 0;

  const tier = tiers[selectedTierIdx] ?? tiers[1] ?? tiers[0];
  const baseMo = tier.rate;
  const weeklyMo = weeklyPayRuns ? addonPrices.weekly : 0;
  const extraEmpMo = extraEmployees * addonPrices.extraEmp;
  const recurMo = baseMo + weeklyMo + extraEmpMo;

  const onetimeTotal =
    (!!customer.prPaydaySuper ? addonPrices.paydaysuper : 0) +
    (!!customer.prTermination ? addonPrices.termination : 0) +
    (!!customer.prBackPay ? addonPrices.backpay : 0) +
    (!!customer.prHealthCheck ? addonPrices.healthcheck : 0);

  let total: number;
  if (isAnnual) {
    const recurYrFull = recurMo * 12;
    const disc = Math.round(recurYrFull * annualDiscount);
    total = recurYrFull - disc + onetimeTotal;
  } else {
    total = recurMo + onetimeTotal;
  }

  const suffix = isAnnual ? "/yr" : "/mo";

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
        serviceKey: "payroll_services",
        customer: {
          businessName: customer.prBusinessName,
          abn: customer.prABN,
          acn: customer.prACN,
          fullName: customer.prFullName,
          email: customer.prEmail,
          phone: customer.prPhone,
          taxAgentMethod: customer.prTaxAgentMethod,
          termsAccepted,
        },
        selections: {
          tierIdx: selectedTierIdx,
          tierName: tier.name,
          billing,
          weeklyPayRuns,
          extraEmployees,
          paydaySuper: !!customer.prPaydaySuper,
          termination: !!customer.prTermination,
          backPay: !!customer.prBackPay,
          healthCheck: !!customer.prHealthCheck,
        },
        pricing: {
          planBase: isAnnual ? Math.round(baseMo * 12 * (1 - annualDiscount)) : baseMo,
          weeklyAddon: isAnnual ? Math.round(weeklyMo * 12 * (1 - annualDiscount)) : weeklyMo,
          extraEmployees: isAnnual ? Math.round(extraEmpMo * 12 * (1 - annualDiscount)) : extraEmpMo,
          onetimeTotal,
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
          <h2 className="text-2xl font-bold text-foreground">Secure Payment</h2>
          <p className="text-muted-foreground mt-1">Complete your purchase securely</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <Lock size={18} className="text-primary" />
          <div>
            <p className="font-medium text-foreground text-sm">256-bit SSL Encryption</p>
            <p className="text-xs text-muted-foreground">Your payment information is secure and encrypted</p>
          </div>
        </div>

        <div className="border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Checkbox id="pr-terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} className="mt-0.5" />
            <label htmlFor="pr-terms" className="text-sm text-muted-foreground cursor-pointer">
              I accept the <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span> and{" "}
              <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>. I authorize Nanak Accountants to charge my payment method for the selected services.
            </label>
          </div>
          {errors.terms && <p className="text-destructive text-sm mt-2">{errors.terms}</p>}
        </div>

        <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.2)] rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-[hsl(var(--success))]" />
          <div>
            <p className="font-medium text-foreground text-sm">30-Day Money-Back Guarantee</p>
            <p className="text-xs text-muted-foreground">Not satisfied? Get a full refund within 30 days, no questions asked.</p>
          </div>
        </div>

        <div className="border-2 border-[hsl(var(--cta)/0.2)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-[hsl(var(--cta))]" />
            <h3 className="font-bold text-foreground">What Happens After Payment?</h3>
          </div>
          <div className="space-y-4">
            {[
              { step: 1, title: "Instant Confirmation", desc: "Receive immediate email confirmation with your invoice and service details" },
              { step: 2, title: "Payroll Specialist Contact (Within 24 Hours)", desc: "Your dedicated payroll specialist will reach out to schedule your onboarding call" },
              { step: 3, title: "Payroll Onboarding (Week 1)", desc: "Complete walkthrough of payroll setup, employee details collection, and award configuration" },
              { step: 4, title: "First Pay Run Processing (Weeks 1-2)", desc: "We process your first pay run, lodge STP, and set up super clearing house" },
              { step: 5, title: "Ongoing Payroll Support", desc: "Regular pay runs, STP lodgement, super processing, and unlimited email support" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--cta))] text-white flex items-center justify-center text-xs font-bold shrink-0 disabled:opacity-50">{item.step}</div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-nav flex justify-between pt-4">
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting || !termsAccepted} className="flex items-center gap-2 px-4 sm:px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm sm:text-base">
            <Lock size={18} className="shrink-0" />
            <span className="truncate">{isSubmitting ? "Processing..." : `Pay $${total.toLocaleString()}${onetimeTotal > 0 ? ` + $${onetimeTotal}` : ""}${suffix}`}</span>
          </button>
        </div>
      </div>
    </>
  );
};
