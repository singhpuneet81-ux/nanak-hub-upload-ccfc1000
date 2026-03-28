import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { BackButton, PrimaryButton } from "@/components/checkout/Buttons";
import { Building2, Info, Plus, X } from "lucide-react";

const STATES = [
  { value: "", label: "Select State" },
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
];

export const BTStepTrustee: React.FC = () => {
  const { customer, updateCustomer, nextStep, prevStep } = useCheckout();

  const directors: string[] = customer.btDirectors || [""];
  const shareholders: string[] = customer.btShareholders || [""];

  const addDirector = () => updateCustomer({ btDirectors: [...directors, ""] });
  const removeDirector = (i: number) => {
    const updated = directors.filter((_, idx) => idx !== i);
    updateCustomer({ btDirectors: updated.length ? updated : [""] });
  };
  const updateDirector = (i: number, val: string) => {
    const updated = [...directors];
    updated[i] = val;
    updateCustomer({ btDirectors: updated });
  };

  const addShareholder = () => updateCustomer({ btShareholders: [...shareholders, ""] });
  const removeShareholder = (i: number) => {
    const updated = shareholders.filter((_, idx) => idx !== i);
    updateCustomer({ btShareholders: updated.length ? updated : [""] });
  };
  const updateShareholder = (i: number, val: string) => {
    const updated = [...shareholders];
    updated[i] = val;
    updateCustomer({ btShareholders: updated });
  };

  const isValid = () => {
    return (
      (customer.btTrusteeCompanyName || "").trim() !== "" &&
      directors.some((d: string) => d.trim() !== "") &&
      shareholders.some((s: string) => s.trim() !== "") &&
      (customer.btAddressLine1 || "").trim() !== "" &&
      (customer.btCity || "").trim() !== "" &&
      (customer.btState || "") !== "" &&
      (customer.btPostcode || "").trim() !== ""
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="content-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Corporate Trustee Details</h2>
            <p className="text-sm text-muted-foreground">Company that will act as Bare Trust trustee</p>
          </div>
        </div>

        {/* Info */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Corporate Trustee - ATO Best Practice
          </h4>
          <p className="text-sm text-muted-foreground mt-2">
            The Bare Trust trustee holds <strong><u>legal title only</u></strong> and has <strong>no discretion</strong> over the property. For compliance and
            asset protection, we require a <strong><u>corporate trustee</u></strong> for all Bare Trust setups. This is commonly the same company
            that acts as your SMSF trustee.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <SoftInput
              label="Trustee Company Name"
              required
              placeholder="Smith Family Superannuation Pty Ltd"
              value={customer.btTrusteeCompanyName || ""}
              onChange={(e) => updateCustomer({ btTrusteeCompanyName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Full legal name of the company (e.g., 'Smith Family Superannuation Pty Ltd')</p>
          </div>

          {/* Directors */}
          <div>
            <label className="form-label">
              Directors of Trustee Company <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">List all directors - typically the SMSF members (ATO requirement)</p>
            {directors.map((d: string, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className="soft-input flex-1"
                  placeholder={`Director ${i + 1} Full Name`}
                  value={d}
                  onChange={(e) => updateDirector(i, e.target.value)}
                />
                {directors.length > 1 && (
                  <button type="button" onClick={() => removeDirector(i)} className="text-destructive hover:text-destructive/80 p-2">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addDirector} className="text-sm text-destructive font-medium hover:underline flex items-center gap-1 mt-1">
              <Plus className="w-4 h-4" /> Add Another Director
            </button>
          </div>

          {/* Shareholders */}
          <div>
            <label className="form-label">
              Shareholders of Trustee Company <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">List all shareholders - typically the SMSF members (ATO requirement)</p>
            {shareholders.map((s: string, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className="soft-input flex-1"
                  placeholder={`Shareholder ${i + 1} Full Name`}
                  value={s}
                  onChange={(e) => updateShareholder(i, e.target.value)}
                />
                {shareholders.length > 1 && (
                  <button type="button" onClick={() => removeShareholder(i)} className="text-destructive hover:text-destructive/80 p-2">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addShareholder} className="text-sm text-destructive font-medium hover:underline flex items-center gap-1 mt-1">
              <Plus className="w-4 h-4" /> Add Another Shareholder
            </button>
          </div>

          {/* Registered Address */}
          <div className="pt-2">
            <h3 className="font-semibold text-foreground mb-3">Registered Address</h3>
            <div className="space-y-3">
              <SoftInput
                label="Street Address Line 1"
                required
                placeholder="123 Main Street"
                value={customer.btAddressLine1 || ""}
                onChange={(e) => updateCustomer({ btAddressLine1: e.target.value })}
              />
              <SoftInput
                label="Street Address Line 2"
                placeholder="Unit 5 (Optional)"
                value={customer.btAddressLine2 || ""}
                onChange={(e) => updateCustomer({ btAddressLine2: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SoftInput
                  label="City/Suburb"
                  required
                  placeholder="Melbourne"
                  value={customer.btCity || ""}
                  onChange={(e) => updateCustomer({ btCity: e.target.value })}
                />
                <SoftSelect
                  label="State"
                  required
                  options={STATES}
                  value={customer.btState || ""}
                  onChange={(e) => updateCustomer({ btState: e.target.value })}
                />
                <SoftInput
                  label="Postcode"
                  required
                  placeholder="3000"
                  value={customer.btPostcode || ""}
                  onChange={(e) => updateCustomer({ btPostcode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <BackButton onClick={prevStep} className="sm:w-32" />
        <PrimaryButton onClick={nextStep} disabled={!isValid()} className="flex-1">
          Continue to Loan Details
        </PrimaryButton>
      </div>
    </div>
  );
};
