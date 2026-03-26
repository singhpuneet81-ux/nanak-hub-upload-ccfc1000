import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ABNCheckoutPage from "./pages/ABNCheckoutPage";
import BusinessNameCheckoutPage from "./pages/BusinessNameCheckoutPage";
import { FamilyTrustCheckoutPage } from "./pages/FamilyTrustCheckoutPage";
import { CharitySetupCheckoutPage } from "./pages/CharitySetupCheckoutPage";
import { UnitTrustCheckoutPage } from "./pages/UnitTrustCheckoutPage";
import TFNStepRequestAssistance from "./pages/TFNcheckoutPage";
import TFNCheckoutPage from "./pages/TFNcheckoutPage";
import GSTCheckoutPage from "./pages/GSTCheckoutpage";
import PricingPage from "./pages/PricingPage";
import { CompanyRegistrationCheckoutPage } from "./pages/CompanyRegistrationCheckoutPage";
import { SMSFCheckoutPage } from "./pages/SMSFCheckoutPage";
import { BareTrustCheckoutPage } from "./pages/BareTrustCheckoutPage";
import { PartnershipCheckoutPage } from "./pages/PartnershipCheckoutPage";
import NDISCheckoutPage from "./pages/NDISCheckoutPage";
import DGRCheckoutPage from "./pages/DGRCheckoutPage";
import ASICAgentCheckoutPage from "./pages/ASICAgentCheckoutPage";
import ASICAgentLandingPage from "./pages/ASICAgentLandingPage";
import CompanyAccountingCheckoutPage from "./pages/CompanyAccountingCheckoutPage";
import NFPAccountingCheckoutPage from "./pages/NFPAccountingCheckoutPage";
import TaxCalculatorPage from "./pages/TaxCalculatorPage";
import BusinessPlanCalculatorPage from "./pages/BusinessPlanCalculatorPage";
import BusinessPlanCheckoutPage from "./pages/BusinessPlanCheckoutPage";
import BusinessTaxPlanningPage from "./pages/BusinessTaxPlanningPage";
import BusinessValuationPage from "./pages/BusinessValuationPage";
import BusinessValuationCheckoutPage from "./pages/BusinessValuationCheckoutPage";
import BusinessWealthStructuringPage from "./pages/BusinessWealthStructuringPage";
import BusinessHealthStructuringPage from "./pages/BusinessHealthStructuringPage";
import BuyingBusinessPage from "./pages/BuyingBusinessPage";
import BusinessDueDiligencePage from "./pages/BusinessDueDiligencePage";
import StampDutyCalculatorPage from "./pages/StampDutyCalculatorPage";
import GSTCalculatorPage from "./pages/GSTCalculatorPage";
import BundleCheckoutPage from "./pages/BundleCheckoutPage";
import TrustAccountingCheckoutPage from "./pages/TrustAccountingCheckoutPage";
import TrustAccountingLandingPage from "./pages/TrustAccountingLandingPage";
import SMSFAccountingCheckoutPage from "./pages/SMSFAccountingCheckoutPage";
import PartnershipTaxCheckoutPage from "./pages/PartnershipTaxCheckoutPage";
import IndividualTaxReturnCheckoutPage from "./pages/IndividualTaxReturnCheckoutPage";
import SoleTraderCheckoutPage from "./pages/SoleTraderCheckoutPage";
import BookkeepingCheckoutPage from "./pages/BookkeepingCheckoutPage";
import PayrollServicesCheckoutPage from "./pages/PayrollServicesCheckoutPage";
import ServiceSelectionPage from "./pages/ServiceSelectionPage";
import PaymentCancelled from "./pages/PaymentCancelled";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import CareersPage from "./pages/CareersPage";
import JobApplicationPage from "./components/careers/JobApplicationPage";
import WebinarPage from "./pages/WebinarPage";
import { useIframeResize } from "./hooks/useIframeResize";
import { usePageMeta } from "./hooks/usePageMeta";


const queryClient = new QueryClient();

const AppHooks = () => { useIframeResize(); usePageMeta(); return null; };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <BrowserRouter>
        <AppHooks />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/abn-registration" element={<ABNCheckoutPage />} />
          <Route path="/business-name-registration" element={<BusinessNameCheckoutPage />} />
          <Route path="/family-trust-setup" element={<FamilyTrustCheckoutPage />} />
          <Route path="/gst-registration" element={<GSTCheckoutPage />} />
          <Route path="/charity-setup" element={<CharitySetupCheckoutPage />} />
          <Route path="/unit-trust-setup" element={<UnitTrustCheckoutPage />} />  
          <Route path="/tfn-registration" element={<TFNCheckoutPage />} />
          <Route path="/company-registration" element={<CompanyRegistrationCheckoutPage />} />
          <Route path="/smsf-setup" element={<SMSFCheckoutPage />} />
          <Route path="/bare-trust-setup" element={<BareTrustCheckoutPage />} />
          <Route path="/partnership-registration" element={<PartnershipCheckoutPage />} />
          <Route path="/ndis-business-setup" element={<NDISCheckoutPage />} />
          <Route path="/dgr-registration" element={<DGRCheckoutPage />} />
          <Route path="/asic-agent-services" element={<ASICAgentCheckoutPage />} />
          <Route path="/asic-agent-landing" element={<ASICAgentLandingPage />} />
          <Route path="/company-accounting" element={<CompanyAccountingCheckoutPage />} />
          <Route path="/nfp-accounting" element={<NFPAccountingCheckoutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/tax-calculator" element={<TaxCalculatorPage />} />
          <Route path="/business-plan-calculator" element={<BusinessPlanCalculatorPage />} />
          <Route path="/business-plan" element={<BusinessPlanCheckoutPage />} />
          <Route path="/business-tax-planning" element={<BusinessTaxPlanningPage />} />
          <Route path="/business-valuation" element={<BusinessValuationPage />} />
          <Route path="/business-valuation-checkout" element={<BusinessValuationCheckoutPage />} />
          <Route path="/business-wealth-structuring" element={<BusinessWealthStructuringPage />} />
          <Route path="/business-health-structuring" element={<BusinessHealthStructuringPage />} />
          <Route path="/buying-a-business" element={<BuyingBusinessPage />} />
          <Route path="/business-due-diligence" element={<BusinessDueDiligencePage />} />
          <Route path="/stamp-duty-calculator" element={<StampDutyCalculatorPage />} />
          <Route path="/gst-calculator" element={<GSTCalculatorPage />} />
          <Route path="/trust-accounting" element={<TrustAccountingCheckoutPage />} />
          <Route path="/trust-accounting-landing" element={<TrustAccountingLandingPage />} />
          <Route path="/smsf-accounting" element={<SMSFAccountingCheckoutPage />} />
          <Route path="/partnership-tax" element={<PartnershipTaxCheckoutPage />} />
          <Route path="/individual-tax-return" element={<IndividualTaxReturnCheckoutPage />} />
          <Route path="/sole-trader-tax-return" element={<SoleTraderCheckoutPage />} />
          <Route path="/bookkeeping" element={<BookkeepingCheckoutPage />} />
          <Route path="/payroll-services" element={<PayrollServicesCheckoutPage />} />
          <Route path="/service-selection" element={<ServiceSelectionPage />} />
          <Route path="/bundle-tax-return" element={<BundleCheckoutPage />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/apply" element={<JobApplicationPage />} />
          <Route path="/webinars" element={<WebinarPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
