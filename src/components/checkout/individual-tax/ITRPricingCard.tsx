import React, { useState } from "react";
import { Check, ArrowRight, User, Building2, Shield, Heart, Briefcase, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePricingPackages } from "@/hooks/usePricingPackages";

export const ITRPricingCard: React.FC = () => {
  const navigate = useNavigate();
  const { packages } = usePricingPackages();
  const [tab, setTab] = useState<"individual" | "entity">("individual");

  const INDIVIDUAL_SERVICES = [
    {
      id: "individual_tax_return",
      icon: User,
      iconBg: "bg-[hsl(210,90%,55%)]",
      title: "Individual Tax Return",
      description: "PAYG employees with simple tax affairs",
      price: `$${packages.individual_tax_return.foundation.price}`,
      cta: "View Details",
      route: "/individual-tax-return",
    },
    {
      id: "sole_trader_tax_return",
      icon: Briefcase,
      iconBg: "bg-[hsl(var(--cta))] disabled:opacity-50",
      title: "Sole Trader Tax Return",
      description: "Self-employed with ABN business income",
      price: `$${packages.sole_trader_tax_return.foundation.price}`,
      cta: "View Pricing",
      route: "/sole-trader-tax-return",
    },
  ];


/* ── Entity Services ── */
const ENTITY_SERVICES = [
  {
    id: "company",
    icon: Building2,
    iconBg: "bg-[hsl(260,60%,55%)]",
    title: "Company",
    description: "Pty Ltd company accounting and compliance",
    cta: "View Pricing",
    route: "/company-accounting",
  },
  {
    id: "trust",
    icon: Shield,
    iconBg: "bg-[hsl(280,50%,55%)]",
    title: "Trust",
    description: "Family Trust & Unit Trust accounting services",
    cta: "View Pricing",
    route: "/trust-accounting-landing",
  },
  {
    id: "smsf",
    icon: Users,
    iconBg: "bg-[hsl(160,60%,45%)]",
    title: "SMSF (Self-Managed Super Fund)",
    description: "Complete SMSF accounting and compliance",
    cta: "View Pricing",
    route: "/pricing?service=smsf",
  },
  {
    id: "charity_nfp",
    icon: Heart,
    iconBg: "bg-[hsl(340,70%,55%)]",
    title: "Charity & Not-for-Profit",
    description: "Specialized NFP accounting services",
    cta: "View Pricing",
    route: "/nfp-accounting",
  },
];

  const services = tab === "individual" ? INDIVIDUAL_SERVICES : ENTITY_SERVICES;
  const heading = tab === "individual" ? "Select Your Service Type" : "Select Your Entity Type";
  const subheading = tab === "individual"
    ? "Choose your service to view tailored pricing packages"
    : "Choose your business structure to view tailored pricing packages";

  return (
    <div className="py-12 px-4 bg-background">
      {/* Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            onClick={() => setTab("individual")}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
              ${tab === "individual"
                ? "bg-[hsl(var(--cta))] text-white shadow-md disabled:opacity-50"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <User className="w-4 h-4" />
            Individual Services
          </button>
          <button
            onClick={() => setTab("entity")}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
              ${tab === "entity"
                ? "bg-[hsl(var(--cta))] text-white shadow-md disabled:opacity-50"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Building2 className="w-4 h-4" />
            Entity Services
          </button>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{heading}</h2>
        <p className="text-muted-foreground mt-2">{subheading}</p>
      </div>

      {/* Cards Grid */}
      <div className={`mx-auto max-w-[1100px] grid gap-6 ${
        services.length <= 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      }`}>
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className="rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.iconBg} mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">{s.description}</p>

              {/* Price (if available) */}
              {(s as any).price && (
                <p className="text-2xl font-bold text-foreground mb-4">{(s as any).price}</p>
              )}

              {/* CTA Button */}
              <button
                onClick={() => {
                  const url = s.route;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="w-full h-12 bg-[hsl(var(--cta))] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {s.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
