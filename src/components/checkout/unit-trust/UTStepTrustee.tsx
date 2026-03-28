import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  AlertTriangle,
  User,
  Plus,
  Minus,
  CalendarIcon,
} from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { validateEmail, validatePhone, validateTFN } from "@/utils/validation";

interface Person {
  id: string;
  fullName: string;
  dateOfBirth: string;
  tfn: string;
  email: string;
  phone: string;
  residentialAddress: string;
}

interface UTStepTrusteeProps {
  onNext: () => void;
  onBack: () => void;
}

export const UTStepTrustee: React.FC<UTStepTrusteeProps> = ({
  onNext,
  onBack,
}) => {
  const { customer, updateCustomer } = useCheckout();

  const [directors, setDirectors] = useState<Person[]>(
    customer?.directors || [
      {
        id: "1",
        fullName: "",
        dateOfBirth: "",
        tfn: "",
        email: "",
        phone: "",
        residentialAddress: "",
      },
    ]
  );

  const [shareholders, setShareholders] = useState<Person[]>(
    customer?.shareholders || [
      {
        id: "1",
        fullName: "",
        dateOfBirth: "",
        tfn: "",
        email: "",
        phone: "",
        residentialAddress: "",
      },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    updateCustomer({ directors, shareholders });
  }, [directors, shareholders]);

  const addDirector = () => {
    setDirectors([
      ...directors,
      {
        id: String(Date.now()),
        fullName: "",
        dateOfBirth: "",
        tfn: "",
        email: "",
        phone: "",
        residentialAddress: "",
      },
    ]);
  };

  const removeDirector = () => {
    if (directors.length > 1) {
      setDirectors(directors.slice(0, -1));
    }
  };

  const updateDirector = (index: number, updates: Partial<Person>) => {
    const updated = [...directors];
    updated[index] = { ...updated[index], ...updates };
    setDirectors(updated);
    // Inline validation
    Object.entries(updates).forEach(([field, value]) => {
      if (typeof value !== "string") return;
      const key = `director_${index}_${field}`;
      let error: string | null = null;
      if (field === "email") error = validateEmail(value);
      else if (field === "phone") error = value.trim() ? validatePhone(value) : null;
      else if (field === "tfn") error = validateTFN(value);
      if (error) setErrors(prev => ({ ...prev, [key]: error! }));
      else setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    });
  };

  const addShareholder = () => {
    setShareholders([
      ...shareholders,
      {
        id: String(Date.now()),
        fullName: "",
        dateOfBirth: "",
        tfn: "",
        email: "",
        phone: "",
        residentialAddress: "",
      },
    ]);
  };

  const removeShareholder = () => {
    if (shareholders.length > 1) {
      setShareholders(shareholders.slice(0, -1));
    }
  };

  const updateShareholder = (index: number, updates: Partial<Person>) => {
    const updated = [...shareholders];
    updated[index] = { ...updated[index], ...updates };
    setShareholders(updated);
    // Inline validation
    Object.entries(updates).forEach(([field, value]) => {
      if (typeof value !== "string") return;
      const key = `shareholder_${index}_${field}`;
      let error: string | null = null;
      if (field === "email") error = validateEmail(value);
      else if (field === "phone") error = value.trim() ? validatePhone(value) : null;
      else if (field === "tfn") error = validateTFN(value);
      if (error) setErrors(prev => ({ ...prev, [key]: error! }));
      else setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    directors.forEach((d, i) => {
      if (!d.fullName?.trim()) newErrors[`director_${i}_fullName`] = "Full name is required";
      if (!d.dateOfBirth) newErrors[`director_${i}_dob`] = "Date of birth is required";
      const tfnErr = validateTFN(d.tfn || "");
      if (tfnErr) newErrors[`director_${i}_tfn`] = tfnErr;
      const emailErr = validateEmail(d.email || "");
      if (emailErr) newErrors[`director_${i}_email`] = emailErr;
      if (d.phone?.trim()) {
        const phoneErr = validatePhone(d.phone);
        if (phoneErr) newErrors[`director_${i}_phone`] = phoneErr;
      }
      if (!d.residentialAddress?.trim()) newErrors[`director_${i}_address`] = "Address is required";
    });

    shareholders.forEach((s, i) => {
      if (!s.fullName?.trim()) newErrors[`shareholder_${i}_fullName`] = "Full name is required";
      if (!s.dateOfBirth) newErrors[`shareholder_${i}_dob`] = "Date of birth is required";
      const tfnErr = validateTFN(s.tfn || "");
      if (tfnErr) newErrors[`shareholder_${i}_tfn`] = tfnErr;
      const emailErr = validateEmail(s.email || "");
      if (emailErr) newErrors[`shareholder_${i}_email`] = emailErr;
      if (s.phone?.trim()) {
        const phoneErr = validatePhone(s.phone);
        if (phoneErr) newErrors[`shareholder_${i}_phone`] = phoneErr;
      }
      if (!s.residentialAddress?.trim()) newErrors[`shareholder_${i}_address`] = "Address is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const renderPersonCard = (
    person: Person,
    index: number,
    type: "director" | "shareholder",
    updateFn: (index: number, updates: Partial<Person>) => void
  ) => {
    const prefix = `${type}_${index}`;
    const title = type === "director" ? "Director" : "Shareholder";

    return (
      <div
        key={person.id}
        className="p-5 bg-card border border-border rounded-xl space-y-4"
      >
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <h4 className="font-semibold">
            {title} {index + 1}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Full legal name"
              value={person.fullName}
              onChange={(e) => updateFn(index, { fullName: e.target.value })}
              className={errors[`${prefix}_fullName`] ? "border-destructive" : ""}
            />
            {errors[`${prefix}_fullName`] && (
              <p className="text-xs text-destructive">
                {errors[`${prefix}_fullName`]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !person.dateOfBirth && "text-muted-foreground",
                    errors[`${prefix}_dob`] && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {person.dateOfBirth || <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={person.dateOfBirth ? new Date(person.dateOfBirth.split("-").reverse().join("-")) : undefined}
                  onSelect={(date) => date && updateFn(index, { dateOfBirth: format(date, "dd-MM-yyyy") })}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors[`${prefix}_dob`] && (
              <p className="text-xs text-destructive">{errors[`${prefix}_dob`]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Tax File Number (TFN) <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="123 456 789"
            value={person.tfn}
            onChange={(e) => updateFn(index, { tfn: e.target.value })}
            className={errors[`${prefix}_tfn`] ? "border-destructive" : ""}
          />
          {errors[`${prefix}_tfn`] ? (
            <p className="text-xs text-destructive">{errors[`${prefix}_tfn`]}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Required for ATO and ASIC registration
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={person.email}
              onChange={(e) => updateFn(index, { email: e.target.value })}
              className={errors[`${prefix}_email`] ? "border-destructive" : ""}
            />
            {errors[`${prefix}_email`] && (
              <p className="text-xs text-destructive">
                {errors[`${prefix}_email`]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              type="tel"
              placeholder="04XX XXX XXX"
              value={person.phone}
              onChange={(e) => updateFn(index, { phone: e.target.value })}
              className={errors[`${prefix}_phone`] ? "border-destructive" : ""}
            />
            {errors[`${prefix}_phone`] && (
              <p className="text-xs text-destructive">{errors[`${prefix}_phone`]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Residential Address <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="Full street address"
            value={person.residentialAddress}
            onChange={(e) =>
              updateFn(index, { residentialAddress: e.target.value })
            }
            className={errors[`${prefix}_address`] ? "border-destructive" : ""}
          />
          {errors[`${prefix}_address`] && (
            <p className="text-xs text-destructive">
              {errors[`${prefix}_address`]}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Corporate Trustee Structure
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Directors and shareholders of the corporate trustee company
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[hsl(var(--cta))] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">About the Corporate Trustee</p>
            <p className="mt-1">
              The corporate trustee is a company that manages the unit trust.
              Directors control the company's operations, while shareholders own
              the company.
            </p>
          </div>
        </div>
      </div>

      {/* ATO Warning Box */}
      <div className="p-4 bg-[hsl(24_95%_53%/0.07)] border border-[hsl(24_95%_53%/0.2)] rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[hsl(var(--cta))] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">ATO Requirement: TFN & Date of Birth</p>
            <p className="mt-1">
              As per ATO regulations, we must collect Tax File Numbers (TFN) and
              dates of birth for all directors and shareholders when registering
              the corporate trustee company. This information is used for
              ABN/TFN registration and ASIC company registration.
            </p>
          </div>
        </div>
      </div>

      {/* Directors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Number of Directors <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Minimum 1 director required
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={removeDirector}
              disabled={directors.length <= 1}
              className="counter-btn-inline"
            >
              <Minus size={18} />
            </button>
            <span className="text-lg font-semibold w-8 text-center">
              {directors.length}
            </span>
            <button
              type="button"
              onClick={addDirector}
              className="counter-btn-inline"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {directors.map((director, index) =>
          renderPersonCard(director, index, "director", updateDirector)
        )}
      </div>

      {/* Shareholders Section */}
      <div className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">
              Number of Shareholders <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Minimum 1 shareholder required
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={removeShareholder}
              disabled={shareholders.length <= 1}
              className="counter-btn-inline"
            >
              <Minus size={18} />
            </button>
            <span className="text-lg font-semibold w-8 text-center">
              {shareholders.length}
            </span>
            <button
              type="button"
              onClick={addShareholder}
              className="counter-btn-inline"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {shareholders.map((shareholder, index) =>
          renderPersonCard(shareholder, index, "shareholder", updateShareholder)
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="checkout-nav flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <button
          onClick={onBack}
          className="py-3 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors sm:w-32"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 bg-[hsl(var(--cta))] hover:opacity-90 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        >
          Continue to Add-ons
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
