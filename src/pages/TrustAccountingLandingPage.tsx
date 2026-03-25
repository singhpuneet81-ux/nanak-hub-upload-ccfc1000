import React, { useState } from "react";
import { Check, ArrowRight, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TPBBadge } from "@/components/checkout/shared/TPBBadge";
import { Switch } from "@/components/ui/switch";
import { Counter } from "@/components/checkout/Counter";
import { cn } from "@/lib/utils";

const PAYROLL_FEATURES = ["STP & PAYG", "Payslips", "Super calc"];

const ESSENTIAL_FEATURES = [
  "Trust Tax Return Preparation",
  "Distribution Minutes",
  "Beneficiary Statements",
  "Trust Income Calculations",
  "Capital Gains Management",
];

const PREMIUM_FEATURES = [
  "Trust Tax Return Preparation",
  "Distribution Minutes",
  "Beneficiary Statements",
  "Trust Income Calculations",
  "Capital Gains Management",
  "ASIC Annual Statement",
  "Strategic Distribution Planning",
];

const PRICES = {
  essential: { annual: 919, monthly: 77, saving: 184 },
  premium: { annual: 1398, monthly: 117, saving: 280 },
};

const TrustAccountingLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [essentialPayroll, setEssentialPayroll] = useState(false);
  const [premiumPayroll, setPremiumPayroll] = useState(false);
  const [essentialStaff, setEssentialStaff] = useState(1);
  const [premiumStaff, setPremiumStaff] = useState(1);

  const renderCard = (
    level: "essential" | "premium",
    label: string,
    features: string[],
    payrollEnabled: boolean,
    setPayroll: (v: boolean) => void,
    staffCount: number,
    setStaff: (v: number) => void,
    recommended?: boolean
  ) => {
    const prices = PRICES[level];
    const payrollCost = payrollEnabled ? staffCount * 120 : 0;
    const totalAnnual = prices.annual + payrollCost;
    const totalMonthly = Math.round((totalAnnual / 12) * 100) / 100;
    return (
      <div
        className={cn(
          "rounded-2xl border-2 bg-card overflow-hidden flex flex-col relative",
          recommended ? "border-[hsl(var(--cta))]" : "border-border"
        )}
      >
        {recommended && (
          <div className="absolute -top-0 right-4 z-10">
            <span className="bg-[hsl(var(--cta))] text-white text-xs font-bold px-3 py-1 rounded-b-lg uppercase">
              Recommended
            </span>
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-bold text-foreground text-lg">{label}</h3>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={cn("text-4xl font-bold", recommended ? "text-[hsl(var(--cta))]" : "text-foreground")}>
              ${totalAnnual.toLocaleString()}
            </span>
            <span className="text-muted-foreground">/year</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">${totalMonthly}/month</p>
          <span className="inline-flex items-center gap-1 text-sm text-[hsl(var(--success))] font-medium mt-1.5 bg-[hsl(142_76%_94%)] w-fit px-2 py-0.5 rounded">
            <Check size={14} /> Save ${prices.saving}/year
          </span>

          <div className="space-y-2.5 mt-5 flex-1">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>

          {/* Optional Add-ons */}
          <div className="border-t border-border mt-5 pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Optional Add-ons</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Payroll Services</p>
                  <p className="text-xs text-muted-foreground">Full-service payroll processing</p>
                </div>
              </div>
              <Switch
                checked={payrollEnabled}
                onCheckedChange={setPayroll}
                className="data-[state=checked]:bg-[hsl(var(--cta))]"
              />
            </div>
            {payrollEnabled && (
              <div className="mt-3 border border-border rounded-xl p-4 flex items-center justify-between">
                <Counter
                  value={staffCount}
                  onChange={setStaff}
                  min={1}
                  max={50}
                  label="employee"
                />
                <p className="text-sm font-bold text-[hsl(var(--cta))]">${staffCount * 120}/year</p>
              </div>
            )}
            {payrollEnabled && (
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {PAYROLL_FEATURES.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Check size={12} className="text-[hsl(var(--success))]" /> {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(`/trust-accounting?step=0&plan=${level}`)}
            className={cn(
              "w-full h-12 mt-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity",
              recommended
                ? "bg-[hsl(var(--cta))] text-white"
                : "bg-foreground text-background"
            )}
          >
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
              <Shield className="w-4 h-4" />
              Transparent Pricing
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Trust Accounting Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your annual revenue to see tailored pricing for your business
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 -mt-2 pb-16">
        <div className="mx-auto max-w-[900px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderCard("essential", "Essential", ESSENTIAL_FEATURES, essentialPayroll, setEssentialPayroll, essentialStaff, setEssentialStaff)}
            {renderCard("premium", "Premium", PREMIUM_FEATURES, premiumPayroll, setPremiumPayroll, premiumStaff, setPremiumStaff, true)}
          </div>

          {/* Trust */}
          <div className="mt-8 max-w-md mx-auto">
            {/* <TPBBadge /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustAccountingLandingPage;
