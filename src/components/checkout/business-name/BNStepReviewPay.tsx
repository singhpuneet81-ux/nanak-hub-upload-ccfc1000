import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { formatCurrency } from "@/config/pricing.config";
import { getTermById } from "@/config/terms.config";
import { ADDON_PRICES } from "../abn/pricing";
import {
  getPlanById,
  getBracketById,
  getPricing,
} from "@/config/plans.config";
import { PAYROLL_PRICE_PER_STAFF } from "@/config/payroll.config";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  FileText,
  Shield,
  CreditCard,
  Check,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

/* ------------------------------------------------------------------ */
/* Shared ABN-style helpers                                            */
/* ------------------------------------------------------------------ */

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border border-border rounded-xl p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    <div className="ml-11 space-y-2 text-sm">{children}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground text-right">
      {value || "—"}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/* Timeline (same as ABN)                                              */
/* ------------------------------------------------------------------ */

const TIMELINE_STEPS = [
  {
    day: "Day 1",
    title: "Application Submitted",
    description: "Your business name application is lodged with ASIC",
  },
  {
    day: "Day 2–3",
    title: "Processing",
    description: "ASIC reviews and processes your application",
  },
  {
    day: "Day 3–5",
    title: "Business Name Registered",
    description: "Registration completed and confirmation sent",
  },
];

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export const BNStepReviewPay: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    customer,
    selections,
    prevStep,
    serviceFee,
    getSubmissionPayload,
  } = useCheckout();

  const term = getTermById(selections.registrationTerm);
  const plan = getPlanById(selections.accountingPlan);
  const bracket = getBracketById(selections.revenueBracket);

  /* -------------------- Pricing (UNCHANGED) -------------------- */
  // const { subtotal, gst, total } = useMemo(() => {

  
  //   const asicFee = term?.asicFee ?? 45;

  //   let accountingFee = 0;
  //   if (
  //     selections.package === "registration_plus_accounting" &&
  //     selections.revenueBracket &&
  //     selections.accountingPlan &&
  //     selections.billingFrequency
  //   ) {
  //     accountingFee = getPricing(
  //       selections.revenueBracket,
  //       selections.accountingPlan,
  //       selections.billingFrequency
  //     );
  //   }

  //   const payrollFee = selections.payrollEnabled
  //     ? selections.staffCount * PAYROLL_PRICE_PER_STAFF
  //     : 0;

  //   const sub = serviceFee + asicFee + accountingFee + payrollFee;
  //   const gstAmount = Math.round(sub * 0.1);

  //   return {
  //     subtotal: sub,
  //     gst: gstAmount,
  //     total: sub + gstAmount,
  //   };
  // }, [serviceFee, selections, term]);


  const { subtotal, gst, total } = useMemo(() => {
  const term = getTermById(selections.registrationTerm);
  const asicFee = term?.asicFee ?? 44;

  // Accounting
  let accountingFee = 0;
  if (
    selections.package === "registration_plus_accounting" &&
    selections.revenueBracket &&
    selections.accountingPlan &&
    selections.billingFrequency
  ) {
    accountingFee = getPricing(
      selections.revenueBracket,
      selections.accountingPlan,
      selections.billingFrequency
    );
  }

  // Payroll
  const payrollFee = selections.payrollEnabled
    ? selections.staffCount * PAYROLL_PRICE_PER_STAFF
    : 0;

  // Add-ons (IMPORTANT)
  let addonFee = 0;
  if (customer?.selectedAddons?.includes("gst")) {
    addonFee += ADDON_PRICES.gst;
  }
  if (customer?.selectedAddons?.includes("registered_office")) {
    addonFee += ADDON_PRICES.registered_office;
  }

  // GST is applied ONLY on taxable items (NOT ASIC)
  const taxableAmount =
    serviceFee + accountingFee + payrollFee + addonFee;

  const gstAmount = Math.round(taxableAmount * 0.1);

  // Subtotal (ex GST)
  const subtotalExGst =
    serviceFee + asicFee + accountingFee + payrollFee + addonFee;

  return {
    subtotal: subtotalExGst,
    gst: gstAmount,
    total: subtotalExGst + gstAmount,
  };
}, [serviceFee, selections, customer]);

  /* -------------------- Services Included -------------------- */
  const servicesIncluded = [
    "Business Name Registration",
    term?.label && `Registration Term: ${term.label}`,
    selections.package === "registration_plus_accounting" &&
      `Accounting Plan: ${plan?.name}`,
    selections.package === "registration_plus_accounting" &&
      bracket?.label &&
      `Revenue Bracket: ${bracket.label}`,
    selections.payrollEnabled &&
      `Payroll for ${selections.staffCount} staff`,
  ].filter(Boolean) as string[];

  /* -------------------- Submit -------------------- */
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "business_name",
        customer: { ...customer },
        selections: { ...selections },
        pricing: { subtotal, gst, total },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="content-card animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review & Pay</h2>
        <p className="text-muted-foreground mt-1">
          One final step to register your business name
        </p>
      </div>

      {/* Contact */}
      <Section icon={<User className="w-4 h-4 text-primary" />} title="Contact">
        <Row label="Name" value={`${customer.firstName} ${customer.lastName}`} />
        <Row label="Email" value={customer.email} />
        <Row label="Phone" value={customer.phone} />
      </Section>

      {/* Business */}
      <Section
        icon={<Building2 className="w-4 h-4 text-primary" />}
        title="Business Details"
      >
        <Row label="Business Name" value={customer.proposedBusinessName} />
        <Row label="Structure" value={customer.businessStructure} />
      </Section>

      {/* Services */}
      <Section
        icon={<FileText className="w-4 h-4 text-primary" />}
        title="Services Included"
      >
        {servicesIncluded.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>{item}</span>
          </div>
        ))}
      </Section>

      {/* Guarantee */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-primary">
            100% Satisfaction Guarantee
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            If you're not satisfied with our service, we’ll fix it or provide a
            full refund.
          </p>
        </div>
      </div>

      {/* Order Total */}
      <div className="border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Order Total</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span>{formatCurrency(gst)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
            <span>Total</span>
            <span className="text-[hsl(var(--cta))]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-muted/30 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">What Happens Next?</h3>
        </div>

        {TIMELINE_STEPS.map((step, i) => (
          <div key={i} className="flex gap-4 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-primary">{step.day}</p>
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="checkout-nav flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 h-12 border border-border rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 bg-[hsl(var(--cta))] text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          Complete & Pay {formatCurrency(total)}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
    </>
  );
};
