import React from "react";
import { Check, ArrowRight, Zap } from "lucide-react";
import { useSMSFPricing } from "@/hooks/useSMSFPricing";

export const SMAPricingCard: React.FC = () => {
  const { cfg } = useSMSFPricing();

  return (
    <div className="py-10 px-4">
      <div className="mx-auto max-w-[950px] grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ===== BOX 1 — Standard SMSF ===== */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-bold text-foreground">{cfg.standardCardTitle}</h3>
            <p className="text-placeholder text-sm mt-0.5">{cfg.standardCardSubtitle}</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">${Math.round(cfg.baseAnnual * (1 - (cfg.annualDiscount || 0.2))).toLocaleString()}</span>
              <span className="text-placeholder text-sm mb-1">/year</span>
              <span className="text-muted-foreground text-xs mb-1 ml-1 line-through">${cfg.baseAnnual.toLocaleString()}</span>
            </div>
          </div>

          <div className="mx-6 border-t border-border" />

          <div className="p-6 pt-4 flex-grow flex flex-col">
            <div className="space-y-2.5 mb-4">
              {cfg.standardExtras.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                  <span className="text-sm font-medium text-foreground">{f}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mb-6 flex-grow">
              {cfg.baseFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>

            <a
              href="/smsf-accounting?package=standard&step=0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Get Started <ArrowRight size={18} />
            </a>

            <p className="text-center text-xs text-placeholder mt-3">
              Full compliance · No ongoing extras
            </p>
          </div>
        </div>

        {/* ===== BOX 2 — Build Your Package ===== */}
        <div className="rounded-2xl flex flex-col overflow-hidden border border-[hsl(var(--cta)/0.25)] bg-[hsl(var(--cta)/0.04)]">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--cta))] flex items-center justify-center disabled:opacity-50">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{cfg.customCardTitle}</h3>
                <p className="text-[hsl(var(--cta))] text-sm font-medium">{cfg.customCardSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex-grow flex flex-col">
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-foreground">From ${cfg.baseAnnual.toLocaleString()}</span>
              <span className="text-placeholder text-sm mb-1">/year</span>
            </div>
            <p className="text-sm text-foreground mb-3">
              Get everything in <strong>{cfg.standardCardTitle}</strong> plus tailored pricing for complex fund structures.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                <span className="text-sm font-medium text-foreground">Customized to your fund complexity</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                <span className="text-sm font-medium text-foreground">Monthly or annual billing options</span>
              </div>
            </div>

            <p className="text-xs font-bold uppercase text-placeholder tracking-wide mb-2">Includes:</p>

            <div className="space-y-2 mb-2">
              {cfg.customScenarios.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[hsl(var(--cta))] shrink-0" />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>
            {cfg.customScenarios.length > 4 && (
              <p className="text-xs text-[hsl(var(--cta))] font-medium mb-6 ml-6 cursor-pointer hover:underline">
                + {cfg.customScenarios.length - 4} more services
              </p>
            )}

            <div className="mt-auto">
              <a
                href="/smsf-accounting?package=custom&step=0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-[hsl(var(--cta))] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Zap size={16} /> Build Your Package <ArrowRight size={18} />
              </a>

              <p className="text-center text-xs text-placeholder mt-3">
                Choose your structure & get custom pricing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-placeholder">{cfg.disclaimerText}</p>
      </div>
    </div>
  );
};
