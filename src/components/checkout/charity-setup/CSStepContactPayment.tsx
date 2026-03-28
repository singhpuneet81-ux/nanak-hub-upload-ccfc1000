import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, User, CreditCard, Lock, Shield } from "lucide-react";
import { validateEmail, validatePhone } from "@/utils/validation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/config/pricing.config";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { usePricingPackages } from "@/hooks/usePricingPackages";

interface CSStepContactPaymentProps {
  onBack: () => void;
}

export const CSStepContactPayment: React.FC<CSStepContactPaymentProps> = ({ onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const { packages } = usePricingPackages();

  const CHARITY_STRUCTURES: Record<string, { name: string; price: number }> = {
    incorporated_association: { name: "Incorporated Association", price: packages.charity_ia.foundation.price },
    company_limited_guarantee: { name: "Company Limited by Guarantee", price: packages.charity_clg.foundation.price },
    charitable_trust: { name: "Charitable Trust", price: packages.charity.foundation.price },
  };

  const [firstName, setFirstName] = useState((customer?.contactFirstName as string) || "");
  const [lastName, setLastName] = useState((customer?.contactLastName as string) || "");
  const [email, setEmail] = useState((customer?.contactEmail as string) || "");
  const [phone, setPhone] = useState((customer?.contactPhone as string) || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charityStructure = customer?.charityStructure as string | undefined;
  const structure = charityStructure ? CHARITY_STRUCTURES[charityStructure] : null;
  const total = structure?.price || 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    if (!cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    if (!expiry.trim()) newErrors.expiry = "Expiry date is required";
    if (!cvv.trim()) newErrors.cvv = "CVV is required";
    if (!agreeTerms) newErrors.terms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      updateCustomer({
        contactFirstName: firstName,
        contactLastName: lastName,
        contactEmail: email,
        contactPhone: phone,
      });

      const { submitCheckout } = await import("@/utils/submitCheckout");
      await submitCheckout({
        serviceKey: "charity",
        customer: { ...customer, contactFirstName: firstName, contactLastName: lastName, contactEmail: email, contactPhone: phone },
        selections: {},
        pricing: {
          structure: structure?.name || "Unknown",
          subtotal: total,
          gst: Math.round(total * 0.1),
          total: total + Math.round(total * 0.1),
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contact & Payment</h2>
        <p className="text-muted-foreground mt-1">Final step - provide contact details and payment</p>
      </div>

      {/* Primary Contact Person */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Primary Contact Person</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              First Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Last Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone <span className="text-destructive">*</span>
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="04XX XXX XXX"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Payment Information</h3>
        </div>

        <div className="bg-foreground rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-background/60">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 10v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v2zm-2 0H4v6h16v-6z"/>
              </svg>
            </div>
            <span className="text-xs text-background/60 font-medium">SECURE PAYMENT</span>
          </div>

          <div>
            <Input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Card Number"
              className={`bg-foreground border-background/20 text-background placeholder:text-background/40 ${errors.cardNumber ? "border-destructive" : ""}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className={`bg-foreground border-background/20 text-background placeholder:text-background/40 ${errors.expiry ? "border-destructive" : ""}`}
            />
            <Input
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="CVV"
              maxLength={4}
              className={`bg-foreground border-background/20 text-background placeholder:text-background/40 ${errors.cvv ? "border-destructive" : ""}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          <Lock size={14} />
          <span>Secured by 256-bit SSL encryption. Your payment information is safe.</span>
        </div>
      </div>

      {/* Terms agreement */}
      <div className={`border rounded-lg p-4 ${errors.terms ? "border-destructive" : "border-border"}`}>
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={agreeTerms} 
            onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
          />
          <p className="text-sm text-muted-foreground">
            I agree to the terms and conditions, and authorize Nanak Accountants & Associates to register this charitable organization with ACNC and relevant authorities.
          </p>
        </div>
        {errors.terms && <p className="text-destructive text-sm mt-2">{errors.terms}</p>}
      </div>

      {/* Navigation */}
      <div className="checkout-nav hidden md:flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Shield size={18} />
          Complete Registration
        </button>
      </div>
    </div>
    </>
  );
};
