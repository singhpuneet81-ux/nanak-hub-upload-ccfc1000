import React from "react";
import { useSearchParams } from "react-router-dom";
import { CheckoutPage } from "./CheckoutPage";
import { GSTCheckoutPage } from "./GSTCheckoutpage";
import ABNCheckoutPage from "./ABNCheckoutPage";
import BusinessNameCheckoutPage from "./BusinessNameCheckoutPage";
import { FamilyTrustCheckoutPage } from "./FamilyTrustCheckoutPage";
import { CharitySetupCheckoutPage } from "./CharitySetupCheckoutPage";
import { UnitTrustCheckoutPage } from "./UnitTrustCheckoutPage";
import TFNCheckoutPage from "./TFNcheckoutPage";
import { PartnershipCheckoutPage } from "./PartnershipCheckoutPage";
import BareTrustCheckoutPage from "./BareTrustCheckoutPage";
import NDISCheckoutPage from "./NDISCheckoutPage";
import DGRCheckoutPage from "./DGRCheckoutPage";
import ServiceSelectionPage from "./ServiceSelectionPage";

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const service = searchParams.get("service");

  // Route based on ?service= query parameter
  switch (service) {
    case "gst":
      return <GSTCheckoutPage />;
    case "abn":
      return <ABNCheckoutPage />;
    case "business_name":
      return <BusinessNameCheckoutPage />;
    case "family_trust":
      return <FamilyTrustCheckoutPage />;
    case "charity":
      return <CharitySetupCheckoutPage />;
    case "charity_ia":
      return <CharitySetupCheckoutPage />;
    case "charity_clg":
      return <CharitySetupCheckoutPage />;
    case "unit_trust":
      return <UnitTrustCheckoutPage />;
    case "tfn":
      return <TFNCheckoutPage />;
    case "partnership":
      return <PartnershipCheckoutPage />;
    case "bare_trust":
      return <BareTrustCheckoutPage />;
    case "ndis":
      return <NDISCheckoutPage />;
    case "dgr":
      return <DGRCheckoutPage />;
    default:
      // No service param → show service selection landing
      return <ServiceSelectionPage />;
  }
};

export default Index;
