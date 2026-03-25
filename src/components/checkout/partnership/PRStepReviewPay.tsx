import React, { useMemo, useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { formatCurrency } from "@/config/pricing.config";
import {
  Check, Users, FileText, Clock, CheckCircle2,
  Briefcase, UserCheck, Building2
} from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

const ADDRESS_PRICE = 250;

const DECLARATION_POINTS = [
  "All partners have agreed to establish the partnership as outlined in this application.",
  "The information provided (partner details, business activities, profit-sharing ratios, and contact information) is true and complete.",
  "This service includes partnership registration, ABN/TFN application, and compliance setup only.",
  "No legal advice is being provided regarding liability, partnership disputes, or asset protection.",
  "We understand that partners are jointly and severally liable for partnership debts.",
  "We authorise Nanak Accountants & Associates to lodge registrations with the ATO and relevant authorities on our behalf.",
];

const TIMELINE_STEPS = [
  { day: "Day 1", title: "Application Submitted", description: "Your partnership registration is lodged with the ATO" },
  { day: "Day 2-3", title: "Processing", description: "ATO reviews and processes your application" },
  { day: "Day 5-7", title: "Registration Complete", description: "Your ABN, TFN and registrations are issued" },
];

export const PRStepReviewPay: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { customer, updateCustomer, prevStep } = useCheckout();
  const { packages } = usePricingPackages();
  const BASE_PRICE = packages.partnership.foundation.price;
  const GST_ADDON_PRICE = packages.gst.foundation.price;
  const bnServiceFee = packages.business_name.foundation.price;
  const partners = customer.prPartners || [];

  const signature = (customer.prSignature as string) || "";
  const allDeclared = !!signature.trim();

  const bnPrice = useMemo(() => {
    if (!customer.prBusinessNameAddon) return 0;
    const bnAsic = customer.prBnTerm === "3_year" ? 102 : 44;
    return bnServiceFee + bnAsic;
  }, [customer.prBusinessNameAddon, customer.prBnTerm, bnServiceFee]);

  const { subtotal, gst, total } = useMemo(() => {
    const sub =
      BASE_PRICE +
      (customer.prGstAddon ? GST_ADDON_PRICE : 0) +
      bnPrice +
      (customer.prBusinessAddressAddon ? ADDRESS_PRICE : 0);
    const bnAsicFee = customer.prBusinessNameAddon ? (customer.prBnTerm === "3_year" ? 102 : 44) : 0;
    const g = Math.round((sub - bnAsicFee) * 0.1);
    return { subtotal: sub, gst: g, total: sub + g };
  }, [customer.prGstAddon, bnPrice, customer.prBusinessAddressAddon, customer.prBusinessNameAddon, customer.prBnTerm, GST_ADDON_PRICE]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "partnership",
        customer: {
          partnershipName: customer.prPartnershipName,
          tradesUnderBusinessName: customer.prTradesUnderBusinessName,
          businessName: customer.prBusinessName,
          startDate: customer.prStartDate,
          mainActivity: customer.prMainActivity,
          otherActivity: customer.prOtherActivity,
          address: {
            street: customer.prStreetAddress,
            city: customer.prCity,
            state: customer.prState,
            postcode: customer.prPostcode,
          },
          postalDifferent: customer.prPostalDifferent,
          postalAddress: customer.prPostalDifferent === "yes" ? {
            street: customer.prPostalStreet,
            city: customer.prPostalCity,
            state: customer.prPostalState,
            postcode: customer.prPostalPostcode,
          } : null,
          partners,
          taxSetup: {
            applyABN: customer.prApplyABN,
            applyTFN: customer.prApplyTFN,
            paygWithholding: customer.prPaygWithholding,
          },
          addons: {
            gst: customer.prGstAddon || false,
            gstStartDate: customer.prGstStartDate || null,
            businessName: customer.prBusinessNameAddon || false,
            bnTerm: customer.prBnTerm || null,
            businessAddress: customer.prBusinessAddressAddon || false,
          },
          authorisedContact: {
            name: customer.prContactName,
            position: customer.prContactPosition,
            phone: customer.prContactPhone,
            email: customer.prContactEmail,
            taxAgentAuth: customer.prTaxAgentAuth,
          },
          signature: customer.prSignature,
        },
        selections: {},
        pricing: {
          basePrice: BASE_PRICE,
          gstAddon: customer.prGstAddon ? GST_ADDON_PRICE : 0,
          businessNameAddon: bnPrice,
          businessAddressAddon: customer.prBusinessAddressAddon ? ADDRESS_PRICE : 0,
          subtotal,
          gst,
          total,
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  // Build services list
  const servicesIncluded = [
    "ABN Registration with ATO",
    "Partnership TFN Application",
  ];
  if (customer.prPaygWithholding) servicesIncluded.push("PAYG Withholding Setup");
  if (customer.prGstAddon) servicesIncluded.push("GST Registration");
  if (customer.prBusinessNameAddon) servicesIncluded.push("Business Name Registration");
  if (customer.prBusinessAddressAddon) servicesIncluded.push("Business Address Service");

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
      <div className="content-card animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Review & Pay</h2>
        <p className="text-muted-foreground mt-1">One final step to complete your partnership registration</p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4 mb-6">
        {/* Partnership Details */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Partnership Details</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            {customer.prPartnershipName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partnership Name</span>
                <span className="font-medium text-foreground">{customer.prPartnershipName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium text-foreground">{customer.prStartDate || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Activity</span>
              <span className="font-medium text-foreground">
                {customer.prMainActivity === "other"
                  ? customer.prOtherActivity || "Other"
                  : customer.prMainActivity || "Not selected"}
              </span>
            </div>
            {customer.prStreetAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium text-foreground text-right">
                  {customer.prStreetAddress}, {customer.prCity} {customer.prState} {customer.prPostcode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Partners */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Partners ({partners.length})</h3>
          </div>
          <div className="ml-11 space-y-2 text-sm">
            {partners.map((p: any, i: number) => (
              <div key={p.id || i} className="flex justify-between">
                <span className="text-muted-foreground">{p.firstName} {p.lastName}</span>
                <span className="font-medium text-foreground">{p.percentageInterest || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Person */}
        {customer.prContactName && (
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Authorised Contact</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{customer.prContactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{customer.prContactEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{customer.prContactPhone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Services Included */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Services Included</h3>
          </div>
          <div className="ml-11">
            <ul className="space-y-2">
              {servicesIncluded.map((service, idx) => (
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
            <span className="text-foreground">{formatCurrency(BASE_PRICE)}</span>
          </div>
          {customer.prGstAddon && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST Registration</span>
              <span className="text-foreground">{formatCurrency(GST_ADDON_PRICE)}</span>
            </div>
          )}
          {customer.prBusinessNameAddon && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Name Registration</span>
              <span className="text-foreground">{formatCurrency(bnPrice)}</span>
            </div>
          )}
          {customer.prBusinessAddressAddon && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Address Service</span>
              <span className="text-foreground">{formatCurrency(ADDRESS_PRICE)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1">
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

      {/* Declarations */}
      {/* Declaration */}
      <div className="content-card mb-6">
        <p className="text-sm font-semibold mb-3">By proceeding with this order, I confirm that:</p>
        <ul className="space-y-2.5 text-sm list-disc list-inside text-muted-foreground">
          {DECLARATION_POINTS.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        <p className="text-sm italic text-muted-foreground mt-4">
          By typing my name below, I confirm I am authorised to act for the partnership and provide my legal electronic signature.
        </p>

        <div className="mt-4">
          <label className="form-label">Full Name (Electronic Signature) <span className="text-destructive">*</span></label>
          <input
            type="text"
            className="soft-input"
            placeholder="Type your full legal name"
            value={signature}
            onChange={(e) => updateCustomer({ prSignature: e.target.value })}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton
          onClick={handleSubmit}
          disabled={!allDeclared || isSubmitting}
          className="flex-1"
        >
          Complete & Pay {formatCurrency(total)}
        </PrimaryButton>
      </div>
    </div>
    </>
  );
};
