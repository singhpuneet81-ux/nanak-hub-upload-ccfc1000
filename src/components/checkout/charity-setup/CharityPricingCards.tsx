import React from "react";
import { Check, Clock, Info, Users, Building2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePricingPackages } from "@/hooks/usePricingPackages";

interface CharityPricingCardsProps {
  onSelectStructure?: (structure: "incorporated_association" | "company_limited_guarantee") => void;
}

const IA_FEATURES = [
  "Ideal for community and member-based organisations",
  "Governed by state or territory associations legislation",
  "Member and committee requirements apply (varies by state)",
  "Members typically have voting rights",
  "Annual reporting to the relevant state regulator",
];

const CLG_FEATURES = [
  "Professional corporate governance structure",
  "Governed by ASIC and the Corporations Act",
  "Requires at least one director (best practice is three or more)",
  "Members provide a limited guarantee (no shareholders)",
  "Suitable for national or growing charities",
];

export const CharityPricingCards: React.FC<CharityPricingCardsProps> = ({ onSelectStructure }) => {
  const navigate = useNavigate();
  const { packages } = usePricingPackages();

  const IA_PRICE = packages.charity_ia.foundation.price;
  const CLG_PRICE = packages.charity_clg.foundation.price;

  const handleSelect = (structure: "incorporated_association" | "company_limited_guarantee") => {
    if (onSelectStructure) onSelectStructure(structure);
    const slug = structure === "incorporated_association" ? "ia" : "clg";
    navigate(`/charity-setup?structure=${slug}&step=1`);
  };

  return (
    <div className="py-10 px-4 bg-background">
      <div className="mx-auto max-w-[900px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Incorporated Association */}
          <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 pb-4">
              <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-lg font-bold rounded-lg mb-4">
                ${IA_PRICE.toLocaleString()}
              </span>

              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Incorporated Association</h3>
                  <p className="text-sm text-muted-foreground">Member-based organisation for community groups</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground mt-2">
                <Info className="w-3.5 h-3.5" />
                Best for: Community groups, clubs, local charities
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                <Clock className="w-3.5 h-3.5" />
                Est. setup time: 4–5 days
              </div>
            </div>

            <div className="px-6 pb-6 flex-grow flex flex-col">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wide">Key Features</p>
              <ul className="space-y-2 mb-6 flex-grow">
                {IA_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect("incorporated_association")}
                className="w-full h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:opacity-90 transition-opacity"
              >
                Register Now
              </button>
            </div>
          </div>

          {/* Company Limited by Guarantee — Recommended */}
          <div className="border-2 border-[hsl(24,95%,53%)] rounded-2xl bg-[hsl(24,95%,53%,0.04)] flex flex-col overflow-hidden relative">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[hsl(24,95%,53%)] text-white text-xs font-bold rounded-full">
                ⭐ Recommended
              </span>
            </div>

            <div className="p-6 pb-4">
              <span className="inline-block px-4 py-1.5 bg-[hsl(24,95%,53%)] text-white text-lg font-bold rounded-lg mb-4">
                ${CLG_PRICE.toLocaleString()}
              </span>

              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[hsl(24,95%,53%,0.1)] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[hsl(24,95%,53%)]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Company Limited by Guarantee</h3>
                  <p className="text-sm text-muted-foreground">Corporate structure for charities and not-for-profits</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(24,95%,53%,0.1)] rounded-full text-xs text-[hsl(24,95%,53%)] mt-2">
                <Info className="w-3.5 h-3.5" />
                Best for: National charities, foundations, larger NFPs
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                <Clock className="w-3.5 h-3.5" />
                Est. setup time: 4–5 days
              </div>
            </div>

            <div className="px-6 pb-6 flex-grow flex flex-col">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wide">Key Features</p>
              <ul className="space-y-2 mb-6 flex-grow">
                {CLG_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect("company_limited_guarantee")}
                className="w-full h-12 flex items-center justify-center bg-[hsl(24,95%,53%)] text-white rounded-2xl font-bold text-base hover:opacity-90 transition-opacity"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-8 border border-border rounded-2xl bg-card p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Important Information</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Legal documents</strong> (constitution or trust deed) are prepared by independent third-party lawyers.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Deductible Gift Recipient (DGR)</strong> endorsement is not included at this stage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
