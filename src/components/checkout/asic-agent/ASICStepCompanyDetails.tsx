import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { validateABN, validateACN, validateEmail, validatePhone } from "@/utils/validation";

interface Props {
  onNext: () => void;
}

export const ASICStepCompanyDetails: React.FC<Props> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();

  const [companyName, setCompanyName] = useState((customer.asicCompanyName as string) || "");
  const [abn, setAbn] = useState((customer.asicABN as string) || "");
  const [acn, setAcn] = useState((customer.asicACN as string) || "");
  const [fullName, setFullName] = useState((customer.asicContactName as string) || "");
  const [email, setEmail] = useState((customer.asicContactEmail as string) || "");
  const [phone, setPhone] = useState((customer.asicContactPhone as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!companyName.trim()) e.companyName = "Company name is required";
    const abnErr = validateABN(abn); if (abnErr) e.abn = abnErr;
    const acnErr = validateACN(acn); if (acnErr) e.acn = acnErr;
    if (!fullName.trim()) e.fullName = "Full name is required";
    const emailErr = validateEmail(email); if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(phone); if (phoneErr) e.phone = phoneErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const isFormValid = !!(companyName.trim() && fullName.trim() && abn.trim() && acn.trim() && email.trim() && phone.trim());
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      asicCompanyName: companyName,
      asicABN: abn,
      asicACN: acn,
      asicContactName: fullName,
      asicContactEmail: email,
      asicContactPhone: phone,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company & Contact Details</h2>
        <p className="text-muted-foreground mt-1">Please provide your company and primary contact information</p>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Company Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., ABC Consulting Pty Ltd"
          className={errors.companyName ? "border-destructive" : ""}
        />
        {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName}</p>}
      </div>

      {/* ABN & ACN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Australian Business Number (ABN) <span className="text-destructive">*</span>
          </label>
          <Input
            value={abn}
            onChange={(e) => setAbn(e.target.value)}
            placeholder="11 digit ABN"
            className={errors.abn ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground mt-1">11 digits</p>
          {errors.abn && <p className="text-destructive text-sm mt-1">{errors.abn}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Australian Company Number (ACN) <span className="text-destructive">*</span>
          </label>
          <Input
            value={acn}
            onChange={(e) => setAcn(e.target.value)}
            placeholder="9 digit ACN"
            className={errors.acn ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground mt-1">9 digits from ASIC</p>
          {errors.acn && <p className="text-destructive text-sm mt-1">{errors.acn}</p>}
        </div>
      </div>

      {/* Primary Contact */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Primary Contact Person</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone Number <span className="text-destructive">*</span>
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

      {/* Continue */}
      <div className="checkout-nav flex justify-end pt-4">
        <button
          onClick={handleContinue} disabled={!isFormValid}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
