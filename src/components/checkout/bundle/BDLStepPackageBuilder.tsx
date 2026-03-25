import React, { useState, useMemo } from "react";
import { Check, ArrowRight, User, Building2, Home, Bitcoin, TrendingUp, Minus, Plus, Sparkles, Info } from "lucide-react";
import { CryptoInfoDialog } from "@/components/checkout/shared/CryptoInfoDialog";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { cn } from "@/lib/utils";
import { usePricingPackages } from "@/hooks/usePricingPackages";

export const BDLStepPackageBuilder: React.FC = () => {
  const { updateCustomer, setStep } = useCheckout();
  const { packages } = usePricingPackages();
  const tfnPrice = packages.tfn.foundation.price;
  const rentalBasePrice = packages.rental_properties.foundation.price;

  /* ── Income stream definitions ── */
  const INCOME_STREAMS = [
    { id: "tfn", label: "TFN Income (PAYG Employment)", desc: "Salary, wages, government payments", basePrice: tfnPrice, icon: User, type: "checkbox" as const },
    { id: "abn", label: "ABN Income (Sole Trader / Business)", desc: "Self-employed income, Uber, freelancing", basePrice: 40, pricePrefix: "From ", icon: Building2, type: "expandable" as const },
    { id: "rental", label: "Rental Properties", desc: "Investment properties with rental income", basePrice: rentalBasePrice, priceSuffix: " each", icon: Home, type: "counter" as const },
    { id: "crypto", label: "Cryptocurrency Capital Gains Schedule", desc: "Crypto trading, DeFi, staking, NFTs", basePrice: 100, icon: Bitcoin, type: "checkbox" as const },
    { id: "shares", label: "Shares & Investments", desc: "Share trading, dividends, CFDs, capital gains", basePrice: 199, icon: TrendingUp, type: "checkbox" as const },
  ];

const ANNUAL_INCOME_OPTIONS = [
  { value: "0-50k", label: "$0 - $50k" },
  { value: "50k-100k", label: "$50k - $100k" },
  { value: "100k-200k", label: "$100k - $200k" },
  { value: "200k+", label: "$200k+" },
];

const ABN_PRICE_BY_INCOME: Record<string, number> = {
  "0-50k": 40,
  "50k-100k": 40,
  "100k-200k": 40,
  "200k+": 40,
};

const BAS_PRICE = 75;
const BAS_OPTIONS = [0, 1, 2, 3, 4];

const STREAM_COLORS: Record<string, { border: string; bg: string; iconBg: string }> = {
  tfn: { border: "border-primary", bg: "bg-primary/5", iconBg: "bg-primary" },
  abn: { border: "border-[hsl(var(--cta))]", bg: "bg-[hsl(var(--cta)/0.05)]", iconBg: "bg-[hsl(var(--cta))] disabled:opacity-50" },
  rental: { border: "border-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/0.05)]", iconBg: "bg-[hsl(var(--success))]" },
  crypto: { border: "border-[hsl(280,60%,55%)]", bg: "bg-[hsl(280,60%,55%,0.05)]", iconBg: "bg-[hsl(280,60%,55%)]" },
  shares: { border: "border-[hsl(210,80%,55%)]", bg: "bg-[hsl(210,80%,55%,0.05)]", iconBg: "bg-[hsl(210,80%,55%)]" },
};

const DISCOUNT_TIERS = [
  { min: 2, percent: 10 },
  { min: 3, percent: 15 },
  { min: 4, percent: 20 },
  { min: 5, percent: 25 },
];

function getDiscountPercent(count: number): number {
  for (let i = DISCOUNT_TIERS.length - 1; i >= 0; i--) {
    if (count >= DISCOUNT_TIERS[i].min) return DISCOUNT_TIERS[i].percent;
  }
  return 0;
}

  const [selected, setSelected] = useState<Record<string, boolean>>({ tfn: true });
  const [rentalCount, setRentalCount] = useState(0);
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false);

  /* ABN expandable state */
  const [abnIncome, setAbnIncome] = useState("50k-100k");
  const [abnGstRegistered, setAbnGstRegistered] = useState(false);
  const [abnBasCount, setAbnBasCount] = useState(0);

  const toggleStream = (id: string) => {
    if (id === "rental" || id === "abn" || id === "tfn") return;
    if (id === "crypto") {
      const willBeActive = !selected[id];
      setSelected((prev) => ({ ...prev, [id]: willBeActive }));
      if (willBeActive) setCryptoDialogOpen(true);
      return;
    }
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAbn = () => {
    setSelected((prev) => {
      const next = !prev.abn;
      if (next) return { ...prev, abn: true, tfn: true };
      return { ...prev, abn: false, tfn: true };
    });
  };

  const toggleTfn = () => {
    // TFN is always selected — no toggle allowed
    return;
  };

  /* ── Dynamic pricing ── */
  const streamPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    INCOME_STREAMS.forEach((s) => {
      if (s.id === "abn") {
        prices.abn = abnGstRegistered ? 60 : 40;
      } else if (s.id === "rental") {
        prices.rental = s.basePrice * Math.max(rentalCount, 0);
      } else {
        prices[s.id] = s.basePrice;
      }
    });
    return prices;
  }, [abnGstRegistered, rentalCount]);

  const basTotal = abnBasCount * BAS_PRICE;

  const activeStreams = useMemo(() => {
    return INCOME_STREAMS.filter((s) =>
      s.id === "rental" ? rentalCount > 0 : !!selected[s.id]
    );
  }, [selected, rentalCount]);

  const activeCount = activeStreams.length;
  const discountPercent = getDiscountPercent(activeCount);

  const subtotal = useMemo(() => {
    let total = 0;
    activeStreams.forEach((s) => {
      total += streamPrices[s.id] || 0;
    });
    if (selected.abn) total += basTotal;
    return total;
  }, [activeStreams, streamPrices, basTotal, selected.abn]);

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;
  const gst = Math.round(total / 11);

  const handleProceed = () => {
    const streams = activeStreams.map((s) => s.id);
    updateCustomer({
      bdlStreams: streams,
      bdlRentalCount: rentalCount,
      bdlSubtotal: subtotal,
      bdlDiscountPercent: discountPercent,
      bdlDiscountAmount: discountAmount,
      bdlTotal: total,
      bdlGst: gst,
      abnIncome: selected.abn ? abnIncome : undefined,
      abnGstRegistered: selected.abn ? abnGstRegistered : undefined,
      abnBasCount: selected.abn ? abnBasCount : undefined,
    });
    setStep(1);
  };

  return (
    <div className="py-10 px-4 bg-background">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Build Your Perfect Package
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
          Select all your income streams to get an accurate quote
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Stream Selection */}
          <div className="flex-1 min-w-0 max-w-[700px] mx-auto lg:mx-0 space-y-3">
            {INCOME_STREAMS.map((stream) => {
              const isActive = stream.id === "rental" ? rentalCount > 0 : !!selected[stream.id];
              const Icon = stream.icon;
              const colors = STREAM_COLORS[stream.id] || STREAM_COLORS.tfn;
              const displayPrice = stream.id === "abn"
                ? streamPrices.abn ?? stream.basePrice
                : stream.basePrice;

              return (
                <div key={stream.id}>
                  <button
                    type="button"
                onClick={() => {
                  if (stream.type === "expandable") toggleAbn();
                  else if (stream.id === "tfn") toggleTfn();
                  else if (stream.type === "checkbox") toggleStream(stream.id);
                }}
                disabled={stream.id === "tfn"}
                    className={cn(
                      "w-full flex items-center gap-4 rounded-xl border-2 px-5 py-4 transition-all text-left",
                      isActive
                        ? `${colors.border} ${colors.bg}`
                        : "border-border bg-card hover:border-muted-foreground/30",
                      stream.type === "expandable" && isActive && "rounded-b-none border-b-0"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      isActive ? `${colors.iconBg} text-white` : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn("font-semibold text-sm", "text-foreground")}>{stream.label}</p>
                    {stream.id === "crypto" && (
                      <Info
                        className="w-4 h-4 text-muted-foreground hover:text-[hsl(280,60%,55%)] cursor-pointer shrink-0 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setCryptoDialogOpen(true); }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{stream.desc}</p>
                </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-[hsl(var(--cta))] text-sm whitespace-nowrap">
                        {stream.pricePrefix || ""}${displayPrice}{stream.priceSuffix || ""}
                      </span>
                      {stream.type === "counter" ? (
                        <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setRentalCount(Math.max(0, rentalCount - 1))}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-foreground">{rentalCount}</span>
                          <button
                            type="button"
                            onClick={() => setRentalCount(rentalCount + 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className={cn(
                          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                          isActive ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] disabled:opacity-50" : "border-border"
                        )}>
                          {isActive && <Check className="w-4 h-4 text-white" />}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* ABN Expandable Section */}
                  {stream.type === "expandable" && isActive && (
                    <div
                      className={cn(
                        "border-2 border-t-0 rounded-b-xl px-5 py-4",
                        colors.border, colors.bg
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap gap-6 items-end">
                        {/* Annual Income */}
                        <div className="flex-1 min-w-[140px]">
                          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                            Annual Income
                          </label>
                          <select
                            value={abnIncome}
                            onChange={(e) => setAbnIncome(e.target.value)}
                            className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cta))]"
                          >
                            {ANNUAL_INCOME_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* GST Status */}
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                            GST Status
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const next = !abnGstRegistered;
                              setAbnGstRegistered(next);
                              if (!next) setAbnBasCount(0);
                            }}
                            className="flex items-center gap-2"
                          >
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              abnGstRegistered
                                ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] disabled:opacity-50"
                                : "border-border bg-card"
                            )}>
                              {abnGstRegistered && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-sm text-foreground font-medium">GST Registered</span>
                          </button>
                          <p className="text-[10px] text-muted-foreground mt-0.5 ml-7">
                            Tick only if your business is registered for GST
                          </p>
                        </div>

                        {/* BAS Count - only shown when GST registered */}
                        {abnGstRegistered && (
                          <div className="flex-1 min-w-[180px]">
                            <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                              How Many BAS to Lodge?
                            </label>
                            <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden w-fit">
                              {BAS_OPTIONS.map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setAbnBasCount(n)}
                                  className={cn(
                                    "w-10 h-10 flex items-center justify-center text-sm font-semibold transition-all",
                                    abnBasCount === n
                                      ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50"
                                      : "bg-card text-foreground hover:bg-muted"
                                  )}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                            {abnBasCount > 0 ? (
                              <p className="text-[11px] text-[hsl(var(--cta))] font-medium mt-1">
                                {abnBasCount} × ${BAS_PRICE} = ${abnBasCount * BAS_PRICE}
                              </p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground mt-1">No BAS required</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
              <div className="px-5 py-4">
                <h2 className="text-lg font-bold text-foreground">Your Package</h2>
              </div>

              <div className="px-5 pb-5 space-y-3">
                {activeStreams.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Select income streams to build your package</p>
                ) : (
                  <>
                    {activeStreams.map((s) => {
                      const colors = STREAM_COLORS[s.id];
                      const Icon = s.icon;
                      const price = streamPrices[s.id] || 0;
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0", colors.iconBg)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {s.label}{s.id === "rental" && rentalCount > 1 ? ` (×${rentalCount})` : ""}
                          </span>
                          <span className="text-sm font-semibold text-foreground">${price}</span>
                        </div>
                      );
                    })}

                    {/* BAS line item */}
                    {selected.abn && abnBasCount > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[hsl(var(--cta))] text-white shrink-0 disabled:opacity-50">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-foreground">
                          BAS Lodgement (×{abnBasCount})
                        </span>
                        <span className="text-sm font-semibold text-foreground">${basTotal}</span>
                      </div>
                    )}

                    <div className="border-t border-border pt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">${subtotal}</span>
                      </div>

                      {discountPercent > 0 && (
                        <div className="flex justify-between items-center bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] rounded-lg px-3 py-2">
                          <span className="flex items-center gap-1.5 text-[hsl(var(--success))] font-semibold text-sm">
                            <Sparkles className="w-4 h-4" />
                            Bundle Discount ({discountPercent}%)
                          </span>
                          <span className="font-bold text-[hsl(var(--cta))]">-${discountAmount}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (incl.)</span>
                        <span className="font-medium text-foreground">${gst}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-foreground">${total}</span>
                      </div>
                    </div>

                    {discountPercent > 0 && (
                      <div className="bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] rounded-xl p-3 text-center">
                        <p className="text-sm font-bold text-[hsl(var(--success))]">
                          ✨ You're Saving ${discountAmount}!
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {discountPercent === 25 ? "Maximum bundle discount applied!" : "Add more streams to save even more!"}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleProceed}
                      className="w-full h-12 bg-[hsl(var(--cta))] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
                      Secure SSL Payment
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CryptoInfoDialog open={cryptoDialogOpen} onOpenChange={setCryptoDialogOpen} />
    </div>
  );
};
