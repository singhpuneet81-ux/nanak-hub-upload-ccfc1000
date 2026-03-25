import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, Lock, CheckCircle, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { useServicePricing } from "@/hooks/useAccountingPricing";
import {
  calculateAccountingPrice,
  getAccountingFallback,
} from "@/config/accountingPricingFallback";

interface Props {
  onBack: () => void;
}

export const CAStepPayment: React.FC<Props> = ({ onBack }) => {
  const { customer } = useCheckout();
  const { pricing: apiPricing } = useServicePricing("company_accounting");
  const cfg = apiPricing ?? getAccountingFallback("company_accounting")!;

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startDateId = (customer.caStartDate as string) || "jul";
  const revenueTier = (customer.caRevenue as string) || "under75k";
  const billing = (customer.caBilling as "monthly" | "annual") || "annual";
  const plan = (customer.caPackageLevel as "essential" | "premium") || "essential";
  const payrollEnabled = !!customer.caPayroll;
  const employeeCount = (customer.caEmployeeCount as number) || 1;
  const catchUp = (customer.caCatchUp as string) || "up_to_date";
  const registeredOffice = !!customer.caRegisteredOffice;
  const taxPlanning = !!customer.caTaxPlanning;

  const result = calculateAccountingPrice({
    tiers: cfg.tiers, revenueTier, billing, startDateId,
    startDates: cfg.startDates, annualDiscount: cfg.annualDiscount,
    transitionFee: cfg.transitionFee, enableStrikePricing: cfg.enableStrikePricing,
    packageLevel: plan, taxPlanningFee: cfg.addons?.taxPlanningFee ?? 0,
    prorateCompliance: true,
  });
  const startInfo = cfg.startDates.find((d) => d.id === startDateId) ?? cfg.startDates[0];
  const months = startInfo.months;

  const payrollPerEmp = cfg.addons.payrollPerEmployee;
  const payrollFee = payrollEnabled
    ? (billing === "monthly" ? Math.round(payrollPerEmp * employeeCount / 12) : Math.round((payrollPerEmp * employeeCount / 12) * months))
    : 0;
  const catchUpFee = catchUp === "need_support" ? cfg.addons.catchUpFee : 0;
  const officeFee = registeredOffice
    ? (billing === "monthly" ? Math.round(cfg.addons.registeredOfficeFee / 12) : Math.round((cfg.addons.registeredOfficeFee / 12) * months))
    : 0;
  const taxPlanningFee = taxPlanning ? cfg.addons.taxPlanningFee : 0;

  const total = result.total + payrollFee + catchUpFee + officeFee + taxPlanningFee;

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
        serviceKey: "company_accounting",
        customer: {
          companyName: customer.caCompanyName, abn: customer.caABN, acn: customer.caACN,
          fullName: customer.caFullName, email: customer.caEmail, phone: customer.caPhone,
          taxAgentMethod: customer.caTaxAgentMethod, termsAccepted,
        },
        selections: {
          startDate: startDateId, months, revenueTier, billing, packageLevel: plan,
          payroll: payrollEnabled, employeeCount: payrollEnabled ? employeeCount : 0,
          catchUp, registeredOffice, taxPlanning,
        },
        pricing: {
          compliance: result.compliance, operations: result.operations, transition: result.transition,
          discount: result.discount, packagePrice: result.total,
          payrollFee, catchUpFee, officeFee, taxPlanningFee, total,
        },
      });
    } catch (err) { console.error("Submission error:", err); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
      <div className="space-y-6">
        <div><h2 className="text-2xl font-bold text-foreground">Secure Payment</h2><p className="text-placeholder mt-1">Complete your purchase securely</p></div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <Lock size={18} className="text-primary" />
          <div><p className="font-medium text-foreground text-sm">256-bit SSL Encryption</p><p className="text-xs text-placeholder">Your payment information is secure and encrypted</p></div>
        </div>

        <div className="border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Checkbox id="ca-terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} className="mt-0.5" />
            <label htmlFor="ca-terms" className="text-sm text-placeholder cursor-pointer">
              I accept the <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span> and{" "}
              <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>. I authorize Nanak Accountants to charge my payment method for the selected services.
            </label>
          </div>
          {errors.terms && <p className="text-destructive text-sm mt-2">{errors.terms}</p>}
        </div>

        <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.2)] rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-[hsl(var(--success))]" />
          <div><p className="font-medium text-foreground text-sm">30-Day Money-Back Guarantee</p><p className="text-xs text-placeholder">Not satisfied? Get a full refund within 30 days, no questions asked.</p></div>
        </div>

        <div className="border-2 border-[hsl(var(--cta)/0.2)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><CheckCircle size={18} className="text-[hsl(var(--cta))]" /><h3 className="font-bold text-foreground">What Happens After Payment?</h3></div>
          <div className="space-y-4">
            {[
              { step: 1, title: "Instant Confirmation", desc: "Receive immediate email confirmation with your invoice and service details" },
              { step: 2, title: "Account Manager Contact (Within 24 Hours)", desc: "Your dedicated Client Account Manager will reach out to welcome you and schedule your onboarding call" },
              { step: 3, title: "Onboarding Session (Week 1)", desc: "Complete walkthrough of accounting setup, software access, and document upload process" },
              { step: 4, title: "We Start Your Accounting (Weeks 1-2)", desc: "Our team begins processing your books, setting up systems, and handling compliance tasks" },
              { step: 5, title: "Ongoing Support & Reporting", desc: "Monthly financial reports, unlimited email support, and quarterly strategy sessions" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--cta))] text-white flex items-center justify-center text-xs font-bold shrink-0 disabled:opacity-50">{item.step}</div>
                <div><p className="font-medium text-foreground text-sm">{item.title}</p><p className="text-xs text-placeholder">{item.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-sm text-placeholder"><Phone size={14} /></div>
        </div>

        <div className="checkout-nav flex justify-between pt-4">
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"><ArrowLeft size={18} /> Back</button>
          <button onClick={handleSubmit} disabled={isSubmitting || !termsAccepted} className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            <Lock size={18} />
            {isSubmitting ? "Processing..." : `Complete Purchase - $${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </>
  );
};
