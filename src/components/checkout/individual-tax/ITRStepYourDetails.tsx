import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { validateEmail, validatePhone } from "@/utils/validation";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { PrimaryButton } from "@/components/checkout/Buttons";
import { STATES } from "@/config/yourDetails.config";
import { cn } from "@/lib/utils";
import { Settings, CalendarIcon, Building2, Check } from "lucide-react";
import { ITRIncomeStreams } from "./ITRIncomeStreams";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ANNUAL_INCOME_OPTIONS = [
  { value: "0-50k", label: "$0 - $50k" },
  { value: "50k-100k", label: "$50k - $100k" },
  { value: "100k-200k", label: "$100k - $200k" },
  { value: "200k+", label: "$200k+" },
];

const ABN_PRICE_BY_INCOME: Record<string, number> = {
  "0-50k": 299,
  "50k-100k": 299,
  "100k-200k": 399,
  "200k+": 499,
};

const BAS_PRICE = 50;
const BAS_OPTIONS = [0, 1, 2, 3, 4];

export const ITRStepYourDetails: React.FC = () => {
  const { customer, updateCustomer, nextStep } = useCheckout();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [hasAbnIncome, setHasAbnIncome] = useState(!!customer.itrHasAbn);
  const [abnIncome, setAbnIncome] = useState(customer.itrAbnIncome || "50k-100k");
  const [abnGstRegistered, setAbnGstRegistered] = useState(!!customer.itrAbnGst);
  const [abnBasCount, setAbnBasCount] = useState(customer.itrAbnBasCount || 0);

  const validateField = (key: string, value: string) => {
    let error: string | null = null;
    if (key === "email") error = validateEmail(value);
    else if (key === "phone") error = validatePhone(value);
    setFieldErrors((prev) => {
      if (!error) { const next = { ...prev }; delete next[key]; return next; }
      return { ...prev, [key]: error };
    });
  };

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
    if (typeof value === "string") validateField(key, value);
  };

  /* Sync ABN state to checkout context whenever it changes */
  const syncAbn = (has: boolean, income: string, gst: boolean, bas: number) => {
    const abnPrice = has ? (ABN_PRICE_BY_INCOME[income] || 299) : 0;
    const basTotal = has && gst ? bas * BAS_PRICE : 0;
    updateCustomer({
      itrHasAbn: has,
      itrAbnIncome: has ? income : undefined,
      itrAbnGst: has ? gst : undefined,
      itrAbnBasCount: has && gst ? bas : undefined,
      itrAbnPrice: abnPrice,
      itrBasTotal: basTotal,
    });
  };

  const toggleAbn = () => {
    const next = !hasAbnIncome;
    setHasAbnIncome(next);
    if (!next) {
      setAbnGstRegistered(false);
      setAbnBasCount(0);
    }
    syncAbn(next, abnIncome, next ? abnGstRegistered : false, next ? abnBasCount : 0);
  };

  const handleAbnIncomeChange = (val: string) => {
    setAbnIncome(val);
    syncAbn(true, val, abnGstRegistered, abnBasCount);
  };

  const handleGstToggle = () => {
    const next = !abnGstRegistered;
    setAbnGstRegistered(next);
    const bas = next ? abnBasCount : 0;
    if (!next) setAbnBasCount(0);
    syncAbn(true, abnIncome, next, bas);
  };

  const handleBasChange = (n: number) => {
    setAbnBasCount(n);
    syncAbn(true, abnIncome, abnGstRegistered, n);
  };

  const abnDisplayPrice = ABN_PRICE_BY_INCOME[abnIncome] || 299;

  const isValid = () => {
    const required = ["firstName", "lastName", "email", "phone", "tfn", "dob", "street", "suburb", "state", "postcode"];
    for (const key of required) {
      const value = customer[key];
      if (!value || (typeof value === "string" && value.trim() === "")) return false;
    }
    if (validateEmail(customer.email || "")) return false;
    if (validatePhone(customer.phone || "")) return false;
    return true;
  };

  return (
    <div className="content-card animate-fade-in">
      {/* Step Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Settings className="w-3.5 h-3.5" />
          STEP 1 OF 2
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Personal Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We'll use your TFN to prefill all income and tax data from the ATO
        </p>
      </div>

      <div className="space-y-6">
        {/* First Name / Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput
            label="First Name"
            required
            placeholder="John"
            value={customer.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
          <SoftInput
            label="Last Name"
            required
            placeholder="Smith"
            value={customer.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>

        {/* Email / Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoftInput
            label="Email Address"
            required
            type="email"
            placeholder="john.smith@email.com"
            value={customer.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            error={fieldErrors.email}
          />
          <SoftInput
            label="Phone Number"
            required
            type="tel"
            placeholder="04XX XXX XXX"
            value={customer.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={fieldErrors.phone}
          />
        </div>

        {/* TFN / DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SoftInput
              label="Tax File Number (TFN)"
              required
              placeholder="XXX XXX XXX"
              value={customer.tfn || ""}
              onChange={(e) => handleChange("tfn", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1 text-primary">
              Required to prefill ATO data - secure & encrypted
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Date of Birth<span className="text-destructive"> *</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal rounded-xl border-border bg-input/50",
                    !customer.dob && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customer.dob ? format(new Date(customer.dob), "dd-MM-yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={customer.dob ? new Date(customer.dob) : undefined}
                  onSelect={(date) => handleChange("dob", date ? date.toISOString() : "")}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Street Address */}
        <SoftInput
          label="Street Address"
          required
          placeholder="123 Main Street"
          value={customer.street || ""}
          onChange={(e) => handleChange("street", e.target.value)}
        />

        {/* Suburb / State / Postcode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SoftInput
            label="Suburb"
            required
            placeholder="Sydney"
            value={customer.suburb || ""}
            onChange={(e) => handleChange("suburb", e.target.value)}
          />
          <SoftSelect
            label="State"
            required
            value={customer.state || ""}
            options={[
              { value: "", label: "Select State" },
              ...STATES,
            ]}
            onChange={(e) => handleChange("state", e.target.value)}
          />
          <SoftInput
            label="Postcode"
            required
            placeholder="2000"
            value={customer.postcode || ""}
            onChange={(e) => handleChange("postcode", e.target.value)}
          />
        </div>

        {/* ── ABN Income Add-on ── */}
        <div>
          <button
            type="button"
            onClick={toggleAbn}
            className={cn(
              "w-full flex items-center gap-4 rounded-xl border-2 px-5 py-4 transition-all text-left",
              hasAbnIncome
                ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)]"
                : "border-border bg-card hover:border-muted-foreground/30",
              hasAbnIncome && "rounded-b-none border-b-0"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              hasAbnIncome ? "bg-[hsl(var(--cta))] text-white disabled:opacity-50" : "bg-muted text-muted-foreground"
            )}>
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">Do you have ABN Income?</p>
              <p className="text-xs text-muted-foreground">Sole trader, freelancing, Uber, self-employed income</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-bold text-[hsl(var(--cta))] text-sm whitespace-nowrap">
                From ${abnDisplayPrice}
              </span>
              <div className={cn(
                "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                hasAbnIncome ? "bg-[hsl(var(--cta))] border-[hsl(var(--cta))] disabled:opacity-50" : "border-border"
              )}>
                {hasAbnIncome && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>
          </button>

          {hasAbnIncome && (
            <div className="border-2 border-t-0 border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.05)] rounded-b-xl px-5 py-4">
              <div className="flex flex-wrap gap-6 items-end">
                {/* Annual Income */}
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Annual Income
                  </label>
                  <select
                    value={abnIncome}
                    onChange={(e) => handleAbnIncomeChange(e.target.value)}
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
                  <button type="button" onClick={handleGstToggle} className="flex items-center gap-2">
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

                {/* BAS Count - only when GST registered */}
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
                          onClick={() => handleBasChange(n)}
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

        {/* ── Additional Income Streams ── */}
        <ITRIncomeStreams />
        <div className="mt-8 hidden sm:flex justify-end">
          <PrimaryButton onClick={nextStep} disabled={!isValid()}>
            Continue
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
