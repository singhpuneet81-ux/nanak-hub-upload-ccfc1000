import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { getTermById } from "@/config/terms.config";
import { getPackageById, getPlanById, getBracketById } from "@/config/plans.config";
import { formatCurrency } from "@/config/pricing.config";
import { Check, FileText, Calendar, Package, Users, CreditCard } from "lucide-react";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";

export const StepReviewPay: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    customer,
    selections,
    serviceName,
    serviceKey,
    totals,
    prevStep,
    getSubmissionPayload,
  } = useCheckout();

  const term = getTermById(selections.registrationTerm);
  const pkg = getPackageById(selections.package);
  const plan = getPlanById(selections.accountingPlan);
  const bracket = getBracketById(selections.revenueBracket);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: serviceKey,
        customer: { ...customer },
        selections: { ...selections },
        pricing: totals,
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  const reviewSections = [
    {
      icon: <FileText size={16} />,
      title: "Service",
      items: [
        { label: "Service", value: serviceName },
      ],
    },
    {
      icon: <Calendar size={16} />,
      title: "Registration Term",
      items: [
        { label: "Term", value: term?.label || "-" },
        { label: "ASIC Fee", value: formatCurrency(term?.asicFee || 0) },
      ],
    },
    {
      icon: <Package size={16} />,
      title: "Package",
      items: [
        { label: "Package", value: pkg?.name || "-" },
        ...(selections.package === "registration_plus_accounting" && plan
          ? [
              { label: "Revenue Bracket", value: bracket?.label || "-" },
              { label: "Billing", value: selections.billingFrequency === "annual" ? "Annual" : "Monthly" },
              { label: "Plan", value: plan.name },
            ]
          : []),
      ],
    },
    {
      icon: <Users size={16} />,
      title: "Payroll",
      items: [
        {
          label: "Payroll",
          value: selections.payrollEnabled
            ? `Yes - ${selections.staffCount} staff member${selections.staffCount > 1 ? "s" : ""}`
            : "No payroll needed",
        },
      ],
    },
  ];

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="content-card animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Review & Pay</h2>
      <p className="text-muted-foreground mb-6">
        Please review your order before proceeding to payment.
      </p>

      {/* Customer Summary */}
      <div className="p-5 bg-secondary rounded-xl mb-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText size={14} className="text-primary" />
          </div>
          Customer Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <span className="ml-2 font-medium text-foreground">{customer.firstName} {customer.lastName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <span className="ml-2 font-medium text-foreground">{customer.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>
            <span className="ml-2 font-medium text-foreground">{customer.phone}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Business Name:</span>
            <span className="ml-2 font-medium text-foreground">{customer.proposedBusinessName}</span>
          </div>
          {customer.abn && (
            <div>
              <span className="text-muted-foreground">ABN:</span>
              <span className="ml-2 font-medium text-foreground">{customer.abn}</span>
            </div>
          )}
          {customer.businessStructure && (
            <div>
              <span className="text-muted-foreground">Business Structure:</span>
              <span className="ml-2 font-medium text-foreground">{customer.businessStructure}</span>
            </div>
          )}
          {(customer.street || customer.suburb || customer.state || customer.postcode) && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Address:</span>
              <span className="ml-2 font-medium text-foreground">
                {[customer.street, customer.suburb, customer.state, customer.postcode].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {customer.businessActivity && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Business Activity:</span>
              <span className="ml-2 font-medium text-foreground">{customer.businessActivity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-3 mb-6">
        {reviewSections.map((section, index) => (
          <div key={index} className="p-4 border border-border rounded-xl">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {section.icon}
              </div>
              {section.title}
            </h4>
            <div className="space-y-2 ml-9">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 mb-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard size={16} className="text-primary" />
          Order Total
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Fee</span>
            <span className="text-foreground">{formatCurrency(totals.serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ASIC Fee</span>
            <span className="text-foreground">{formatCurrency(totals.asicFee)}</span>
          </div>
          {totals.accountingFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accounting</span>
              <span className="text-foreground">{formatCurrency(totals.accountingFee)}</span>
            </div>
          )}
          {totals.payrollFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payroll</span>
              <span className="text-foreground">{formatCurrency(totals.payrollFee)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (ex GST)</span>
              <span className="text-foreground">{formatCurrency(totals.subtotalExGst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (10%)</span>
              <span className="text-foreground">{formatCurrency(totals.gst)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-3 mt-2">
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total (inc GST)</span>
              <span className="font-bold text-foreground">{formatCurrency(totals.totalIncGst)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Declaration confirmation */}
      <div className="flex items-start gap-3 p-4 bg-[hsl(var(--success-light))] rounded-xl mb-6">
        <div className="w-6 h-6 rounded-full bg-[hsl(var(--success))] flex items-center justify-center shrink-0 mt-0.5">
          <Check size={14} className="text-white" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-foreground">Declaration Accepted</p>
          <p className="text-muted-foreground">
            Signed by {customer.signature}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
          Proceed to Payment
        </PrimaryButton>
      </div>
    </div>
    </>
  );
};
