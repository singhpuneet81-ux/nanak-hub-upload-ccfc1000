import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { formatCurrency } from "@/config/pricing.config";
import {
  Check,
  Building2,
  User,
  FileText,
  Shield,
  CreditCard,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";





/* ================= TIMELINE ================= */

const TIMELINE_STEPS = [
  {
    day: "Day 1",
    title: "Trust Application Submitted",
    description: "Your family trust setup is lodged for processing",
  },
  {
    day: "1–2 Business Days",
    title: "Document Preparation",
    description: "Trust deed and corporate trustee documents prepared",
  },
  {
    day: "2–3 Business Days",
    title: "Trust Established",
    description: "Trust deed, ABN & TFN issued and delivered",
  },
];

/* ================= COMPONENT ================= */

interface FTStepReviewPayProps {
  onBack: () => void;
}

// export const FTStepReviewPay: React.FC<FTStepReviewPayProps> = ({ onBack }) => {
//   const { customer, selections } = useCheckout();

  export const FTStepReviewPay: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customer, selections, pricing } = useCheckout();
  const { packages, serviceMeta } = usePricingPackages();
  const FT_BASE_PRICE = packages.family_trust.foundation.price;

  const ASIC_FEE = 611;

  const STATE_STAMP_DUTY: Record<string, { fee: number; label: string }> = {
    VIC: { fee: 200, label: "Victoria" },
    NSW: { fee: 750, label: "New South Wales" },
    NT: { fee: 20, label: "Northern Territory" },
  };

  const stampDutyEntry = STATE_STAMP_DUTY[customer.appointorState || ""];
  const stampDutyFee = stampDutyEntry?.fee || 0;

  const lineItems = useMemo(() => {
    const items: { name: string; price: number; gstFree?: boolean }[] = [];

    items.push({
      name: "Family Trust & Corporate Trustee Setup",
      price: FT_BASE_PRICE,
    });

    // ASIC Fee (GST-free)
    items.push({ name: "ASIC Fee", price: ASIC_FEE, gstFree: true });

    // Add-ons
    if (customer.businessNameAddon) {
      const bnServiceFee = packages.business_name.foundation.price;
      items.push({
        name: "Business Name Registration",
        price: bnServiceFee + (customer.businessNameTerm === "3_years" ? 102 : 44),
      });
    }

    if (customer.gstAddon) {
      items.push({ name: "GST Registration", price: packages.gst.foundation.price });
    }

    if (customer.registeredOfficeAddon) {
      items.push({ name: "Registered Office Address (Annual)", price: 220 });
    }

    // Stamp Duty (GST-free)
    if (stampDutyFee > 0) {
      items.push({
        name: `Stamp Duty (${stampDutyEntry!.label})`,
        price: stampDutyFee,
        gstFree: true,
      });
    }

    // Accounting Package - from API
    if (
      selections.package === "registration_plus_accounting" &&
      selections.accountingPlan &&
      selections.revenueBracket &&
      selections.billingFrequency
    ) {
      const packagePlans = (serviceMeta?.["family_trust"] as any)?.packagePlans;
      let acctPrice = 0;
      if (packagePlans?.plans) {
        const plan = packagePlans.plans.find((p: any) => p.id === selections.accountingPlan);
        const tp = plan?.tierPricing?.[selections.revenueBracket];
        if (tp) {
          acctPrice = selections.billingFrequency === "annual" ? (tp.bundle || tp.standard || 0) : (tp.standard || 0);
        }
      }
      items.push({
        name: `Ongoing Accounting (${selections.accountingPlan})`,
        price: acctPrice,
      });
    }

    // Payroll
    if (customer.payrollEnabled) {
      items.push({
        name: `Payroll Services (${selections.staffCount} staff)`,
        price: (selections.staffCount || 1) * 165,
      });
    }

    return items;
  }, [customer, selections, FT_BASE_PRICE, stampDutyFee, stampDutyEntry]);

  /* ================= TOTALS ================= */
  const { subtotal, gst, total } = useMemo(() => {
    const sub = lineItems.reduce((sum, i) => sum + i.price, 0);
    const gstFreeAmount = lineItems.filter(i => i.gstFree).reduce((sum, i) => sum + i.price, 0);
    const gstAmount = Math.round((sub - gstFreeAmount) * 0.1);
    return { subtotal: sub, gst: gstAmount, total: sub + gstAmount };
  }, [lineItems]);

  /* ================= RENDER ================= */


  return (
    <div className="content-card animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Review & Pay
        </h2>
        <p className="text-muted-foreground mt-1">
          One final step to establish your Family Trust
        </p>
      </div>

      {/* ================= SUMMARY SECTIONS ================= */}

      <div className="space-y-4 mb-6">
        {/* Trust Structure */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Trust Structure
            </h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trust Name</span>
              <span className="font-medium text-foreground">
                {customer.trustName || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Corporate Trustee
              </span>
              <span className="font-medium text-foreground">
                {customer.trusteeName || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Appointor */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Appointor Details
            </h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">
                {customer.appointorFirstName}{" "}
                {customer.appointorLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Beneficiaries
              </span>
              <span className="font-medium text-foreground">
                {customer.beneficiaries?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Services Included */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Services Included
            </h3>
          </div>
          <div className="ml-11">
            <ul className="space-y-2">
              {lineItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-foreground">
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Compliance Package */}
        {selections.package ===
          "registration_plus_accounting" && (
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Compliance Package
              </h3>
            </div>
            <div className="ml-11 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-medium text-foreground capitalize">
                  {selections.billingFrequency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-foreground">
                  {selections.accountingPlan}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= PAYMENT ================= */}

     {/* ================= PAYMENT ================= */}
<div className="border border-border rounded-xl p-5 mb-6">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
      <CreditCard className="w-4 h-4 text-primary" />
    </div>
    <h3 className="font-semibold text-foreground">
      Secure Payment
    </h3>
  </div>


  {/* Trust Strip */}
  <div className="flex items-center gap-3 bg-[hsl(142_76%_94%)] border border-[hsl(142_71%_85%)] rounded-lg px-4 py-3 mb-4">
    <ShieldCheck className="w-5 h-5 text-[hsl(142_71%_35%)]" />
    <p className="text-sm text-[hsl(142_71%_35%)]">
      256-bit SSL encryption · PCI-DSS compliant · Secure Stripe checkout
    </p>
  </div>

  {/* Order Totals */}
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Subtotal</span>
      <span className="text-foreground">
        {formatCurrency(subtotal)}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-muted-foreground">GST (10%)</span>
      <span className="text-foreground">
        {formatCurrency(gst)}
      </span>
    </div>

    <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
      <span className="text-foreground">Total</span>
      <span className="text-[hsl(var(--cta))]">
        {formatCurrency(total)}
      </span>
    </div>
  </div>
</div>


      {/* ================= TIMELINE ================= */}

      <div className="bg-muted/30 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            What Happens Next?
          </h3>
        </div>

        {TIMELINE_STEPS.map((step, index) => (
          <div
            key={index}
            className="flex gap-4 pb-4 last:pb-0"
          >
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              {index <
                TIMELINE_STEPS.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-primary">
                {step.day}
              </p>
              <p className="font-medium text-foreground">
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= BUTTONS ================= */}

      <CheckoutLoader visible={isSubmitting} />
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
        <BackButton onClick={onBack} className="sm:w-32" />
        <PrimaryButton
          onClick={async () => {
            if (isSubmitting) return;
            setIsSubmitting(true);
            try {
              const { submitCheckout } = await import("@/utils/submitCheckout");
              await submitCheckout({
                serviceKey: "family_trust",
                customer: { ...customer },
                selections: { ...selections },
                pricing: pricing,
              });
            } catch {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}
          className="flex-1"
        >
          Complete & Pay {formatCurrency(total)}
        </PrimaryButton>
      </div>
    </div>
  );
};
