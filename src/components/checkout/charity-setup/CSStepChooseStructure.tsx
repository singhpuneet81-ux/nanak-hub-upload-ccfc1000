import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowRight, Users, Building2, Shield, Clock, CheckCircle, Info } from "lucide-react";
import { formatCurrency } from "@/config/pricing.config";
import { usePricingPackages } from "@/hooks/usePricingPackages";

interface StructureOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  suitableFor: string;
  setupTime: string;
  features: string[];
}

interface CSStepChooseStructureProps {
  onNext: () => void;
}

export const CSStepChooseStructure: React.FC<CSStepChooseStructureProps> = ({ onNext }) => {
  const { customer, updateCustomer } = useCheckout();
  const { packages } = usePricingPackages();
  const [selectedStructure, setSelectedStructure] = useState<string>((customer?.charityStructure as string) || "");
  const [error, setError] = useState("");

  // Dynamic prices from API
  const structures: StructureOption[] = [
    {
      id: "incorporated_association",
      name: "Incorporated Association",
      description: "Member-based organization for community groups",
      price: packages.charity_ia.foundation.price,
      icon: <Users size={20} />,
      suitableFor: "Community groups, clubs, local charities",
      setupTime: "3-5 days setup",
      features: [
        "Ideal for community clubs, sports groups, cultural organizations",
        "Minimum 5 committee members required",
        "Governed by state/territory associations law",
        "Members have voting rights",
        "Annual reporting to state regulator",
      ],
    },
    {
      id: "company_limited_guarantee",
      name: "Company Limited by Guarantee",
      description: "Corporate structure for larger charities",
      price: packages.charity_clg.foundation.price,
      icon: <Building2 size={20} />,
      suitableFor: "National charities, foundations, larger NFPs",
      setupTime: "5-7 weeks setup",
      features: [
        "Professional corporate governance structure",
        "Minimum 3 directors required",
        "Governed by ASIC and Corporations Act",
        "Members guarantee limited amounts (not shareholders)",
        "Suitable for national/large charities",
      ],
    },
    {
      id: "charitable_trust",
      name: "Charitable Trust",
      description: "Trust structure for asset protection and grants",
      price: packages.charity.foundation.price,
      icon: <Shield size={20} />,
      suitableFor: "Family foundations, grant-making charities, PAFs",
      setupTime: "6-8 weeks setup",
      features: [
        "Assets held in trust for charitable purposes",
        "Minimum 3 trustees required",
        "Strong asset protection",
        "Ideal for private ancillary funds (PAFs)",
        "Flexible distribution of funds",
      ],
    },
  ];

  const handleSelect = (structureId: string) => {
    setSelectedStructure(structureId);
    setError("");
    updateCustomer({ charityStructure: structureId });
  };

  const handleContinue = () => {
    if (!selectedStructure) {
      setError("Please select a charity structure to continue");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choose Charity Structure</h2>
        <p className="text-muted-foreground mt-1">Select the legal structure for your charitable organization</p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">All structures include:</p>
            <ul className="text-sm text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
              <li>ACNC charity registration</li>
              <li>ABN/TFN application</li>
              <li>GST-free & income tax exemption</li>
              <li>Constitution/Rules preparation</li>
              <li>Ongoing compliance support for 12 months</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Structure options */}
      <div className="space-y-4">
        {structures.map((structure) => {
          const isSelected = selectedStructure === structure.id;
          return (
            <div
              key={structure.id}
              onClick={() => handleSelect(structure.id)}
              className={`
                border rounded-xl p-5 cursor-pointer transition-all
                ${
                  isSelected
                    ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]"
                    : "border-border hover:border-muted-foreground/30"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? "bg-[hsl(var(--cta)/0.15)] text-[hsl(var(--cta))]" : "bg-muted text-muted-foreground"}
                  `}
                  >
                    {structure.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{structure.name}</h3>
                    <p className="text-sm text-muted-foreground">{structure.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users size={14} />
                        {structure.suitableFor}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} />
                        {structure.setupTime}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xl font-bold text-[hsl(var(--cta))]">{formatCurrency(structure.price)}</span>
              </div>

              {/* Expanded features when selected */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-[hsl(var(--cta)/0.2)]">
                  <ul className="space-y-2">
                    {structure.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={14} className="text-[hsl(var(--cta))] mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Continue button */}
      <div className="checkout-nav hidden md:flex justify-end pt-4">
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
