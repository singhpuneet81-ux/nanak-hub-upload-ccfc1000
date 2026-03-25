import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, ArrowLeft, ArrowRight, Users, FileText, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Counter } from "@/components/checkout/Counter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePricingPackages } from "@/hooks/usePricingPackages";

const ASIC_ONLY_FEATURES = [
  "Annual ASIC Review Lodgement",
  "Unlimited Company Changes",
  "Resolutions & Minutes Support",
  "Company Register Updates",
  "Priority Expert Support",
];

const BUNDLE_FEATURES = [
  "Everything in ASIC Only",
  "Company Tax Return & Financials",
  "4 Quarterly BAS Lodgements",
  "Monthly Bookkeeping Support",
  "Tax Planning Advice",
];

const REVENUE_RANGES = [
  { id: "up-to-100k", label: "Up to $100K" },
  { id: "100k-250k", label: "$100K - $250K" },
  { id: "250k-500k", label: "$250K - $500K" },
  { id: "500k-1m", label: "$500K - $1M" },
  { id: "1m-2m", label: "$1M - $2M" },
  { id: "2m-5m", label: "$2M - $5M+" },
];

const REVENUE_PRICES: Record<string, { essential: number; pro: number }> = {
  "up-to-100k": { essential: 2990, pro: 4490 },
  "100k-250k": { essential: 3490, pro: 4990 },
  "250k-500k": { essential: 3990, pro: 5490 },
  "500k-1m": { essential: 4490, pro: 5990 },
  "1m-2m": { essential: 5490, pro: 6990 },
  "2m-5m": { essential: 6990, pro: 8990 },
};

const PAYROLL_PER_STAFF = 20;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const ASICStepPackageSelection: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const { packages } = usePricingPackages();
  const ASIC_BASE = packages.asic_agent.foundation.price;

  const pkg = (customer.asicPackage as string) || "";
  const revenue = (customer.asicRevenue as string) || "";
  const billing = (customer.asicBilling as "monthly" | "annual") || "monthly";
  const packageLevel = (customer.asicPackageLevel as string) || "essential";
  const payrollEnabled = !!customer.asicPayroll;
  const staffCount = (customer.asicStaffCount as number) || 1;

  const setPackage = (p: string) => {
    if (p === "asic_only") {
      updateCustomer({
        asicPackage: p,
        asicRevenue: "",
        asicBilling: "monthly",
        asicPackageLevel: "essential",
        asicPayroll: false,
        asicStaffCount: 1,
      });
    } else {
      updateCustomer({ asicPackage: p });
    }
  };

  const isValid = pkg === "asic_only" || (pkg === "bundle_accounting" && !!revenue);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choose Your Package</h2>
        <p className="text-muted-foreground mt-1">Registration only or bundle with ongoing accounting services</p>
      </div>

      {/* Package Cards — ABN style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ASIC Only */}
        <div
          onClick={() => setPackage("asic_only")}
          className={cn(
            "relative rounded-2xl border-2 p-6 cursor-pointer transition-all",
            pkg === "asic_only"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          )}
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">ASIC Only</h3>
                <p className="text-sm text-muted-foreground">Just the essentials</p>
              </div>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1",
                pkg === "asic_only" ? "border-primary bg-primary" : "border-muted-foreground/30"
              )}
            >
              {pkg === "asic_only" && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {ASIC_ONLY_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ASIC + Accounting */}
        <div
          onClick={() => setPackage("bundle_accounting")}
          className={cn(
            "relative rounded-2xl border-2 p-6 cursor-pointer transition-all",
            pkg === "bundle_accounting"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          )}
        >
          {/* Recommended badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 bg-[hsl(var(--success))] text-white text-[11px] font-bold px-3 py-1 rounded-full">
              <Check className="w-3 h-3" /> Recommended
            </span>
          </div>

          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">ASIC + Accounting</h3>
                <p className="text-sm text-muted-foreground">Complete solution</p>
              </div>
            </div>
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1",
                pkg === "bundle_accounting" ? "border-primary bg-primary" : "border-muted-foreground/30"
              )}
            >
              {pkg === "bundle_accounting" && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {BUNDLE_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bundle configuration */}
      {pkg === "bundle_accounting" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Revenue Range */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                Annual Revenue Bracket <span className="text-destructive">*</span>
              </label>
              <Select value={revenue} onValueChange={(v) => updateCustomer({ asicRevenue: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select bracket" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_RANGES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Billing Frequency */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Billing Frequency</label>
              <div className="flex h-12 border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => updateCustomer({ asicBilling: "monthly" })}
                  className={cn(
                    "flex-1 text-sm font-medium transition-colors",
                    billing === "monthly"
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-muted"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => updateCustomer({ asicBilling: "annual" })}
                  className={cn(
                    "flex-1 text-sm font-medium transition-colors",
                    billing === "annual"
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-muted"
                  )}
                >
                  Annual
                </button>
              </div>
            </div>
          </div>

          {revenue && (
            <>
              {/* Package Level */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Select Your Package Level <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Essential */}
                  <div
                    onClick={() => updateCustomer({ asicPackageLevel: "essential" })}
                    className={cn(
                      "rounded-2xl border-2 p-5 cursor-pointer transition-all",
                      packageLevel === "essential"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-foreground">Essential</h4>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", packageLevel === "essential" ? "border-primary" : "border-muted-foreground/40")}>
                        {packageLevel === "essential" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Perfect for small businesses</p>
                    <p className="text-2xl font-bold text-foreground mb-3">
                      ${(REVENUE_PRICES[revenue]?.essential || 0).toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/year</span>
                    </p>
                    <div className="space-y-1.5">
                      {["BAS & Tax Return", "Basic Bookkeeping", "Email Support"].map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro */}
                  <div
                    onClick={() => updateCustomer({ asicPackageLevel: "pro" })}
                    className={cn(
                      "rounded-2xl border-2 p-5 cursor-pointer transition-all",
                      packageLevel === "pro"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-foreground">Pro</h4>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", packageLevel === "pro" ? "border-primary" : "border-muted-foreground/40")}>
                        {packageLevel === "pro" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">For growing businesses</p>
                    <p className="text-2xl font-bold text-foreground mb-3">
                      ${(REVENUE_PRICES[revenue]?.pro || 0).toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/year</span>
                    </p>
                    <div className="space-y-1.5">
                      {["Everything in Essential", "Advanced Bookkeeping", "Priority Phone Support", "Tax Planning Advice"].map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
                          <span className="text-sm text-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payroll toggle */}
              <div className="border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Payroll Services</p>
                      <p className="text-xs text-muted-foreground">Full-service payroll processing</p>
                    </div>
                  </div>
                  <Switch
                    checked={payrollEnabled}
                    onCheckedChange={(checked) => updateCustomer({ asicPayroll: !!checked })}
                    className="data-[state=checked]:bg-[hsl(var(--cta))] disabled:opacity-50"
                  />
                </div>
                {payrollEnabled && (
                  <div className="mt-3 border-t border-border pt-3 flex items-center justify-between">
                    <Counter
                      value={staffCount}
                      onChange={(val) => updateCustomer({ asicStaffCount: val })}
                      min={1}
                      max={50}
                      label="employee"
                    />
                    <p className="text-sm font-bold text-primary">${staffCount * PAYROLL_PER_STAFF * 12}/year</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-2xl font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue to Review <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
