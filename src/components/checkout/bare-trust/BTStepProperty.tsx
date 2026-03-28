import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { BackButton, PrimaryButton } from "@/components/checkout/Buttons";
import { Home, MapPin, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

const STATES = [
  { value: "", label: "Select State" },
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

export const BTStepProperty: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const contractSigned = customer.btContractSigned || "";

  const isValid = () => {
    return (
      (customer.btPropertyAddress || "").trim() !== "" &&
      (customer.btPropertyState || "") !== "" &&
      (customer.btContractExchangeDate || "") !== "" &&
      (customer.btSettlementDate || "") !== "" &&
      contractSigned !== ""
    );
  };

  const handleDateSelect = (key: string, date: Date | undefined) => {
    if (date) {
      updateCustomer({ [key]: format(date, "dd-MM-yyyy") });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Home className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Property & Contract Details</h2>
            <p className="text-sm text-muted-foreground">Critical timing and location information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <SoftInput
              label="Property Address"
              required
              placeholder="e.g., 123 Collins Street, Melbourne VIC 3000"
              icon={<MapPin className="w-4 h-4" />}
              value={customer.btPropertyAddress || ""}
              onChange={(e) => updateCustomer({ btPropertyAddress: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Full street address of the property being purchased</p>
          </div>

          <SoftSelect
            label="State"
            required
            options={STATES}
            value={customer.btPropertyState || ""}
            onChange={(e) => updateCustomer({ btPropertyState: e.target.value })}
          />
          <p className="text-xs text-muted-foreground -mt-2">Which Australian state is the property located in?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contract Exchange Date */}
            <div>
              <label className="form-label">
                Contract Exchange Date <span className="text-destructive">*</span>
              </label>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !customer.btContractExchangeDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customer.btContractExchangeDate || "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      customer.btContractExchangeDate
                        ? new Date(customer.btContractExchangeDate.split("-").reverse().join("-"))
                        : undefined
                    }
                    onSelect={(d) => handleDateSelect("btContractExchangeDate", d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">When was/will the contract be exchanged?</p>
            </div>

            {/* Settlement Date */}
            <div>
              <label className="form-label">
                Settlement Date <span className="text-destructive">*</span>
              </label>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !customer.btSettlementDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customer.btSettlementDate || "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      customer.btSettlementDate
                        ? new Date(customer.btSettlementDate.split("-").reverse().join("-"))
                        : undefined
                    }
                    onSelect={(d) => handleDateSelect("btSettlementDate", d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">When is the property settlement scheduled?</p>
            </div>
          </div>

          {/* Contract signed? */}
          <div>
            <h3 className="font-semibold text-foreground mb-1">Has the contract already been signed?</h3>
            <p className="text-xs text-muted-foreground mb-3">This helps us understand where you are in the purchase process</p>
            <div className="grid grid-cols-2 gap-3">
              {["yes", "no"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateCustomer({ btContractSigned: val })}
                  className={cn(
                    "py-3 rounded-lg border-2 text-sm font-medium transition-all",
                    contractSigned === val
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-foreground hover:border-muted-foreground/40"
                  )}
                >
                  {val === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={nextStep} disabled={!isValid()} className="flex-1">
          Continue to SMSF Details
        </PrimaryButton>
      </div>
    </div>
  );
};
