import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricingPackages, type PricingCategory, CATEGORY_LABELS } from "@/hooks/usePricingPackages";
import { formatCurrency, type PricingServiceKey } from "@/config/pricing.config";
import nanakLogo from "@/assets/logo-nanak.webp";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight,
  Building2,
  Calculator,
  Briefcase,
  CheckCircle2,
  Sparkles,
  FileText,
  Store,
  Users,
  Receipt,
  Heart,
  Landmark,
  Handshake,
  BarChart3,
  Shield,
  Package,
  Home,
  BookOpen,
} from "lucide-react";

const CATEGORY_ICONS: Record<PricingCategory, React.ReactNode> = {
  business_formation: <Building2 className="h-5 w-5" />,
  accounting_tax: <Calculator className="h-5 w-5" />,
  business_advisory: <BarChart3 className="h-5 w-5" />,
};

const CATEGORY_TAB_LABELS: Record<PricingCategory, string> = {
  business_formation: "Business Setup",
  accounting_tax: "Accounting & Tax",
  business_advisory: "Advisory Services",
};

const SERVICE_ICON_MAP: Partial<Record<PricingServiceKey, React.ReactNode>> = {
  abn: <FileText className="h-5 w-5 text-primary" />,
  business_name: <Store className="h-5 w-5 text-primary" />,
  family_trust: <Users className="h-5 w-5 text-primary" />,
  gst: <Receipt className="h-5 w-5 text-primary" />,
  charity: <Heart className="h-5 w-5 text-primary" />,
  company: <Building2 className="h-5 w-5 text-primary" />,
  smsf: <Landmark className="h-5 w-5 text-primary" />,
  partnership: <Handshake className="h-5 w-5 text-primary" />,
  unit_trust: <BarChart3 className="h-5 w-5 text-primary" />,
  bare_trust: <Shield className="h-5 w-5 text-primary" />,
  individual_tax_return: <Calculator className="h-5 w-5 text-primary" />,
  sole_trader_tax_return: <Briefcase className="h-5 w-5 text-primary" />,
  bundle_tax_return: <Package className="h-5 w-5 text-primary" />,
  tfn: <FileText className="h-5 w-5 text-primary" />,
  rental_properties: <Home className="h-5 w-5 text-primary" />,
  asic_agent: <FileText className="h-5 w-5 text-primary" />,
  company_accounting: <Landmark className="h-5 w-5 text-primary" />,
  trust_accounting: <BookOpen className="h-5 w-5 text-primary" />,
  nfp_accounting: <Heart className="h-5 w-5 text-primary" />,
  business_plan: <FileText className="h-5 w-5 text-primary" />,
  business_valuation: <BarChart3 className="h-5 w-5 text-primary" />,
  business_due_diligence: <Shield className="h-5 w-5 text-primary" />,
  business_wealth_structuring: <Sparkles className="h-5 w-5 text-primary" />,
  bookkeeping: <BookOpen className="h-5 w-5 text-primary" />,
  payroll_services: <Users className="h-5 w-5 text-primary" />,
};

const CATEGORY_DESCRIPTIONS: Record<PricingCategory, string> = {
  business_formation: "Register your business structure with full compliance support",
  accounting_tax: "Tax returns, BAS lodgement & ongoing accounting packages",
  business_advisory: "Strategic plans, valuations & due diligence reports",
};

const SERVICE_URLS: Partial<Record<PricingServiceKey, string>> = {
  abn: "/pricing?service=abn",
  business_name: "/pricing?service=business_name",
  family_trust: "/pricing?service=family_trust",
  gst: "/pricing?service=gst",
  charity: "/pricing?service=charity",
  charity_ia: "/charity-setup?structure=ia",
  charity_clg: "/charity-setup?structure=clg",
  company: "/pricing?service=company",
  smsf: "/pricing?service=smsf",
  partnership: "/pricing?service=partnership",
  unit_trust: "/pricing?service=unit_trust",
  bare_trust: "/pricing?service=bare_trust",
  individual_tax_return: "/individual-tax-return",
  sole_trader_tax_return: "/sole-trader-tax-return",
  bundle_tax_return: "/bundle-tax-return",
  tfn: "/tfn-registration",
  rental_properties: "/individual-tax-return",
  asic_agent: "/pricing?service=asic_agent",
  company_accounting: "/pricing?service=company_accounting",
  trust_accounting: "/trust-accounting",
  nfp_accounting: "/nfp-accounting",
  smsf_accounting: "/pricing?service=smsf_accounting",
  partnership_tax: "/partnership-tax",
  bookkeeping: "/bookkeeping",
  payroll_services: "/payroll-services",
  business_plan: "/business-plan",
  business_valuation: "/business-valuation-checkout",
  business_due_diligence: "/business-due-diligence",
  business_wealth_structuring: "/business-wealth-structuring",
};

const ORDERED_CATEGORIES: PricingCategory[] = ["business_formation", "accounting_tax", "business_advisory"];

