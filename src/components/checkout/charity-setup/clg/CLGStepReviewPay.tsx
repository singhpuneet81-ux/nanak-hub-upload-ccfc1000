import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { BackButton, PrimaryButton } from "@/components/checkout/Buttons";
import { formatCurrency } from "@/config/pricing.config";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import {
  Building2, Users, FileText, Check, Clock, CheckCircle2,
} from "lucide-react";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

const GST_RATE = 0.1;
const ASIC_FEE = 495;

const ACNC_SUBTYPE_LABELS: Record<string, string> = {
  advancing_health: "Advancing Health",
  advancing_education: "Advancing Education",
  advancing_social_welfare: "Advancing Social or Public Welfare",
  advancing_religion: "Advancing Religion",
  advancing_culture: "Advancing Culture",
  advancing_natural_environment: "Advancing Natural Environment",
  advancing_reconciliation: "Advancing Reconciliation, Mutual Respect and Tolerance",
  advancing_human_rights: "Advancing Human Rights",
  advancing_security: "Advancing Security/Safety of Australia or Australian Public",
  preventing_animal_suffering: "Preventing or Relieving Suffering of Animals",
  other_community: "Other Purpose Beneficial to Community",
};

const SERVICES_INCLUDED = [
  "ASIC company registration (nationwide)",
  "Constitution & replaceable rules",
  "ABN & TFN registration",
  "ACNC charity registration",
  "Director consent forms & company registers",
  "Ongoing compliance support (12 months)",
];

const TIMELINE_STEPS = [
  { day: "Week 1", title: "Application Submitted", description: "Your CLG application is lodged with ASIC" },
  { day: "Week 1-2", title: "Compliance Review", description: "We review your information for ASIC and ACNC compliance" },
  { day: "Week 2-3", title: "Document Preparation", description: "Constitution and replaceable rules are prepared" },
  { day: "Week 3-5", title: "Company Registered", description: "Registration submitted to ASIC and ACNC charity registration" },
];

interface Director { id: string; firstName: string; lastName: string; }
interface Member { id: string; firstName: string; lastName: string; }

export const CLGStepReviewPay: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customer, prevStep } = useCheckout();
  const { packages } = usePricingPackages();
  const CLG_PRICE = packages.charity_clg.foundation.price;

  const companyName = (customer?.clgCompanyName as string) || "Not provided";
  const charitySubtype = customer?.clgCharitySubtype as string;
  const subtypeLabel = charitySubtype ? ACNC_SUBTYPE_LABELS[charitySubtype] || charitySubtype : "Not selected";
  const directors = (customer?.clgDirectors as Director[]) || [];
  const members = (customer?.clgMembers as Member[]) || [];
  const guaranteeAmount = (customer?.clgGuaranteeAmount as string) || "10";

  const { serviceFee, subtotal, gst, total } = useMemo(() => {
    const sf = CLG_PRICE;
    const sub = sf + ASIC_FEE;
    const g = Math.round(sf * GST_RATE * 100) / 100;
    return { serviceFee: sf, subtotal: sub, gst: g, total: sub + g };
  }, [CLG_PRICE]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "charity_clg",
        customer: { ...customer },
        selections: { structure: "company_limited_guarantee" },
        pricing: { subtotal, gst, total },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="content-card animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Review & Pay</h2>
        <p className="text-muted-foreground mt-1">One final step to complete your CLG registration</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Company Details */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Company Details</h3>
          </div>
          <div className="sm:ml-11 space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
              <span className="text-muted-foreground">Company Name</span>
              <span className="font-medium text-foreground break-words text-right">{companyName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
              <span className="text-muted-foreground">Charity Subtype</span>
              <span className="font-medium text-foreground break-words text-right">{subtypeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guarantee Amount</span>
              <span className="font-medium text-foreground">${guaranteeAmount} per member</span>
            </div>
          </div>
        </div>

        {/* Directors & Members */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Directors & Members</h3>
          </div>
          <div className="sm:ml-11 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number of Directors</span>
              <span className="font-medium text-foreground">{directors.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number of Members</span>
              <span className="font-medium text-foreground">{members.length}</span>
            </div>
          </div>
        </div>

        {/* Services Included */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Services Included</h3>
          </div>
          <div className="sm:ml-11">
            <ul className="space-y-2">
              {SERVICES_INCLUDED.map((service, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Order Total */}
      <div className="border border-border rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Order Total</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Our service fee</span>
            <span className="text-foreground">{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">ASIC fee</span>
              <span className="text-xs font-medium text-[hsl(var(--success))]">(GST Free)</span>
            </div>
            <span className="text-foreground">{formatCurrency(ASIC_FEE)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="text-foreground">{formatCurrency(gst)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-[hsl(var(--cta))]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-muted/30 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">What Happens Next?</h3>
        </div>
        <div className="relative">
          {TIMELINE_STEPS.map((step, index) => (
            <div key={index} className="flex gap-4 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                {index < TIMELINE_STEPS.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-xs font-medium text-primary">{step.day}</p>
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
        <BackButton onClick={onBack} className="sm:w-32" />
        <PrimaryButton onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
          Complete & Pay {formatCurrency(total)}
        </PrimaryButton>
      </div>
    </div>
    </>
  );
};
