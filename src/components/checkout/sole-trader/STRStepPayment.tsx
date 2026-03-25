import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput } from "@/components/checkout/FormInputs";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { Shield, Settings } from "lucide-react";

export const STRStepPayment: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const handleChange = (key: string, value: string) => {
    updateCustomer({ [key]: value });
  };

  const isValid = () => {
    const required = ["cardholderName", "cardNumber", "expiryDate", "cvv"];
    for (const key of required) {
      const value = customer[key];
      if (!value || (typeof value === "string" && value.trim() === "")) return false;
    }
    return true;
  };

  return (
    <div className="content-card animate-fade-in">
      {/* Step Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Settings className="w-3.5 h-3.5" />
          STEP 2 OF 3
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Payment Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Secure payment processing with 256-bit SSL encryption
        </p>
      </div>

      {/* Secure Payment Banner */}
      <div className="bg-[hsl(142_76%_94%)] border border-[hsl(142_71%_85%)] rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-[hsl(142_71%_35%)]" />
        <div>
          <p className="text-sm font-semibold text-[hsl(142_71%_35%)]">Secure Payment</p>
          <p className="text-xs text-[hsl(142_71%_45%)]">Your payment information is encrypted and secure</p>
        </div>
      </div>

      <div className="space-y-6">
        <SoftInput
          label="Cardholder Name"
          required
          placeholder="John Smith"
          value={customer.cardholderName || ""}
          onChange={(e) => handleChange("cardholderName", e.target.value)}
        />

        <SoftInput
          label="Card Number"
          required
          placeholder="1234 5678 9012 3456"
          value={customer.cardNumber || ""}
          onChange={(e) => handleChange("cardNumber", e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput
            label="Expiry Date"
            required
            placeholder="MM/YY"
            value={customer.expiryDate || ""}
            onChange={(e) => handleChange("expiryDate", e.target.value)}
          />
          <SoftInput
            label="CVV"
            required
            placeholder="123"
            value={customer.cvv || ""}
            onChange={(e) => handleChange("cvv", e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 mt-8">
          <BackButton onClick={prevStep} className="sm:w-32" />
          <PrimaryButton onClick={nextStep} disabled={!isValid()} className="flex-1">
            Continue
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
