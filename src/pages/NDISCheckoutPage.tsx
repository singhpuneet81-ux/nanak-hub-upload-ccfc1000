import React, { useState } from "react";
import { SoftInput, SoftSelect, SoftTextarea } from "@/components/checkout/FormInputs";
import { User, Briefcase, Mail, Phone, Info, Send } from "lucide-react";
import { validateEmail, validatePhone, validateABNOptional } from "@/utils/validation";

const registrationGroupOptions = [
  { value: "", label: "Select registration group" },
  { value: "support-coordination", label: "Support Coordination" },
  { value: "therapeutic-supports", label: "Therapeutic Supports (OT, Physio, Speech)" },
  { value: "community-participation", label: "Community Participation" },
  { value: "daily-living", label: "Daily Living Assistance" },
  { value: "transport", label: "Transport Services" },
  { value: "plan-management", label: "Plan Management" },
  { value: "accommodation", label: "Specialist Disability Accommodation" },
  { value: "behaviour-support", label: "Behavior Support" },
  { value: "exercise-physiology", label: "Exercise Physiology" },
  { value: "psychology-counselling", label: "Psychology & Counseling" },
  { value: "home-modifications", label: "Home Modifications" },
  { value: "assistive-technology", label: "Assistive Technology" },
  { value: "registered-nursing", label: "Registered Nursing" },
  { value: "multiple-groups", label: "Multiple Groups" },
  { value: "not-sure-yet", label: "Not Sure Yet" },
];

const currentStatusOptions = [
  { value: "", label: "Select your current status" },
  { value: "just-starting", label: "Just Starting – no business yet" },
  { value: "have-abn", label: "Have ABN but not NDIS registered" },
  { value: "currently-applying", label: "Currently applying for NDIS registration" },
  { value: "need-help", label: "Need help with existing registration" },
  { value: "other", label: "Other" },
];

const NDISCheckoutPage: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    businessName: "", abn: "", registrationGroup: "", currentStatus: "", goals: "",
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
      const err = validateABNOptional(v);
      setErrors((prev) => err ? { ...prev, abn: err } : (() => { const n = { ...prev }; delete n.abn; return n; })());
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    const emailErr = validateEmail(form.email); if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(form.phone); if (phoneErr) e.phone = phoneErr;
    const abnErr = validateABNOptional(form.abn); if (abnErr) e.abn = abnErr;
    if (!form.registrationGroup) e.registrationGroup = "Required";
    if (!form.currentStatus) e.currentStatus = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <img src="/favicon.webp" alt="Nanak Accountants" className="w-10 h-10 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Request an NDIS Setup Consultation
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete this form and our NDIS specialists will assess your needs and provide a tailored setup plan
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-[var(--shadow-card)] p-6 space-y-6">
          {/* Your Information Section */}
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

            <SoftInput
              label="Email Address" required type="email" placeholder="john@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email}
            />

            <SoftInput
              label="Phone Number" required type="tel" placeholder="0400 000 000"
              icon={<Phone className="w-4 h-4" />}
              value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone}
            />
          </div>

          {/* Business Details Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Business Details</h2>
            </div>

            <SoftInput label="Business Name (if applicable)" placeholder="Your Business Name"
              value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />

            <SoftInput label="ABN (if you have one)" placeholder="Your ABN"
              value={form.abn} onChange={(e) => set("abn", e.target.value)} error={errors.abn} />

            <SoftSelect
              label="Registration Groups Interested In" required options={registrationGroupOptions}
              value={form.registrationGroup} onChange={(e) => set("registrationGroup", e.target.value)}
              error={errors.registrationGroup}
            />

            <SoftSelect
              label="Current Status" required options={currentStatusOptions}
              value={form.currentStatus} onChange={(e) => set("currentStatus", e.target.value)}
              error={errors.currentStatus}
            />

            <SoftTextarea
              label="Tell us about your NDIS goals (optional)"
              placeholder="Describe your services and NDIS business goals..."
              rows={4}
              value={form.goals} onChange={(e) => set("goals", e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-3">
            <button
              className="btn-cta w-full"
              onClick={async () => {
                if (!validate()) return;
                const { submitCheckout } = await import("@/utils/submitCheckout");
                await submitCheckout({
                  serviceKey: "ndis",
                  customer: form,
                  selections: {},
                  pricing: { subtotal: 0, gst: 0, total: 0, note: "Free consultation – pricing discussed after contact" },
                });
              }}
            >
              <Send className="w-4 h-4" />
              Submit NDIS Inquiry →
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Our NDIS specialists will contact you within 24-48 business hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NDISCheckoutPage;
