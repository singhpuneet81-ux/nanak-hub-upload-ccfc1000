import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Check, ArrowLeft, ArrowRight, Sparkles, MapPin, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useServicePricing } from "@/hooks/useAccountingPricing";
import { getAccountingFallback } from "@/config/accountingPricingFallback";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const CAStepAddons: React.FC<Props> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();
  const { pricing: apiPricing } = useServicePricing("company_accounting");
  const cfg = apiPricing ?? getAccountingFallback("company_accounting")!;

  const catchUpNeeded = (customer.caCatchUp as string) || "up_to_date";
  const registeredOffice = !!customer.caRegisteredOffice;
  const taxPlanning = !!customer.caTaxPlanning;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Optional Add-ons</h2>
        <p className="text-muted-foreground mt-1">Enhance your package with these premium services</p>
      </div>

      {/* Financial Review & Data Clean-Up */}
      <div className="border-2 border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--cta)/0.1)] flex items-center justify-center">
            <Sparkles className="text-[hsl(var(--cta))]" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Financial Review & Data Clean-Up</h3>
            <p className="text-sm text-muted-foreground">
              Starting mid-year? We'll review your previous records and ensure everything is compliant before taking over.
            </p>
          </div>
        </div>
        <p className="text-2xl font-bold text-[hsl(var(--cta))] mb-4">
          ${cfg.addons.catchUpFee.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">one-time fee</span>
        </p>

        <div className="border border-border rounded-lg overflow-hidden">
          <div
            onClick={() => updateCustomer({ caCatchUp: "up_to_date" })}
            className={cn(
              "flex items-start gap-3 p-4 cursor-pointer transition-all border-b border-border",
              catchUpNeeded === "up_to_date" && "bg-[hsl(var(--success)/0.03)]"
            )}
          >
            <Checkbox
              checked={catchUpNeeded === "up_to_date"}
              onCheckedChange={() => updateCustomer({ caCatchUp: "up_to_date" })}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-foreground">My books are up to date</p>
              <p className="text-sm text-muted-foreground">All transactions reconciled, BAS lodged, nothing missing</p>
            </div>
          </div>
          <div
            onClick={() => updateCustomer({ caCatchUp: "need_support" })}
            className={cn(
              "flex items-start gap-3 p-4 cursor-pointer transition-all",
              catchUpNeeded === "need_support" && "bg-[hsl(var(--success)/0.03)]"
            )}
          >
            <Checkbox
              checked={catchUpNeeded === "need_support"}
              onCheckedChange={() => updateCustomer({ caCatchUp: "need_support" })}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-foreground">I need reconciliation support</p>
              <p className="text-sm text-muted-foreground">Previous accountant transition, missing records, or catch-up work required</p>
            </div>
          </div>
        </div>

        {catchUpNeeded === "need_support" && (
          <div className="mt-3 bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.2)] rounded-lg p-4">
            <p className="text-sm font-semibold text-[hsl(var(--success))] mb-2">✓ Catch-Up Pack Includes:</p>
            <div className="space-y-1.5">
              {[
                "Complete financial review (up to 12 months)",
                "Bank reconciliation and data clean-up",
                "Previous accountant transition support",
                "Compliance gap analysis and remediation",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-[hsl(var(--success))]" />
                  <span className="text-sm text-[hsl(var(--success))]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Registered Office Address */}
      <div
        onClick={() => updateCustomer({ caRegisteredOffice: !registeredOffice })}
        className={cn(
          "border-2 rounded-xl p-5 cursor-pointer transition-all",
          registeredOffice
            ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]"
            : "border-border hover:border-primary/40"
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={registeredOffice}
            onCheckedChange={(checked) => updateCustomer({ caRegisteredOffice: !!checked })}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <h3 className="font-bold text-foreground">Registered Office Address</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Professional business address for all official correspondence and ASIC requirements
            </p>
            <p className="text-xl font-bold text-foreground mt-2">
              ${cfg.addons.registeredOfficeFee.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/year</span>
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Tax Planning Session */}
      <div
        onClick={() => updateCustomer({ caTaxPlanning: !taxPlanning })}
        className={cn(
          "border-2 rounded-xl p-5 cursor-pointer transition-all",
          taxPlanning
            ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]"
            : "border-border hover:border-primary/40"
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={taxPlanning}
            onCheckedChange={(checked) => updateCustomer({ caTaxPlanning: !!checked })}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="font-bold text-foreground">Strategic Tax Planning Session</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              One-on-one consultation with our senior tax advisor to optimize your tax position
            </p>
            <p className="text-xl font-bold text-foreground mt-2">
              ${cfg.addons.taxPlanningFee.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">one-time</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
