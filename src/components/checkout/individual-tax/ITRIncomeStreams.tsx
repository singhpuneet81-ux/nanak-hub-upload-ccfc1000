import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { cn } from "@/lib/utils";
import { Home, Bitcoin, TrendingUp, Landmark, BarChart3, Globe, Minus, Plus } from "lucide-react";

interface StreamConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  type: "checkbox" | "counter";
  price: number;
  priceLabel: string;
}

const STREAMS: StreamConfig[] = [
  {
    key: "itrRentalProperties",
    label: "Rental Properties",
    description: "Investment properties with rental income",
    icon: Home,
    type: "counter",
    price: 50,
    priceLabel: "$50 each",
  },
  {
    key: "itrCrypto",
    label: "Cryptocurrency Capital Gains Schedule",
    description: "Crypto trading, DeFi, staking, NFTs",
    icon: Bitcoin,
    type: "checkbox",
    price: 75,
    priceLabel: "$75",
  },
  {
    key: "itrShares",
    label: "Shares & Investments",
    description: "Share trading, dividends (Comsec, NABSec), capital gains",
    icon: TrendingUp,
    type: "counter",
    price: 10,
    priceLabel: "$10/share sold",
  },
  {
    key: "itrCgtProperty",
    label: "Capital Gain Tax Property Sale",
    description: "Capital gains tax calculation on property sales",
    icon: Landmark,
    type: "checkbox",
    price: 199,
    priceLabel: "$199",
  },
  {
    key: "itrCfds",
    label: "CFDs (Contracts for Difference)",
    description: "CFD trading tax calculations and reporting",
    icon: BarChart3,
    type: "checkbox",
    price: 100,
    priceLabel: "$100",
  },
  {
    key: "itrForeignIncome",
    label: "Foreign Income / Overseas Assets",
    description: "Foreign employment, overseas investments, rental abroad",
    icon: Globe,
    type: "checkbox",
    price: 100,
    priceLabel: "$100",
  },
];

export const ITRIncomeStreams: React.FC = () => {
  const { customer, updateCustomer } = useCheckout();

  const toggleCheckbox = (key: string) => {
    updateCustomer({ [key]: !customer[key] });
  };

  const changeCounter = (key: string, delta: number) => {
    const current = (customer[key] as number) || 0;
    const next = Math.max(0, current + delta);
    updateCustomer({ [key]: next });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-foreground">Additional Income Streams</h3>
      <p className="text-sm text-muted-foreground mb-2">Select any additional income sources that apply to you</p>

      <div className="space-y-2">
        {STREAMS.map((stream) => {
          const Icon = stream.icon;
          const isCounter = stream.type === "counter";
          const count = isCounter ? ((customer[stream.key] as number) || 0) : 0;
          const isActive = isCounter ? count > 0 : !!customer[stream.key];

          return (
            <div
              key={stream.key}
              onClick={() => !isCounter && toggleCheckbox(stream.key)}
              className={cn(
                "flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 sm:px-5 py-3 sm:py-4 transition-all",
                isActive
                  ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.03)]"
                  : "border-border bg-card hover:border-muted-foreground/30",
                !isCounter && "cursor-pointer"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
                isActive ? "bg-[hsl(var(--cta)/0.1)] text-[hsl(var(--cta))]" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-xs sm:text-sm">{stream.label}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">{stream.description}</p>
              </div>

              {/* Price + Control */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="font-bold text-[hsl(var(--cta))] text-xs sm:text-sm whitespace-nowrap">
                  {stream.priceLabel}
                </span>

                {isCounter ? (
                  <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => changeCounter(stream.key, -1)}
                      className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-semibold text-foreground border-x border-border">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeCounter(stream.key, 1)}
                      className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleCheckbox(stream.key)}
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all",
                      isActive ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] disabled:opacity-50" : "border-border"
                    )}
                  >
                    {isActive && (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Calculate total price of all income stream addons */
export function calcIncomeStreamsTotal(customer: Record<string, any>): number {
  let total = 0;
  total += ((customer.itrRentalProperties as number) || 0) * 50;
  total += customer.itrCrypto ? 75 : 0;
  total += ((customer.itrShares as number) || 0) * 10;
  total += customer.itrCgtProperty ? 199 : 0;
  total += customer.itrCfds ? 100 : 0;
  total += customer.itrForeignIncome ? 100 : 0;
  return total;
}
