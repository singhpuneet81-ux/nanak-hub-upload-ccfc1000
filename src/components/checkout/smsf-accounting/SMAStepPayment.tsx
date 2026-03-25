import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, Lock, CheckCircle, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { useSMSFPricing } from "@/hooks/useSMSFPricing";

const FUND_MULTIPLIERS: Record<string, number> = {
  "under-200k": 1,
  "200k-500k": 1.4,
  "500k-1m": 1.9,
  "1m-2m": 2.8,
  "2m-5m": 4.2,
};

interface Props { onBack: () => void; }

export const SMAStepPayment: React.FC<Props> = ({ onBack }) => {
  const { customer } = useCheckout();
  const { cfg } = useSMSFPricing();
  const baseMonthly = Math.round(cfg.baseAnnual / 12);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const billing = (customer.smaBilling as "monthly" | "annual") || "annual";
  const catchUp = (customer.smaCatchUp as string) || "up_to_date";
  const taxPlanning = !!customer.smaTaxPlanning;

  const BASE = cfg.baseAnnual;
  const DISC = cfg.annualDiscount || 0.2;
  const isAnnual = billing === "annual";
  const RES_PRICE = cfg.propertyRates.residential;
  const COM_PRICE = cfg.propertyRates.commercial;

  const residentialCount = (customer.smaResidentialCount as number) || 0;
  const commercialCount = (customer.smaCommercialCount as number) || 0;
  const investmentAddons = (customer.smaInvestmentAddons as string[]) || [];
  const memberCount = (customer.smaMemberCount as number) || 2;
  const hasPension = !!customer.smaPension;

  const addonTotal =
    residentialCount * RES_PRICE +
    commercialCount * COM_PRICE +
    investmentAddons.reduce((s, id) => s + (cfg.investmentAddons.find((a) => a.id === id)?.price || 0), 0) +
    Math.max(0, memberCount - 2) * cfg.extraMemberFee +
    (hasPension ? cfg.pensionFee : 0);

  const fullYearly = BASE + addonTotal;
  const packagePrice = isAnnual ? Math.round(fullYearly * (1 - DISC)) : fullYearly;

  const catchUpFee = catchUp === "need_support" ? cfg.catchUpFee : 0;
  const taxPlanningFee = taxPlanning ? cfg.strategySessionFee : 0;
  const total = packagePrice + catchUpFee + taxPlanningFee;

  const handleSubmit = async () => {
    if (!termsAccepted) { setErrors({ terms: "You must accept the terms & conditions" }); return; }
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "smsf_accounting",
        customer: { fundName: customer.smaFundName, abn: customer.smaABN, trusteeName: customer.smaTrusteeName, fullName: customer.smaFullName, email: customer.smaEmail, phone: customer.smaPhone, taxAgentMethod: customer.smaTaxAgentMethod, termsAccepted },
        selections: { billing, catchUp, taxPlanning, residentialCount, commercialCount, investmentAddons, memberCount, hasPension },
        pricing: { packagePrice, catchUpFee, taxPlanningFee, total },
      });
    } catch (err) { console.error("Submission error:", err); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
      <div className="space-y-6">
        <div><h2 className="text-2xl font-bold text-foreground">Secure Payment</h2><p className="text-muted-foreground mt-1">Complete your purchase securely</p></div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3"><Lock size={18} className="text-primary" /><div><p className="font-medium text-foreground text-sm">256-bit SSL Encryption</p><p className="text-xs text-muted-foreground">Your payment information is secure</p></div></div>
        <div className="border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Checkbox id="sma-terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(!!c)} className="mt-0.5" />
            <label htmlFor="sma-terms" className="text-sm text-muted-foreground cursor-pointer">I accept the <span className="text-primary hover:underline">Terms & Conditions</span> and <span className="text-primary hover:underline">Privacy Policy</span>.</label>
          </div>
          {errors.terms && <p className="text-destructive text-sm mt-2">{errors.terms}</p>}
        </div>
        <div className="bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.2)] rounded-xl p-4 flex items-center gap-3"><CheckCircle size={18} className="text-[hsl(var(--success))]" /><div><p className="font-medium text-foreground text-sm">30-Day Money-Back Guarantee</p><p className="text-xs text-muted-foreground">Not satisfied? Full refund within 30 days.</p></div></div>
        <div className="border-2 border-[hsl(var(--cta)/0.2)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><CheckCircle size={18} className="text-[hsl(var(--cta))]" /><h3 className="font-bold text-foreground">What Happens After Payment?</h3></div>
          <div className="space-y-4">
            {[
              { step: 1, title: "Instant Confirmation", desc: "Email confirmation with invoice and service details" },
              { step: 2, title: "SMSF Specialist Assigned (Within 24 Hours)", desc: "Your dedicated SMSF accountant will reach out" },
              { step: 3, title: "Onboarding (Week 1)", desc: "Document collection, software access, and rollover coordination" },
              { step: 4, title: "We Start Your SMSF Accounting", desc: "Transaction recording, investment tracking, and compliance setup" },
              { step: 5, title: "Ongoing Support", desc: "Annual tax return, financial statements, audit coordination, and unlimited support" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--cta))] text-white flex items-center justify-center text-xs font-bold shrink-0 disabled:opacity-50">{item.step}</div>
                <div><p className="font-medium text-foreground text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="checkout-nav flex justify-between pt-4">
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"><ArrowLeft size={18} /> Back</button>
          <button onClick={handleSubmit} disabled={isSubmitting || !termsAccepted} className="flex items-center gap-2 px-8 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"><Lock size={18} />{isSubmitting ? "Processing..." : `Complete Purchase - $${total.toLocaleString()}`}</button>
        </div>
      </div>
    </>
  );
};
