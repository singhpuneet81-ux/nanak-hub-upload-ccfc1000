import React, { useState } from "react";
import { SoftInput, SoftSelect, SoftTextarea } from "@/components/checkout/FormInputs";
import { User, Globe, Mail, Phone, Info, Send } from "lucide-react";
import { validateEmail, validatePhone } from "@/utils/validation";

const residencyOptions = [
  { value: "", label: "Select your residency status" },
  { value: "australian-citizen", label: "Australian Citizen" },
  { value: "permanent-resident", label: "Permanent Resident" },
  { value: "temporary-visa-holder", label: "Temporary Visa Holder" },
  { value: "working-holiday-visa", label: "Working Holiday Visa (417/462)" },
  { value: "student-visa", label: "Student Visa (500)" },
  { value: "skilled-worker-visa", label: "Skilled Worker Visa (482/186/189)" },
  { value: "partner-visa", label: "Partner Visa (820/801)" },
  { value: "bridging-visa", label: "Bridging Visa" },
  { value: "new-zealand-citizen", label: "New Zealand Citizen" },
  { value: "other", label: "Other" },
];

const urgencyOptions = [
  { value: "", label: "Select urgency level" },
  { value: "standard", label: "Standard (28 days)" },
  { value: "urgent-starting-work", label: "Urgent – Starting work soon" },
  { value: "urgent-tax-return", label: "Urgent – Tax return deadline" },
  { value: "urgent-government-benefits", label: "Urgent – Government benefits" },
  { value: "not-urgent", label: "Not urgent" },
];

const TFNRequestAssistance: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dob: "",
    residencyStatus: "", visaDetails: "", urgency: "", additionalInfo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    const emailErr = validateEmail(form.email); if (emailErr) e.email = emailErr;
    const phoneErr = validatePhone(form.phone); if (phoneErr) e.phone = phoneErr;
    if (!form.dob.trim()) e.dob = "Required";
    if (!form.residencyStatus) e.residencyStatus = "Required";
    if (!form.urgency) e.urgency = "Required";
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
              Request TFN Application Assistance
            </h1>
            <p className="text-sm text-muted-foreground">
              We'll help you through the TFN application process and send you a secure application form
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-center gap-2 border border-border bg-secondary rounded-full px-4 py-2 mb-6 mx-auto w-fit">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            TFN applications must be lodged directly with the ATO — we provide expert guidance
          </p>
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

            <SoftInput
              label="Date of Birth" required type="text" placeholder="dd  mm  yyyy"
              value={form.dob} onChange={(e) => set("dob", e.target.value)} error={errors.dob}
            />
          </div>

          {/* Residency Status Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Residency Status</h2>
            </div>

            <SoftSelect
              label="Residency Status" required options={residencyOptions}
              value={form.residencyStatus} onChange={(e) => set("residencyStatus", e.target.value)}
              error={errors.residencyStatus}
            />

            <div className="space-y-1">
              <SoftInput
                label="Visa Type/Number (if applicable)" placeholder="e.g., Visa 482, Visa 500"
                value={form.visaDetails} onChange={(e) => set("visaDetails", e.target.value)}
              />
              <p className="text-xs text-muted-foreground pl-1">
                Temporary visa holders need to provide visa details for TFN applications
              </p>
            </div>

            <SoftSelect
              label="How Urgent Is Your TFN Application?" required options={urgencyOptions}
              value={form.urgency} onChange={(e) => set("urgency", e.target.value)}
              error={errors.urgency}
            />

            <SoftTextarea
              label="Additional Information (optional)"
              placeholder="Tell us about your situation or any questions you have..."
              rows={4}
              value={form.additionalInfo} onChange={(e) => set("additionalInfo", e.target.value)}
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
                  serviceKey: "tfn",
                  customer: form,
                  selections: {},
                  pricing: { subtotal: 0, gst: 0, total: 0, note: "Free consultation – pricing discussed after contact" },
                });
              }}
            >
              <Send className="w-4 h-4" />
              Request TFN Application Assistance →
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Our team will contact you within 24 business hours with a secure application form
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TFNRequestAssistance;
