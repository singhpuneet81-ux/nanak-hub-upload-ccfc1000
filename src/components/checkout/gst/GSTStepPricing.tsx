import React from "react";
import { Check, ArrowRight, Zap } from "lucide-react";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const ORANGE = {
  base: "hsl(24 95% 53%)",
  light: "hsl(24 95% 96%)",
  border: "hsl(24 95% 70%)",
  text: "hsl(24 95% 45%)",
};

export const GSTStepPricing: React.FC = () => {
  const { packages, displayNames } = usePricingPackages();
  const serviceKey = "gst";
  const pricing = packages[serviceKey];
  const serviceDisplayName = displayNames[serviceKey];
  const foundationTitle = pricing?.foundation?.title ?? "Foundation Setup";
  const foundationCtaLabel = `Get ${foundationTitle}`;

  const handlePackageSelect = (
    packageType: "registration_only" | "registration_plus_accounting"
  ) => {
    const url = `/gst-registration?package=${packageType}`;
    window.open(url, "_blank");
  };

  return (
    <div className="py-10 px-4 bg-background">
      <div className="mx-auto max-w-[900px] grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= FOUNDATION SETUP ================= */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-foreground">{foundationTitle}</h3>
                <p className="text-xs text-muted-foreground">One-time only</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  ${pricing.foundation.price}
                </div>
                <div className="text-xs text-muted-foreground">one-time</div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="p-5 flex-grow flex flex-col">
            <ul className="space-y-2 mb-6 flex-grow">
              {pricing.foundation.features.map((feature, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-[hsl(160_60%_40%)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handlePackageSelect("registration_only")}
              className="w-full h-12 bg-[#1e3a5f] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold hover:bg-[#2a4a73] transition-colors"
            >
              {foundationCtaLabel}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              Setup only • No ongoing services
            </p>
          </div>
        </div>

        {/* ================= REGISTRATION + ACCOUNTING ================= */}
        <div
          className="rounded-xl flex flex-col overflow-hidden relative"
          style={{
            border: `2px solid ${ORANGE.base}`,
            backgroundColor: ORANGE.light,
          }}
        >
          {/* Recommended Badge */}
          <div className="absolute top-4 right-4">
            <span
              className="inline-block px-2.5 py-1 text-white text-[10px] font-bold uppercase rounded tracking-wide"
              style={{ backgroundColor: ORANGE.base }}
            >
              Recommended
            </span>
          </div>

          {/* Header */}
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${ORANGE.border}` }}>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: ORANGE.base }}
              >
                <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Registration + Accounting
                </h3>
                <p className="text-xs font-medium" style={{ color: ORANGE.base }}>
                  Build your custom package
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-grow flex flex-col">
            <p className="text-sm text-muted-foreground mb-5">
              Get everything in{" "}
              <strong className="text-foreground">{serviceDisplayName}</strong> plus complete ongoing
              accounting and compliance services tailored to your business.
            </p>

            {/* Key Benefits */}
            <ul className="space-y-2 mb-5">
              <li className="flex gap-2.5 text-sm font-medium text-foreground">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ORANGE.base }} />
                Customized to your revenue tier
              </li>
              <li className="flex gap-2.5 text-sm font-medium text-foreground">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ORANGE.base }} />
                Monthly or annual billing options
              </li>
            </ul>

            {/* Includes Section */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wide">
                Includes:
              </p>
              <ul className="space-y-2">
                {pricing.accounting.includes.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ORANGE.base }} />
                    {item}
                  </li>
                ))}
                <li className="text-sm font-semibold ml-6" style={{ color: ORANGE.base }}>
                  + {pricing.accounting.extraCount} more services
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handlePackageSelect("registration_plus_accounting")}
              className="w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2 mt-auto text-white bg-[hsl(var(--cta))] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              Build Your Package
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              Choose your business type, select revenue tier & get custom pricing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTStepPricing;