const SERVICE_DESCRIPTIONS: Partial<Record<PricingServiceKey, string>> = {
  abn: "Fast-track registration services with same-day ABN and 48-hour company incorporation options",
  business_name: "Nationwide business name registration with trademark search and brand protection strategies",
  family_trust: "Comprehensive family trust establishment with asset protection and tax optimization structures",
  gst: "GST registration and compliance setup for Australian businesses",
  charity: "Charity and not-for-profit structure setup with ACNC registration support",
  charity_ia: "State-based incorporated association registration with compliant constitution template",
  charity_clg: "ASIC company limited by guarantee registration with company constitution and director setup",
  company: "Full company registration with ASIC lodgement, ABN, and TFN included",
  smsf: "Self-managed super fund setup with trust deed, ABN and TFN registration",
  partnership: "Partnership registration with ABN, TFN, and compliance documentation",
  unit_trust: "Unit trust establishment with trust deed, ABN and compliance setup",
  bare_trust: "Bare trust setup for SMSF property purchases with full documentation",
  individual_tax_return: "Personal tax return preparation and lodgement with maximum deductions",
  sole_trader_tax_return: "Sole trader tax return with ABN income, BAS and deduction management",
  bundle_tax_return: "Bundled tax return packages for multiple entities and structures",
  tfn: "Tax File Number application and registration for individuals and businesses",
  rental_properties: "Rental property tax return with depreciation and negative gearing optimisation",
  asic_agent: "Complete ASIC compliance management with annual review and document lodgement",
  company_accounting: "Ongoing company accounting with BAS, tax returns and financial statements",
  trust_accounting: "Trust accounting services for family trusts, unit trusts and discretionary trusts",
  nfp_accounting: "Not-for-profit accounting with ACNC compliance and annual reporting",
  smsf_accounting: "SMSF annual compliance with financial statements, tax return and audit coordination",
  partnership_tax: "Partnership tax return and ongoing accounting with BAS lodgement",
  bookkeeping: "Monthly bookkeeping, BAS preparation & QuickBooks Online — transaction-based pricing",
  payroll_services: "STP Phase 2 compliant payroll processing with 12% super, PAYG withholding & Payday Super ready",
  business_plan: "Professional business plans with financial projections and strategic analysis",
  business_valuation: "Independent business valuations for sale, acquisition or internal planning",
  business_due_diligence: "Comprehensive due diligence reports for business acquisitions",
  business_wealth_structuring: "Strategic wealth structuring and asset protection planning",
};

const ServiceCard: React.FC<{
  serviceKey: PricingServiceKey;
  label: string;
  price: number;
  features: string[];
}> = ({ serviceKey, label, price, features }) => {
  const url = SERVICE_URLS[serviceKey];
  const icon = SERVICE_ICON_MAP[serviceKey] || <Briefcase className="h-5 w-5 text-primary" />;
  const description = SERVICE_DESCRIPTIONS[serviceKey] || "";

  const handleClick = () => {
    if (!url) return;
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}${url}`, "_blank", "noopener,noreferrer");
  };

  const topFeatures = features.slice(0, 4);

  return (
    <div
      className="group relative cursor-pointer rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
      onClick={handleClick}
    >
      {/* Orange top strip */}
      <div className="h-[6px] w-full bg-[hsl(var(--cta))]" />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground leading-snug mb-2">{label}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>
        )}

        {/* Feature list */}
        {topFeatures.length > 0 && (
          <ul className="space-y-2.5 mb-5">
            {topFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--cta))] shrink-0 mt-0.5" />
                <span className="text-foreground font-medium">{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Divider + CTA */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">From {formatCurrency(Math.round(price))}</span>
            <div className="flex items-center gap-1 text-sm font-semibold text-[hsl(var(--cta))] group-hover:gap-2 transition-all duration-200">
              View packages
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceSelectionPage: React.FC = () => {
  const { packages, displayNames, categories, isLoading } = usePricingPackages();
  const [activeTab, setActiveTab] = useState<PricingCategory>("business_formation");
  const isMobile = useIsMobile();

  const HIDDEN_SERVICES: PricingServiceKey[] = ["bundle_tax_return"];

  const getServicesForCategory = (category: PricingCategory): PricingServiceKey[] => {
    return (Object.keys(categories) as PricingServiceKey[]).filter(
      (key) => categories[key] === category && key in packages && !HIDDEN_SERVICES.includes(key),
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-[45px] font-bold text-foreground mb-4 leading-tight">
            Build Your Business the <span className="text-[hsl(var(--cta))]">Right Way</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mt-2">
            From setup to ongoing complianc everything in one structured platform.
          </p>
        </div>

        {/* Category Selector — Dropdown on mobile, pills on desktop */}
        {isMobile ? (
          <div className="mb-6">
            <Select value={activeTab} onValueChange={(val) => setActiveTab(val as PricingCategory)}>
              <SelectTrigger className="w-full h-12 rounded-full border-2 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.07)] text-[hsl(var(--cta))] font-semibold text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDERED_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      {CATEGORY_ICONS[cat]}
                      <span>{CATEGORY_TAB_LABELS[cat]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2 text-center">{CATEGORY_DESCRIPTIONS[activeTab]}</p>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 px-1 py-1">
              {ORDERED_CATEGORIES.map((cat) => {
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`
                      flex items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl px-8 py-3.5 text-base font-semibold transition-all duration-300
                      ${
                        isActive
                          ? "bg-[hsl(var(--cta))] text-white shadow-lg"
                          : "border border-border bg-card text-[hsl(var(--cta))] hover:border-[hsl(var(--cta)/0.4)]"
                      }
                    `}
                  >
                    {CATEGORY_ICONS[cat]}
                    <span>{CATEGORY_TAB_LABELS[cat]}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{CATEGORY_DESCRIPTIONS[activeTab]}</p>
          </div>
        )}

        {/* Service Cards */}
        {(() => {
          const services = getServicesForCategory(activeTab);
          return isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No services available in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((key) => (
                <ServiceCard
                  key={key}
                  serviceKey={key}
                  label={displayNames[key] || key}
                  price={packages[key]?.foundation?.price ?? 0}
                  features={packages[key]?.foundation?.features ?? []}
                />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ServiceSelectionPage;
