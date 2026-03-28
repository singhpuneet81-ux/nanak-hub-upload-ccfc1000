import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { PrimaryButton } from "@/components/checkout/Buttons";
import { Briefcase, Info, Lock, CalendarIcon } from "lucide-react";
import { STATES } from "@/config/yourDetails.config";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ACTIVITY_OPTIONS = [
  { value: "", label: "Select an activity" },
  { value: "professional_services", label: "Professional Services" },
  { value: "consulting", label: "Consulting" },
  { value: "retail_trade", label: "Retail Trade" },
  { value: "construction", label: "Construction" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality & Food" },
  { value: "real_estate", label: "Real Estate" },
  { value: "it_services", label: "IT & Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "transport", label: "Transport & Logistics" },
  { value: "agriculture", label: "Agriculture" },
  { value: "education", label: "Education & Training" },
  { value: "other", label: "Other" },
];

export const PRStepBasics: React.FC = () => {
  const { customer, updateCustomer, nextStep } = useCheckout();

  const handleChange = (key: string, value: any) => {
    updateCustomer({ [key]: value });
  };

  const tradingUnderBN = customer.prTradesUnderBusinessName === "yes";
  const postalDifferent = customer.prPostalDifferent === "yes";

  const isValid = () => {
    if (!(customer.prStartDate || "").trim()) return false;
    if (!(customer.prMainActivity || "").trim()) return false;
    if (customer.prMainActivity === "other" && !(customer.prOtherActivity || "").trim()) return false;
    if (!(customer.prStreetAddress || "").trim()) return false;
    if (!(customer.prCity || "").trim()) return false;
    if (!(customer.prState || "").trim()) return false;
    if (!(customer.prPostcode || "").trim()) return false;
    if (tradingUnderBN && !(customer.prBusinessName || "").trim()) return false;
    if (postalDifferent) {
      if (!(customer.prPostalStreet || "").trim()) return false;
      if (!(customer.prPostalCity || "").trim()) return false;
      if (!(customer.prPostalState || "").trim()) return false;
      if (!(customer.prPostalPostcode || "").trim()) return false;
    }
    return true;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Partnership Basics</h3>
            <p className="text-sm text-muted-foreground">Tell us about your partnership</p>
          </div>
        </div>

        {/* Info box */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            What is a Partnership?
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            A partnership is <strong>not a separate legal entity</strong>. Each partner is jointly responsible for tax obligations. This registration process covers your ATO tax setup only.
          </p>
        </div>

        <div className="space-y-5">
          {/* Partnership Name */}
          <div>
            <SoftInput
              label="Partnership Name"
              placeholder="e.g., Smith & Jones Partnership"
              value={customer.prPartnershipName || ""}
              onChange={(e) => handleChange("prPartnershipName", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">The name under which the partnership operates (optional)</p>
          </div>

          {/* Trading under business name */}
          <div>
            <label className="form-label">Does the partnership trade under a business name?</label>
            <p className="text-xs text-muted-foreground mb-2">A business name is different from your partnership name</p>
            <div className="grid grid-cols-2 gap-3">
              {["yes", "no"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleChange("prTradesUnderBusinessName", val)}
                  className={cn(
                    "h-12 rounded-lg border-2 font-medium transition-all text-sm",
                    customer.prTradesUnderBusinessName === val
                      ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.08)] text-[hsl(var(--cta))]"
                      : "border-border bg-card text-foreground hover:border-primary/30"
                  )}
                >
                  {val === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          {/* Business Name (conditional) */}
          {tradingUnderBN && (
            <SoftInput
              label="Business Name"
              required
              placeholder="e.g., SJ Consulting"
              value={customer.prBusinessName || ""}
              onChange={(e) => handleChange("prBusinessName", e.target.value)}
            />
          )}

          {/* Proposed Start Date */}
          <div>
            <label className="form-label">
              Proposed Business Start Date <span className="text-destructive">*</span>
            </label>
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !customer.prStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customer.prStartDate || <span>dd-mm-yyyy</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={customer.prStartDate ? new Date(customer.prStartDate.split("-").reverse().join("-")) : undefined}
                  onSelect={(date) => handleChange("prStartDate", date ? format(date, "dd-MM-yyyy") : "")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">When will the partnership begin operating?</p>
          </div>

          {/* Main Business Activity */}
          <div>
            <SoftSelect
              label="Main Business Activity"
              required
              options={ACTIVITY_OPTIONS}
              value={customer.prMainActivity || ""}
              onChange={(e) => handleChange("prMainActivity", e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Select the primary activity of your partnership</p>
          </div>

          {/* Other Activity Name (conditional) */}
          {customer.prMainActivity === "other" && (
            <SoftInput
              label="Please specify your business activity"
              required
              placeholder="e.g., Event Management"
              value={customer.prOtherActivity || ""}
              onChange={(e) => handleChange("prOtherActivity", e.target.value)}
            />
          )}

          {/* Business Address */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Business Address</h4>
            <div className="space-y-4">
              <SoftInput
                label="Street Address"
                required
                placeholder="123 Main Street"
                value={customer.prStreetAddress || ""}
                onChange={(e) => handleChange("prStreetAddress", e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SoftInput
                  label="City/Suburb"
                  required
                  placeholder="Melbourne"
                  value={customer.prCity || ""}
                  onChange={(e) => handleChange("prCity", e.target.value)}
                />
                <SoftSelect
                  label="State"
                  required
                  options={[{ value: "", label: "Select" }, ...STATES]}
                  value={customer.prState || ""}
                  onChange={(e) => handleChange("prState", e.target.value)}
                />
                <SoftInput
                  label="Postcode"
                  required
                  placeholder="3000"
                  value={customer.prPostcode || ""}
                  onChange={(e) => handleChange("prPostcode", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Postal different? */}
          <div>
            <label className="form-label">Is the postal address different from the business address?</label>
            <div className="grid grid-cols-2 gap-3">
              {["yes", "no"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleChange("prPostalDifferent", val)}
                  className={cn(
                    "h-12 rounded-lg border-2 font-medium transition-all text-sm",
                    customer.prPostalDifferent === val
                      ? "border-[hsl(var(--cta))] bg-[hsl(var(--cta)/0.08)] text-[hsl(var(--cta))]"
                      : "border-border bg-card text-foreground hover:border-primary/30"
                  )}
                >
                  {val === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          {/* Postal Address (conditional) */}
          {postalDifferent && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">Postal Address</h4>
              <div className="space-y-4">
                <SoftInput
                  label="Street Address"
                  required
                  placeholder="123 Main Street"
                  value={customer.prPostalStreet || ""}
                  onChange={(e) => handleChange("prPostalStreet", e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SoftInput
                    label="City/Suburb"
                    required
                    placeholder="Melbourne"
                    value={customer.prPostalCity || ""}
                    onChange={(e) => handleChange("prPostalCity", e.target.value)}
                  />
                  <SoftSelect
                    label="State"
                    required
                    options={[{ value: "", label: "Select" }, ...STATES]}
                    value={customer.prPostalState || ""}
                    onChange={(e) => handleChange("prPostalState", e.target.value)}
                  />
                  <SoftInput
                    label="Postcode"
                    required
                    placeholder="3000"
                    value={customer.prPostalPostcode || ""}
                    onChange={(e) => handleChange("prPostalPostcode", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Continue */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 hidden sm:flex">
          <Lock className="w-4 h-4" />
          Your information is encrypted and secure
        </p>
        <PrimaryButton onClick={nextStep} disabled={!isValid()} className="flex-1 sm:flex-none">
          Continue to Partner Details
        </PrimaryButton>
      </div>
    </div>
  );
};
