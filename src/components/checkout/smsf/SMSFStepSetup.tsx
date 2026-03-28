import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput } from "@/components/checkout/FormInputs";
import { Counter } from "@/components/checkout/Counter";
import { PrimaryButton } from "@/components/checkout/Buttons";
import { Mail, Phone, Building2, Users, Info, AlertTriangle, ExternalLink, Lock } from "lucide-react";

export const SMSFStepSetup: React.FC = () => {
  const { customer, updateCustomer, nextStep } = useCheckout();

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
  };

  const memberCount = customer.smsfMemberCount || 1;

  const isValid = () => {
    return (
      (customer.smsfEmail || "").trim() !== "" &&
      (customer.smsfPhone || "").trim() !== "" &&
      (customer.smsfFundName || "").trim() !== "" &&
      (customer.smsfTrusteeCompanyName || "").trim() !== ""
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Contact Information */}
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            <p className="text-sm text-muted-foreground">Where should we send updates about your SMSF?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput
            label="Email Address"
            required
            type="email"
            placeholder="your.email@example.com"
            value={customer.smsfEmail || ""}
            onChange={(e) => handleChange("smsfEmail", e.target.value)}
          />
          <SoftInput
            label="Phone Number"
            required
            type="tel"
            placeholder="04XX XXX XXX"
            value={customer.smsfPhone || ""}
            onChange={(e) => handleChange("smsfPhone", e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-4">
          <span>Primary contact for SMSF correspondence and ATO notifications</span>
          <span>For urgent queries during SMSF establishment</span>
        </p>
      </div>

      {/* SMSF Structure */}
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">SMSF Structure</h3>
            <p className="text-sm text-muted-foreground">Name your fund and trustee company</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <SoftInput
              label="Proposed SMSF Name"
              required
              placeholder="e.g., Smith Family Super Fund"
              value={customer.smsfFundName || ""}
              onChange={(e) => handleChange("smsfFundName", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your fund's official name (e.g., 'Smith Family Superannuation Fund'). Must end with 'Superannuation Fund', 'Super Fund', or 'SMSF'.
            </p>
          </div>

          <div>
            <SoftInput
              label="Proposed Trustee Company Name"
              required
              placeholder="e.g., Smith Super Pty Ltd"
              value={customer.smsfTrusteeCompanyName || ""}
              onChange={(e) => handleChange("smsfTrusteeCompanyName", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              The corporate trustee that will manage the SMSF (e.g., 'Smith Super Pty Ltd'). We'll register this company as part of the setup.
            </p>
          </div>
        </div>
      </div>

      {/* Number of Members */}
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Number of Members</h3>
            <p className="text-sm text-muted-foreground">How many members will be in this SMSF?</p>
          </div>
        </div>

        <div className="bg-[hsl(142_76%_94%)] border border-[hsl(142_71%_85%)] rounded-xl p-6">
          <Counter
            value={memberCount}
            onChange={(val) => handleChange("smsfMemberCount", val)}
            min={1}
            max={6}
            label="Member"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          SMSFs can have 1-6 members (ATO limit). Use the +/- buttons to adjust.
        </p>
      </div>

      {/* Before You Start */}
      <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Before You Start
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          We recommend reviewing the ATO's comprehensive guide on SMSFs to understand your obligations as a trustee:
        </p>
        <a
          href="https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/self-managed-super-funds-smsf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary font-medium hover:underline mt-2 inline-flex items-center gap-1"
        >
          View ATO SMSF Guide <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Important Disclaimer */}
      <div className="border-l-4 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-r-xl p-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[hsl(var(--cta))]" />
          Important Disclaimer
        </h4>
        <div className="text-sm text-muted-foreground mt-2 space-y-2">
          <p>
            We are a firm of accountants and not financial advisers. We do not provide any financial product advice or
            recommend that an SMSF is suitable for you.
          </p>
          <p>
            What we are providing you is an execution-only service, as you have instructed us to set up an SMSF. You should
            consider taking advice from an AFS Licensee before making a decision.
          </p>
        </div>
      </div>

      {/* Continue */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 hidden sm:flex">
          <Lock className="w-4 h-4" />
          Your information is encrypted and secure
        </p>
        <PrimaryButton onClick={nextStep} disabled={!isValid()} className="flex-1 sm:flex-none">
          Continue to Member 1 Details
        </PrimaryButton>
      </div>
    </div>
  );
};
