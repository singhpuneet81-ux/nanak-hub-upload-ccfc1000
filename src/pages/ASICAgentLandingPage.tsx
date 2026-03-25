import React from "react";
import { Check, ArrowRight, Shield, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TPBBadge } from "@/components/checkout/shared/TPBBadge";

const FEATURES = [
  "Annual ASIC Review Lodgement",
  "Company Statement Preparation",
  "Compliance Calendar Management",
  "Company Register Updates",
  "Unlimited Company Changes",
  "+ 5 More Services",
];

const ASICAgentLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
              <Shield className="w-4 h-4" />
              Simple, Transparent Pricing
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Complete ASIC Compliance Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One simple annual fee covers all your ASIC compliance needs. No hidden fees, no surprises—just professional service you can trust.
          </p>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="px-4 -mt-2 pb-16">
        <div className="mx-auto max-w-[900px]">
          {/* Most Popular badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-block px-5 py-1.5 bg-[hsl(var(--cta))] text-white text-xs font-bold rounded-full uppercase tracking-wide">
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
                  <span className="text-5xl font-bold text-foreground">$180</span>
                  <span className="text-muted-foreground text-lg">/year</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Includes GST · All-Inclusive
                </p>
                <a
                  href="/asic-agent-services?step=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 flex items-center justify-center gap-2 px-6 bg-[hsl(var(--cta))] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity"
                >
                  Get Started Now <ArrowRight size={18} />
                </a>
              </div>

              {/* Right: Features */}
              <div className="p-6 md:p-8 flex-1">
                <h4 className="font-bold text-foreground mb-4">Everything Included:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FEATURES.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                      <span className={`text-sm ${feature.startsWith("+") ? "text-primary font-medium" : "text-foreground"}`}>
                        {feature}
                      </span>
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

          {/* Trust Section */}
          <div className="mt-8 max-w-md mx-auto">
            <TPBBadge />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASICAgentLandingPage;
