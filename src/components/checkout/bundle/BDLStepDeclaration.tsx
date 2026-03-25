import React, { useState, useRef } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { PrimaryButton, BackButton } from "@/components/checkout/Buttons";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { ShieldAlert, Settings, CheckCircle2, Upload, X, FileText } from "lucide-react";

const DECLARATIONS = [
  "The information I have provided is true and correct",
  "I authorize Nanak Accountants to access my ATO records for all income streams",
  "I understand a registered accountant will prepare all 4 tax returns",
  "I will provide supporting documents when requested",
  "I agree to review and sign all draft returns before lodgement",
  "I have read and agree to the Terms of Service and Privacy Policy",
];

export const BDLStepDeclaration: React.FC = () => {
  const { customer, updateCustomer, prevStep } = useCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const streams: string[] = customer.bdlStreams || [];
  const total = customer.bdlTotal || 0;

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

  const isValid = () => customer.declarationAccepted === true;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { submitCheckout } = await import("@/utils/submitCheckout");
      const gst = customer.bdlGst || Math.round(total / 11);
      await submitCheckout({
        serviceKey: "bundled_tax_return",
        customer: { ...customer, idProofFileName: idFile?.name },
        selections: { streams, rentalCount: customer.bdlRentalCount },
        pricing: {
          subtotal: customer.bdlSubtotal || total,
          discount: customer.bdlDiscountAmount || 0,
          gst,
          total,
        },
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
      <div className="content-card animate-fade-in">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Settings className="w-3.5 h-3.5" />
            STEP 2 OF 2
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Declaration & Terms</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review your bundled package and agree to terms
          </p>
        </div>

        {/* Bundled Package Banner */}
        <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-[hsl(var(--cta))] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[hsl(var(--cta))]">Bundled Tax Return Package</p>
              <p className="text-xs text-[hsl(var(--cta)/0.8)] mt-1">
                One dedicated accountant will handle all {streams.length} income streams, ensuring cross-optimization and maximum tax savings across your entire financial situation.
              </p>
            </div>
          </div>
        </div>

        {/* ID Proof Upload */}
        <div className="mb-6">
          <h3 className="font-bold text-foreground mb-2">Upload ID Proof</h3>
          <p className="text-sm text-muted-foreground mb-3">Upload a valid photo ID (Driver's Licence, Passport, or Medicare Card)</p>
          {idFile ? (
            <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-card">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{idFile.name}</p>
                <p className="text-xs text-muted-foreground">{(idFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={removeFile} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl px-6 py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">Click to upload your ID</span>
              <span className="text-xs">PDF, JPG, PNG up to 10MB</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Declaration */}
        <div className="border border-border rounded-xl p-5 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={customer.declarationAccepted || false} onChange={(e) => handleDeclarationChange(e.target.checked)} className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary" />
            <div>
              <p className="font-medium text-foreground mb-2">I declare that:</p>
              <ul className="space-y-1.5">
                {DECLARATIONS.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                ))}
              </ul>
            </div>
          </label>
        </div>

        <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3">
          <BackButton onClick={prevStep} className="sm:w-32" />
          <PrimaryButton onClick={handleSubmit} disabled={!isValid() || isSubmitting} className="flex-1">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Complete Order
          </PrimaryButton>
        </div>
      </div>
    </>
  );
};
