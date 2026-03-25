import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateEmail, validatePhone, validateABNOptional } from "@/utils/validation";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const NFPStepOrgDetails: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [orgName, setOrgName] = useState((customer.nfpOrgName as string) || "");
  const [state, setState] = useState((customer.nfpState as string) || "");
  const [incNumber, setIncNumber] = useState((customer.nfpIncNumber as string) || "");
  const [abn, setAbn] = useState((customer.nfpABN as string) || "");
  const [fullName, setFullName] = useState((customer.nfpFullName as string) || "");
  const [email, setEmail] = useState((customer.nfpEmail as string) || "");
  const [phone, setPhone] = useState((customer.nfpPhone as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!orgName.trim()) e.orgName = "Organization name is required";
    if (!state) e.state = "State is required";
    const abnErr = validateABNOptional(abn); if (abnErr) e.abn = abnErr;
    if (!fullName.trim()) e.fullName = "Full name is required";
    const emailErr = validateEmail(email); if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(phone); if (phoneErr) e.phone = phoneErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const isFormValid = !!(orgName.trim() && state && fullName.trim() && abn.trim() && email.trim() && phone.trim());
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      nfpOrgName: orgName,
      nfpState: state,
      nfpIncNumber: incNumber,
      nfpABN: abn,
      nfpFullName: fullName,
      nfpEmail: email,
      nfpPhone: phone,
    });
    onNext();
  };

  const handleAbnChange = (v: string) => {
    setAbn(v);
    const err = validateABNOptional(v);
    setErrors((prev) => err ? { ...prev, abn: err } : (() => { const n = { ...prev }; delete n.abn; return n; })());
  };

  const handleEmailChange = (v: string) => {
    setEmail(v);
    const err = validateEmail(v);
    setErrors((prev) => err ? { ...prev, email: err } : (() => { const n = { ...prev }; delete n.email; return n; })());
  };

  const handlePhoneChange = (v: string) => {
    setPhone(v);
    const err = validatePhone(v);
    setErrors((prev) => err ? { ...prev, phone: err } : (() => { const n = { ...prev }; delete n.phone; return n; })());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Organization Details</h2>
        <p className="text-muted-foreground mt-1">Tell us about your not-for-profit organization</p>
      </div>

      {/* Organization Info */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Organization Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="E.g., Westside Sports Club Inc"
          className={errors.orgName ? "border-destructive" : ""}
        />
        {errors.orgName && <p className="text-destructive text-sm mt-1">{errors.orgName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            State of Incorporation <span className="text-destructive">*</span>
          </label>
          <Select value={state} onValueChange={(v) => setState(v)}>
            <SelectTrigger className={errors.state ? "border-destructive" : ""}>
              <SelectValue placeholder="Select state..." />
            </SelectTrigger>
            <SelectContent>
              {AU_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Incorporation Number
          </label>
          <Input
            value={incNumber}
            onChange={(e) => setIncNumber(e.target.value)}
            placeholder="A00123458"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          ABN (if registered)
        </label>
        <Input
          value={abn}
          onChange={(e) => handleAbnChange(e.target.value)}
          placeholder="12 345 678 901"
          className={errors.abn ? "border-destructive" : ""}
        />
        {errors.abn && <p className="text-destructive text-sm mt-1">{errors.abn}</p>}
      </div>

      {/* Primary Contact */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Primary Contact</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="john@example.com"
                type="email"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number
              </label>
              <Input
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="04XX XXX XXX"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors sm:w-auto"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={handleContinue} disabled={!isFormValid}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
