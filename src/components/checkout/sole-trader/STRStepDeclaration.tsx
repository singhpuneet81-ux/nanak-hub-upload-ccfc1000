import React, { useState, useRef } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { CheckCircle2, Upload, X, FileText } from "lucide-react";
import { useSoleTraderPricing } from "@/hooks/useSoleTraderPricing";

export const STRStepDeclaration: React.FC = () => {
  const { customer, updateCustomer, prevStep } = useCheckout();
  const { cfg } = useSoleTraderPricing();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plan = customer.strPlan || "premium";
  const dynamicPrice = plan === "essential" ? customer.strEssentialPrice : customer.strPremiumPrice;
  const price = dynamicPrice || 149;

  const handleDeclarationChange = (accepted: boolean) => {
    updateCustomer({ declarationAccepted: accepted });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setIdFile(file);
  };

  const removeFile = () => {
    setIdFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isValid = () => customer.declarationAccepted === true && idFile !== null;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      const gst = Math.round(price / 11);
      await submitCheckout({
        serviceKey: "sole_trader_tax_return",
        customer: { ...customer, idProofFileName: idFile?.name },
        selections: { package: customer.strPlan || "premium" },
        pricing: { subtotal: price, gst, total: price },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
      <div className="content-card animate-fade-in">
        {/* ID Proof Upload */}
        <div className="mb-6">
          <h3 className="font-bold text-foreground mb-2">Upload ID Proof<span className="text-destructive"> *</span></h3>
          <p className="text-sm text-muted-foreground mb-3">Upload a valid photo ID (Driver's Licence, Passport, or Medicare Card)</p>
          {idFile ? (
            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-card">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{idFile.name}</p><p className="text-xs text-muted-foreground">{(idFile.size / 1024).toFixed(0)} KB</p></div>
              <button type="button" onClick={removeFile} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl px-6 py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              <Upload className="w-8 h-8" /><span className="text-sm font-medium">Click to upload your ID</span><span className="text-xs">PDF, JPG, PNG up to 10MB</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
        </div>

        {/* What Happens Next */}
        <div className="mb-6">
          <h3 className="font-bold text-foreground mb-4">What Happens Next</h3>
          <div className="space-y-3">
            {cfg.whatHappensNext.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                <div><p className="text-sm font-semibold text-foreground">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Declaration Checkbox */}
        <div className="border border-border rounded-xl p-5 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={customer.declarationAccepted || false} onChange={(e) => handleDeclarationChange(e.target.checked)} className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="font-medium text-foreground mb-2">I declare that:</p>
              <ul className="space-y-1.5">
                {cfg.declarations.map((d, i) => (<li key={i} className="text-sm text-muted-foreground">• {d}</li>))}
              </ul>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pb-6">
          <BackButton onClick={prevStep} className="w-full sm:w-32" />
          <PrimaryButton onClick={handleSubmit} disabled={!isValid() || isSubmitting} className="w-full sm:flex-1 h-14 sm:h-12 text-base sm:text-sm">
            <CheckCircle2 className="w-5 h-5 sm:w-4 sm:h-4 mr-1" />Proceed to payment
          </PrimaryButton>
        </div>
      </div>
    </>
  );
};
