import React, { useState, useMemo } from "react";
import { Check, ArrowRight, Star, User, Building2, Home, Bitcoin, TrendingUp, Minus, Plus, ChevronDown, Info, Sparkles, BarChart3, Landmark, CandlestickChart, Globe, ShieldCheck, Lock, Clock } from "lucide-react";
import { CryptoInfoDialog } from "@/components/checkout/shared/CryptoInfoDialog";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { cn } from "@/lib/utils";
import { useSoleTraderPricing } from "@/hooks/useSoleTraderPricing";
import { TPBBadge } from "../shared/TPBBadge";
import { NeedHelpCall } from "../shared/NeedHelpCall";

const ICON_MAP: Record<string, React.ElementType> = {
  User, Building2, Home, Bitcoin, TrendingUp, Landmark, CandlestickChart, Globe,
};

export const STRStepPlanSelection: React.FC = () => {
  const { updateCustomer, setStep, customer } = useCheckout();
  const { cfg } = useSoleTraderPricing();

  const INCOME_STREAMS = cfg.incomeStreams;
  const DISCOUNT_THRESHOLD = cfg.discountThreshold;
  const DISCOUNT_PERCENT = cfg.discountPercent;
  const BAS_PRICE = cfg.basPrice;

  const ANNUAL_INCOME_OPTIONS = [
    { value: "0-50k", label: "$0 - $50k" },
    { value: "50k-100k", label: "$50k - $100k" },
    { value: "100k-200k", label: "$100k - $200k" },
    { value: "200k+", label: "$200k+" },
  ];

  const BAS_OPTIONS = [0, 1, 2, 3, 4];

  const STREAM_COLORS: Record<string, { border: string; bg: string; iconBg: string }> = {};
  INCOME_STREAMS.forEach((s) => {
    STREAM_COLORS[s.id] = { border: "border-[hsl(var(--cta))]", bg: "bg-[hsl(var(--cta)/0.06)]", iconBg: "bg-[hsl(var(--cta))] disabled:opacity-50" };
  });

  const savedStreams = customer.incomeStreams as string[] | undefined;
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    if (savedStreams && savedStreams.length > 0) {
      const map: Record<string, boolean> = {};
      savedStreams.forEach((s) => { if (s !== "rental" && s !== "shares") map[s] = true; });
      if (!map.tfn) map.tfn = true;
      return map;
    }
    return { tfn: true };
  });
  const [rentalCount, setRentalCount] = useState(() => (customer.rentalCount as number) || 0);
  const [sharesCount, setSharesCount] = useState(() => (customer.sharesCount as number) || 0);
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false);

  const [abnIncome, setAbnIncome] = useState(() => (customer.abnIncome as string) || "50k-100k");
  const [abnGstRegistered, setAbnGstRegistered] = useState(() => !!(customer.abnGstRegistered));
  const [abnBasCount, setAbnBasCount] = useState(() => (customer.abnBasCount as number) || 0);
  const [strategicTaxPlanning, setStrategicTaxPlanning] = useState(() => !!(customer.strategicTaxPlanning));

  const toggleStream = (id: string) => {
    if (id === "rental" || id === "abn" || id === "tfn" || id === "shares") return;
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

  const toggleTfn = () => { return; };

  const streamPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    INCOME_STREAMS.forEach((s) => {
      if (s.id === "abn") {
        prices.abn = abnGstRegistered ? (s.basePrice + cfg.abnGstSurcharge) : s.basePrice;
      } else if (s.id === "rental") {
        prices.rental = s.basePrice * Math.max(rentalCount, 0);
      } else if (s.id === "shares") {
        prices.shares = s.basePrice * Math.max(sharesCount, 0);
      } else {
        prices[s.id] = s.basePrice;
      }
    });
    return prices;
  }, [abnGstRegistered, rentalCount, sharesCount, INCOME_STREAMS, cfg.abnGstSurcharge]);

  const basTotal = abnBasCount * BAS_PRICE;
  const STRATEGIC_TAX_PRICE = 150;

  const { totalBase, activeCount, hasDiscount } = useMemo(() => {
    let total = 0;
    let count = 0;
    INCOME_STREAMS.forEach((s) => {
      const isActive = s.id === "rental" ? rentalCount > 0 : s.id === "shares" ? sharesCount > 0 : !!selected[s.id];
      if (isActive) {
        total += streamPrices[s.id] || 0;
        count++;
      }
    });
    if (selected.abn) total += basTotal;
    if (strategicTaxPlanning) total += STRATEGIC_TAX_PRICE;
    const disc = count >= DISCOUNT_THRESHOLD;
    return { totalBase: total, activeCount: count, hasDiscount: disc };
  }, [selected, rentalCount, sharesCount, streamPrices, basTotal, strategicTaxPlanning, INCOME_STREAMS, DISCOUNT_THRESHOLD]);

  const essentialPrice = useMemo(() => {
    if (activeCount === 0) return 0;
    const base = totalBase;
    return hasDiscount ? Math.round(base * (1 - DISCOUNT_PERCENT / 100)) : base;
  }, [totalBase, activeCount, hasDiscount, DISCOUNT_PERCENT]);

  const premiumPrice = useMemo(() => {
    if (activeCount === 0) return 0;
    const premiumSurcharge = activeCount * cfg.premiumSurchargePerStream;
    const base = totalBase + premiumSurcharge;
    return hasDiscount ? Math.round(base * (1 - DISCOUNT_PERCENT / 100)) : base;
  }, [totalBase, activeCount, hasDiscount, DISCOUNT_PERCENT, cfg.premiumSurchargePerStream]);

  const handleSelect = (planId: string) => {
    const streams = Object.keys(selected).filter((k) => selected[k]);
    if (rentalCount > 0 && !streams.includes("rental")) streams.push("rental");
    if (sharesCount > 0 && !streams.includes("shares")) streams.push("shares");
    updateCustomer({
      strPlan: planId,
      incomeStreams: streams,
      rentalCount,
      sharesCount,
      abnIncome: selected.abn ? abnIncome : undefined,
      abnGstRegistered: selected.abn ? abnGstRegistered : undefined,
      abnBasCount: selected.abn ? abnBasCount : undefined,
      strategicTaxPlanning,
      strEssentialPrice: essentialPrice,
      strPremiumPrice: premiumPrice,
    });
    setStep(1);
  };

  return (
    <div className="py-6 sm:py-10 px-3 sm:px-4 bg-background pb-28 lg:pb-10">
      <div className="text-center max-w-2xl mx-auto mb-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">{cfg.pageTitle}</h1>
        <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">{cfg.pageSubtitle}</p>
      </div>

      <div className="max-w-[1100px] mx-auto mt-6 sm:mt-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Stream Selection */}
          <div className="flex-1 min-w-0 lg:max-w-[700px] mx-auto lg:mx-0 space-y-3">
        {INCOME_STREAMS.map((stream) => {
          const isActive = stream.id === "rental" ? rentalCount > 0 : stream.id === "shares" ? sharesCount > 0 : !!selected[stream.id];
          const Icon = ICON_MAP[stream.icon] || User;
          const colors = STREAM_COLORS[stream.id] || STREAM_COLORS.tfn;
          const displayPrice = stream.id === "abn" ? streamPrices.abn ?? stream.basePrice : stream.basePrice;

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
                  "w-full flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 sm:px-5 py-3 sm:py-4 transition-all text-left",
                  isActive ? `${colors.border} ${colors.bg}` : "border-border bg-card hover:border-muted-foreground/30",
                  stream.type === "expandable" && isActive && "rounded-b-none border-b-0"
                )}
              >
                <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0", isActive ? `${colors.iconBg} text-white` : "bg-muted text-muted-foreground")}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-xs sm:text-sm text-foreground">{stream.label}</p>
                    {stream.id === "crypto" && (
                      <Info className="w-4 h-4 text-muted-foreground hover:text-[hsl(280,60%,55%)] cursor-pointer shrink-0 transition-colors" onClick={(e) => { e.stopPropagation(); setCryptoDialogOpen(true); }} />
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">{stream.desc}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="font-bold text-[hsl(var(--cta))] text-xs sm:text-sm whitespace-nowrap">
                    {stream.pricePrefix || ""}${displayPrice}{stream.id === "shares" ? "/share disposal" : (stream.priceSuffix || "")}
                  </span>
                  {(stream.type === "counter" || stream.type === "sharecounter") ? (
                    <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => stream.id === "shares" ? setSharesCount(Math.max(0, sharesCount - 1)) : setRentalCount(Math.max(0, rentalCount - 1))} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
                      <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-semibold text-foreground">{stream.id === "shares" ? sharesCount : rentalCount}</span>
                      <button type="button" onClick={() => stream.id === "shares" ? setSharesCount(sharesCount + 1) : setRentalCount(rentalCount + 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
                    </div>
                  ) : (
                    <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all", isActive ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] disabled:opacity-50" : "border-border")}>
                      {isActive && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
                    </div>
                  )}
                </div>
              </button>

              {/* ABN Expandable Section */}
              {stream.type === "expandable" && isActive && (
                <div className={cn("border-2 border-t-0 rounded-b-xl px-3 sm:px-5 py-3 sm:py-4", colors.border, colors.bg)} onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 sm:items-end">
                    <div className="w-full sm:flex-1 sm:min-w-[140px]">
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Annual Income</label>
                      <select value={abnIncome} onChange={(e) => setAbnIncome(e.target.value)} className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--cta))]">
                        {ANNUAL_INCOME_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    </div>
                    <div className="w-full sm:flex-1 sm:min-w-[120px]">
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">GST Status</label>
                      <button type="button" onClick={() => { const next = !abnGstRegistered; setAbnGstRegistered(next); if (!next) setAbnBasCount(0); }} className="flex items-center gap-2">
                        <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-all", abnGstRegistered ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] disabled:opacity-50" : "border-border bg-card")}>
                          {abnGstRegistered && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-foreground font-medium">GST Registered</span>
                      </button>
                      <p className="text-[10px] text-muted-foreground mt-0.5 ml-7">Tick only if your business is registered for GST</p>
                    </div>
                    {abnGstRegistered && (
                      <div className="w-full sm:flex-1 sm:min-w-[180px]">
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">How Many BAS to Lodge?</label>
                        <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden w-fit">
                          {BAS_OPTIONS.map((n) => (
                            <button key={n} type="button" onClick={() => setAbnBasCount(n)} className={cn("w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm font-semibold transition-all", abnBasCount === n ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : "bg-card text-foreground hover:bg-muted")}>{n}</button>
                          ))}
                        </div>
                        {abnBasCount > 0 ? (<p className="text-[11px] text-[hsl(var(--cta))] font-medium mt-1">{abnBasCount} × ${BAS_PRICE} = ${abnBasCount * BAS_PRICE}</p>) : (<p className="text-[11px] text-muted-foreground mt-1">No BAS required</p>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

            {/* Strategic Tax Planning Addon */}
            <div className="mt-6">
              <h3 className="text-base font-bold text-foreground mb-3">How We Maximize Your Refund</h3>
              <button
                type="button"
                onClick={() => setStrategicTaxPlanning(!strategicTaxPlanning)}
                className={cn(
                  "w-full flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 sm:px-5 py-3 sm:py-4 transition-all text-left",
                  strategicTaxPlanning
                    ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.06)]"
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0", strategicTaxPlanning ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : "bg-muted text-muted-foreground")}>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-xs sm:text-sm text-foreground">Strategic Tax Planning</p>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[hsl(var(--cta)/0.12)] text-[hsl(var(--cta))] px-1.5 sm:px-2 py-0.5 rounded-full">Recommended</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">Personalised strategies to legally minimise your tax and maximise deductions</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="font-bold text-[hsl(var(--cta))] text-xs sm:text-sm whitespace-nowrap">$150</span>
                  <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all", strategicTaxPlanning ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] disabled:opacity-50" : "border-border")}>
                    {strategicTaxPlanning && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Right: Full Order Summary Sidebar */}
          <div className="hidden lg:block w-full lg:w-[340px] shrink-0">
            <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-6">
              {/* Header */}
              <div className="bg-primary px-5 py-4 rounded-t-2xl">
                <h2 className="text-lg font-bold text-primary-foreground">Order Summary</h2>
              </div>

              <div className="px-5 pb-5 pt-4 space-y-3">
                {activeCount === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Select income streams to build your package</p>
                ) : (
                  <>
                    {/* Line items */}
                    {INCOME_STREAMS.filter((s) => s.id === "rental" ? rentalCount > 0 : s.id === "shares" ? sharesCount > 0 : !!selected[s.id]).map((s) => {
                      const price = streamPrices[s.id] || 0;
                      return (
                        <div key={s.id} className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">
                            {s.label}
                            {s.id === "rental" && rentalCount > 1 ? ` (×${rentalCount})` : ""}
                            {s.id === "shares" ? ` (${sharesCount} disposal${sharesCount === 1 ? "" : "s"})` : ""}
                          </span>
                          <span className="font-semibold text-foreground">${price}</span>
                        </div>
                      );
                    })}

                    {selected.abn && abnBasCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">BAS Lodgement (×{abnBasCount})</span>
                        <span className="font-semibold text-foreground">${basTotal}</span>
                      </div>
                    )}

                    {strategicTaxPlanning && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">Strategic Tax Planning</span>
                        <span className="font-semibold text-foreground">${STRATEGIC_TAX_PRICE}</span>
                      </div>
                    )}

                    <p className="text-xs text-[hsl(var(--cta))] italic">Add services to see them here</p>

                    {/* Promo code */}
                    <div className="border-t border-border pt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter promo code"
                          className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button className="h-9 px-3 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                          Apply
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Enter promotional code if you have one</p>
                    </div>

                    {/* Subtotal / Discount / GST */}
                    <div className="border-t border-border pt-3 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium text-foreground">${totalBase}</span></div>
                      {hasDiscount && (
                        <div className="flex justify-between items-center bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] rounded-lg px-3 py-2">
                          <span className="flex items-center gap-1.5 text-[hsl(var(--success))] font-semibold text-sm"><Sparkles className="w-4 h-4" />Discount ({DISCOUNT_PERCENT}%)</span>
                          <span className="font-bold text-[hsl(var(--cta))]">-${Math.round(totalBase * DISCOUNT_PERCENT / 100)}</span>
                        </div>
                      )}
                      <div className="flex justify-between"><span className="text-muted-foreground">GST (incl.)</span><span className="font-medium text-foreground">${Math.round(essentialPrice / 11)}</span></div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">Total</span>
                        <span className="text-2xl font-extrabold text-[hsl(var(--cta))]">${essentialPrice}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button onClick={() => handleSelect("premium")} className="w-full h-12 bg-[hsl(var(--cta))] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
                      Proceed to Checkout<ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Check className="w-3.5 h-3.5 text-[hsl(var(--success))]" />Secure SSL Payment</div>
                  </>
                )}

                {/* Trust badges — always visible */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3 bg-[hsl(var(--success)/0.07)] border border-[hsl(var(--success)/0.15)] rounded-xl px-4 py-3">
                    <ShieldCheck className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--success))]">100% Money-Back Guarantee</p>
                      <p className="text-xs text-muted-foreground">Risk-free service</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[hsl(var(--success)/0.07)] border border-[hsl(var(--success)/0.15)] rounded-xl px-4 py-3">
                    <Lock className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--success))]">Secure Payment</p>
                      <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[hsl(var(--success)/0.07)] border border-[hsl(var(--success)/0.15)] rounded-xl px-4 py-3">
                    <Clock className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--success))]">Fast Processing</p>
                      <p className="text-xs text-muted-foreground">24-48 hours</p>
                    </div>
                  </div>
                </div>

                <NeedHelpCall />
                {/* TPB Badge */}
                <TPBBadge />
              </div>
            </div>
          </div>
        </div>
      </div>
      <CryptoInfoDialog open={cryptoDialogOpen} onOpenChange={setCryptoDialogOpen} />

      {/* Mobile sticky bottom bar */}
      {activeCount > 0 && (
        <div className="checkout-mobile-summary lg:hidden">
          <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="shrink-0">
              <p className="text-sm text-muted-foreground">Total (inc GST)</p>
              <p className="text-xl font-bold text-[hsl(var(--cta))]">${essentialPrice}</p>
            </div>
            <button
              onClick={() => handleSelect("premium")}
              className="flex-1 max-w-[220px] h-12 rounded-xl bg-[hsl(var(--cta))] text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
