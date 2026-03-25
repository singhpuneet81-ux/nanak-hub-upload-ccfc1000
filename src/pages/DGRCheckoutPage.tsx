import React, { useState } from "react";
import { SoftInput, SoftSelect, SoftTextarea } from "@/components/checkout/FormInputs";
import { User, Building2, Mail, Phone, Send } from "lucide-react";
import { validateEmail, validatePhone, validateABN } from "@/utils/validation";

const organizationTypeOptions = [
  { value: "", label: "Select organization type" },
  { value: "health-promotion", label: "Health Promotion Charity" },
  { value: "pbi", label: "Public Benevolent Institution (PBI)" },
  { value: "education", label: "Education Institution" },
  { value: "environmental", label: "Environmental Organization" },
  { value: "cultural", label: "Cultural Organization" },
  { value: "animal-welfare", label: "Animal Welfare" },
  { value: "overseas-aid", label: "Overseas Aid Fund" },
  { value: "research", label: "Research Institution" },
  { value: "community-service", label: "Community Service Organization" },
  { value: "indigenous", label: "Indigenous Advancement" },
  { value: "disaster-relief", label: "Disaster Relief" },
  { value: "heritage", label: "Heritage Conservation" },
  { value: "other", label: "Other" },
];

const acncStatusOptions = [
  { value: "", label: "Select ACNC status" },
  { value: "registered", label: "Already registered with ACNC" },
  { value: "in-progress", label: "Application in progress" },
  { value: "not-registered", label: "Not yet registered" },
  { value: "not-sure", label: "Not sure" },
];

const DGRCheckoutPage: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    orgName: "", abn: "", orgType: "", orgTypeOther: "", acncStatus: "", needs: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Inline validation on change
    if (k === "email") {
      const err = validateEmail(v);
      setErrors((prev) => err ? { ...prev, email: err } : (() => { const n = { ...prev }; delete n.email; return n; })());
    } else if (k === "phone") {
      const err = validatePhone(v);
      setErrors((prev) => err ? { ...prev, phone: err } : (() => { const n = { ...prev }; delete n.phone; return n; })());
    } else if (k === "abn") {
      const err = validateABN(v);
      setErrors((prev) => err ? { ...prev, abn: err } : (() => { const n = { ...prev }; delete n.abn; return n; })());
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    const emailErr = validateEmail(form.email); if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(form.phone); if (phoneErr) e.phone = phoneErr;
    if (!form.orgName.trim()) e.orgName = "Required";
    const abnErr = validateABN(form.abn); if (abnErr) e.abn = abnErr;
    if (!form.orgType) e.orgType = "Required";
    if (form.orgType === "other" && !form.orgTypeOther.trim()) e.orgTypeOther = "Required";
    if (!form.acncStatus) e.acncStatus = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-5">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-10 h-10 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Request a DGR Consultation
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete this form and our DGR specialists will assess your eligibility and provide a tailored quote
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-[var(--shadow-card)] p-6 space-y-6">
          {/* Your Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Your Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftInput label="First Name" required placeholder="John"
                value={form.firstName} onChange={(e) => set("firstName", e.target.value)} error={errors.firstName} />
              <SoftInput label="Last Name" required placeholder="Smith"
                value={form.lastName} onChange={(e) => set("lastName", e.target.value)} error={errors.lastName} />
            </div>
            <SoftInput label="Email Address" required type="email" placeholder="john@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
            <SoftInput label="Phone Number" required type="tel" placeholder="0400 000 000"
              icon={<Phone className="w-4 h-4" />}
              value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
          </div>

          {/* Organization Details */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Organization Details</h2>
            </div>
            <SoftInput label="Organization Name" required placeholder="Your Organization Name"
              value={form.orgName} onChange={(e) => set("orgName", e.target.value)} error={errors.orgName} />
            <SoftInput label="ABN" required placeholder="Your ABN (11 digits)"
              value={form.abn} onChange={(e) => set("abn", e.target.value)} error={errors.abn} />
            <SoftSelect label="Organization Type" required options={organizationTypeOptions}
              value={form.orgType} onChange={(e) => set("orgType", e.target.value)} error={errors.orgType} />
            {form.orgType === "other" && (
              <SoftInput label="Please specify your organization type" required placeholder="Enter your organization type"
                value={form.orgTypeOther} onChange={(e) => set("orgTypeOther", e.target.value)} error={errors.orgTypeOther} />
            )}
            <SoftSelect label="Current ACNC Registration Status" required options={acncStatusOptions}
              value={form.acncStatus} onChange={(e) => set("acncStatus", e.target.value)} error={errors.acncStatus} />
            <SoftTextarea label="Tell us about your DGR needs (optional)" placeholder="Describe your organization's activities and DGR goals..." rows={4}
              value={form.needs} onChange={(e) => set("needs", e.target.value)} />
          </div>

          {/* Submit */}
          <div className="pt-2 space-y-3">
            <button
              className="btn-cta w-full"
              onClick={async () => {
                if (!validate()) return;
                const { submitCheckout } = await import("@/utils/submitCheckout");
                await submitCheckout({
                  serviceKey: "dgr",
                  customer: form,
                  selections: {},
                  pricing: { subtotal: 0, gst: 0, total: 0, note: "Free consultation – pricing discussed after contact" },
                });
              }}
            >
              <Send className="w-4 h-4" />
              Submit DGR Inquiry →
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Our DGR specialists will contact you within 24-48 business hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DGRCheckoutPage;
