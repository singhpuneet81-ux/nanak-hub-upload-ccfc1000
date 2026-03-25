import React from "react";
import { useSearchParams } from "react-router-dom";
import { CheckoutFlowProvider } from "@/context/CheckoutFlowProvider";
import { StepPricing } from "@/components/checkout/steps/StepPricing";
import { PricingServiceKey } from "@/config/pricing.config";
import { usePricingPackages } from "@/hooks/usePricingPackages";
import { CharityPricingCards } from "@/components/checkout/charity-setup/CharityPricingCards";
import { ASICPricingCard } from "@/components/checkout/asic-agent/ASICPricingCard";
import { CAPricingCard } from "@/components/checkout/company-accounting/CAPricingCard";
import { NFPPricingCard } from "@/components/checkout/nfp-accounting/NFPPricingCard";
import { TAPricingCard } from "@/components/checkout/trust-accounting/TAPricingCard";
import { SMAPricingCard } from "@/components/checkout/smsf-accounting/SMAPricingCard";
import { PTPricingCard } from "@/components/checkout/partnership-tax/PTPricingCard";

type CustomLanding = "asic_agent" | "company_accounting" | "nfp_accounting" | "trust_accounting" | "smsf_accounting" | "partnership_tax";

const SLUG_TO_SERVICE: Record<string, { serviceKey: PricingServiceKey; serviceId: string } | CustomLanding> = {
  abn: { serviceKey: "abn", serviceId: "abn-registration" },
  business_name: { serviceKey: "business_name", serviceId: "business-name-registration" },
  family_trust: { serviceKey: "family_trust", serviceId: "family-trust-setup" },
  gst: { serviceKey: "gst", serviceId: "gst-registration" },
  charity: { serviceKey: "charity", serviceId: "charity-setup" },
  charity_setup: { serviceKey: "charity", serviceId: "charity-setup" },
  company: { serviceKey: "company", serviceId: "register-a-company" },
  smsf: { serviceKey: "smsf", serviceId: "smsf-setup" },
  partnership: { serviceKey: "partnership", serviceId: "partnership-registration" },
  unit_trust: { serviceKey: "unit_trust", serviceId: "unit-trust-setup" },
  bare_trust: { serviceKey: "bare_trust", serviceId: "bare-trust-setup" },
  asic_agent: "asic_agent",
  company_accounting: "company_accounting",
  nfp_accounting: "nfp_accounting",
  trust_accounting: "trust_accounting",
  smsf_accounting: "smsf_accounting",
  partnership_tax: "partnership_tax",
};

const PricingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { displayNames } = usePricingPackages();
  const service = searchParams.get("service") || "abn";
  const entry = SLUG_TO_SERVICE[service] || SLUG_TO_SERVICE.abn;

  // Custom landing pages
  if (entry === "asic_agent") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">○ Simple, Transparent Pricing</p>
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete ASIC Compliance Management</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            One simple annual fee covers all your ASIC compliance needs. No hidden fees, no surprises—just professional service you can trust.
          </p>
        </div>
        <ASICPricingCard />
      </div>
    );
  }

  if (entry === "nfp_accounting") {
    window.location.href = "/nfp-accounting";
    return null;
  }

  if (entry === "company_accounting") {
    // Redirect to the checkout page directly
    window.location.href = "/company-accounting";
    return null;
  }

  if (entry === "trust_accounting") {
    window.location.href = "/trust-accounting";
    return null;
  }

  if (entry === "smsf_accounting") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">○ Flexible, Transparent Pricing</p>
          <h1 className="text-3xl font-bold text-foreground mb-2">SMSF Accounting & Compliance</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Specialist SMSF accounting with annual tax returns, financial statements, and audit coordination. Prorated pricing available.
          </p>
        </div>
        <SMAPricingCard />
      </div>
    );
  }

  if (entry === "partnership_tax") {
    window.location.href = "/partnership-tax";
    return null;
  }

  const resolved = entry as { serviceKey: PricingServiceKey; serviceId: string };
  const isCharity = resolved.serviceKey === "charity";

  const handleCharitySelect = (structure: "incorporated_association" | "company_limited_guarantee") => {
    const baseUrl = window.location.origin;
    window.open(
      `${baseUrl}/charity-setup?structure=${structure === "incorporated_association" ? "ia" : "clg"}&step=1`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <CheckoutFlowProvider
      initialServiceId={resolved.serviceId}
      initialCategoryId="setups-registrations"
    >
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {isCharity ? "Charity & Not-for-Profit Setup" : displayNames[resolved.serviceKey]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isCharity ? "Choose your charity structure to get started" : "Choose your package to get started"}
          </p>
        </div>
        {isCharity ? (
          <CharityPricingCards onSelectStructure={handleCharitySelect} />
        ) : (
          <StepPricing />
        )}
      </div>
    </CheckoutFlowProvider>
  );
};

export default PricingPage;
