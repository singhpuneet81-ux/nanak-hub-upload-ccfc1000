import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { validateABN, validateEmail, validatePhone } from "@/utils/validation";

interface Props { onNext: () => void; onBack: () => void; }

export const TAStepTrustDetails: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const [trustName, setTrustName] = useState((customer.taTrustName as string) || "");
  const [abn, setAbn] = useState((customer.taABN as string) || "");
  const [trusteeName, setTrusteeName] = useState((customer.taTrusteeName as string) || "");
  const [fullName, setFullName] = useState((customer.taFullName as string) || "");
  const [email, setEmail] = useState((customer.taEmail as string) || "");
  const [phone, setPhone] = useState((customer.taPhone as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!trustName.trim()) e.trustName = "Trust name is required";
    const abnErr = validateABN(abn); if (abnErr) e.abn = abnErr;
    if (!trusteeName.trim()) e.trusteeName = "Trustee name is required";
    if (!fullName.trim()) e.fullName = "Full name is required";
    const emailErr = validateEmail(email); if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(phone); if (phoneErr) e.phone = phoneErr;
    setErrors(e); return Object.keys(e).length === 0;
  };


  const isFormValid = !!(trustName.trim() && trusteeName.trim() && fullName.trim() && abn.trim() && email.trim() && phone.trim());
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({ taTrustName: trustName, taABN: abn, taTrusteeName: trusteeName, taFullName: fullName, taEmail: email, taPhone: phone });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-foreground">Trust Details</h2><p className="text-muted-foreground mt-1">Tell us about your trust</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-foreground mb-1.5">Trust Name <span className="text-destructive">*</span></label><Input value={trustName} onChange={(e) => setTrustName(e.target.value)} placeholder="Smith Family Trust" className={errors.trustName ? "border-destructive" : ""} />{errors.trustName && <p className="text-destructive text-sm mt-1">{errors.trustName}</p>}</div>
        <div><label className="block text-sm font-medium text-foreground mb-1.5">ABN <span className="text-destructive">*</span></label><Input value={abn} onChange={(e) => setAbn(e.target.value)} placeholder="12 345 678 901" className={errors.abn ? "border-destructive" : ""} />{errors.abn && <p className="text-destructive text-sm mt-1">{errors.abn}</p>}</div>
      </div>
      <div><label className="block text-sm font-medium text-foreground mb-1.5">Trustee Name <span className="text-destructive">*</span></label><Input value={trusteeName} onChange={(e) => setTrusteeName(e.target.value)} placeholder="Smith Holdings Pty Ltd" className={errors.trusteeName ? "border-destructive" : ""} />{errors.trusteeName && <p className="text-destructive text-sm mt-1">{errors.trusteeName}</p>}</div>
      <div><h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1.5">Full Name <span className="text-destructive">*</span></label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" className={errors.fullName ? "border-destructive" : ""} />{errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-destructive">*</span></label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" type="email" className={errors.email ? "border-destructive" : ""} />{errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}</div>
            <div><label className="block text-sm font-medium text-foreground mb-1.5">Phone <span className="text-destructive">*</span></label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0400 000 000" className={errors.phone ? "border-destructive" : ""} />{errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}</div>
          </div>
        </div>
      </div>
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"><ArrowLeft size={18} /> Back</button>
        <button onClick={handleContinue} disabled={!isFormValid} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">Continue to Agent Nomination <ArrowRight size={18} /></button>
      </div>
    </div>
  );
};
