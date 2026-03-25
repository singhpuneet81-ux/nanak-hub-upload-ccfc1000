import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { useBookkeepingPricing } from "@/hooks/useBookkeepingPricing";

const PREMIUM_CATCH_UP_FEE = 599;
const REGISTERED_OFFICE_FEE = 300;
const TAX_PLANNING_FEE = 299;

interface Props {
  onBack: () => void;
}

export const BKStepPayment: React.FC<Props> = ({ onBack }) => {
  const { customer } = useCheckout();
  const { pricing, annualDiscount } = useBookkeepingPricing();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tiers = pricing.tiers;
  const addonPrices = pricing.addonPrices;
  const selectedTierIdx = (customer.bkTierIdx as number) ?? 1;
  const billing = (customer.bkBilling as "monthly" | "annual") || "annual";
  const isAnnual = billing === "annual";
  const employees = (customer.bkEmployees as number) || 0;
  const extraFeeds = !!customer.bkExtraFeeds;
  const catchUp = !!customer.bkCatchUp;
  const ias = !!customer.bkIas;
  const jobTracking = !!customer.bkJobTracking;

  const tier = tiers[selectedTierIdx] ?? tiers[1] ?? tiers[0];
  const baseMo = tier.rate;
  const empMo = employees * addonPrices.payroll;
  const recMo = (extraFeeds ? addonPrices.feeds : 0) + (ias ? addonPrices.ias : 0) + (jobTracking ? addonPrices.jobtrack : 0);
  const oneTime = catchUp ? addonPrices.catchup : 0;

  let recurringTotal: number;
  if (isAnnual) {
    const totalYrFull = (baseMo + empMo + recMo) * 12;
    const disc = Math.round(totalYrFull * annualDiscount);
    recurringTotal = totalYrFull - disc + oneTime;
  } else {
    recurringTotal = baseMo + empMo + recMo + oneTime;
  }

  const premiumCatchUp = (customer.bkPremiumCatchUp as string) || "up_to_date";
  const premiumCatchUpFee = premiumCatchUp === "need_support" ? PREMIUM_CATCH_UP_FEE : 0;
  const officeFee = !!customer.bkRegisteredOffice ? REGISTERED_OFFICE_FEE : 0;
  const taxPlanningFee = !!customer.bkTaxPlanning ? TAX_PLANNING_FEE : 0;
  const premiumTotal = premiumCatchUpFee + officeFee + taxPlanningFee;

  const total = recurringTotal + premiumTotal;
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
        serviceKey: "bookkeeping",
        customer: {
          businessName: customer.bkBusinessName,
          abn: customer.bkABN,
          acn: customer.bkACN,
          fullName: customer.bkFullName,
          email: customer.bkEmail,
          phone: customer.bkPhone,
          taxAgentMethod: customer.bkTaxAgentMethod,
          termsAccepted,
        },
        selections: {
          tierIdx: selectedTierIdx,
          tierName: tier.name,
          billing,
          employees,
          extraFeeds,
          catchUp,
          ias,
          jobTracking,
          premiumCatchUp,
          registeredOffice: !!customer.bkRegisteredOffice,
          taxPlanning: !!customer.bkTaxPlanning,
        },
        pricing: {
          planBase: isAnnual ? Math.round(baseMo * 12 * (1 - annualDiscount)) : baseMo,
          payroll: isAnnual ? Math.round(empMo * 12 * (1 - annualDiscount)) : empMo,
          addonsRecurring: isAnnual ? Math.round(recMo * 12 * (1 - annualDiscount)) : recMo,
          catchUp: oneTime,
          premiumCatchUpFee,
          officeFee,
          taxPlanningFee,
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
            <Checkbox id="bk-terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} className="mt-0.5" />
            <label htmlFor="bk-terms" className="text-sm text-muted-foreground cursor-pointer">
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
              { step: 2, title: "Account Manager Contact (Within 24 Hours)", desc: "Your dedicated Client Account Manager will reach out to welcome you and schedule your onboarding call" },
              { step: 3, title: "Onboarding Session (Week 1)", desc: "Complete walkthrough of accounting setup, software access, and document upload process" },
              { step: 4, title: "We Start Your Accounting (Weeks 1-2)", desc: "Our team begins processing your books, setting up systems, and handling compliance tasks" },
              { step: 5, title: "Ongoing Support & Reporting", desc: "Monthly financial reports, unlimited email support, and quarterly strategy sessions" },
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
            <span className="truncate">{isSubmitting ? "Processing..." : `Pay $${total.toLocaleString()}${suffix}`}</span>
          </button>
        </div>
      </div>
    </>
  );
};
