import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const FEATURES = [
  "Annual ASIC Review Lodgement",
  "Company Statement Preparation",
  "Compliance Calendar Management",
  "Company Register Updates",
  "Unlimited Company Changes",
  "+ 5 More Services",
];

export const ASICPricingCard: React.FC = () => {
  const navigate = useNavigate();
  const { packages } = usePricingPackages();
  const price = packages.asic_agent.foundation.price;

  return (
    <div className="py-10 px-4">
      <div className="mx-auto max-w-[900px]">
        {/* Most Popular badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-block px-4 py-1.5 bg-[hsl(var(--cta))] text-white text-xs font-bold rounded-full uppercase tracking-wide disabled:opacity-50">
            Most Popular Choice
          </span>
        </div>

        {/* Card */}
        <div className="border-2 border-primary/20 rounded-2xl bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: Price */}
            <div className="p-6 md:p-8 md:w-[280px] border-b md:border-b-0 md:border-r border-border bg-primary/5">
              <h3 className="text-xl font-bold text-foreground mb-4">
                ASIC Agent<br />Services
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-bold text-foreground">${price}</span>
                <span className="text-muted-foreground text-lg">/year</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Includes GST · All-Inclusive
              </p>
              <button
                onClick={() => navigate("/asic-agent-services")}
                className="w-full h-12 flex items-center justify-center gap-2 px-6 bg-[hsl(var(--cta))] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Get Started Now <ArrowRight size={18} />
              </button>
            </div>

            {/* Right: Features */}
            <div className="p-6 md:p-8 flex-1">
              <h4 className="font-bold text-foreground mb-4">Everything Included:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> ASIC government fees ($321/year) are separate and paid directly to ASIC · Registered ASIC Agent 44276
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
