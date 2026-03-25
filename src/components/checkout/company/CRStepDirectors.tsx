import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Info, Plus, Trash2, User, AlertTriangle, HelpCircle, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Counter } from "@/components/checkout/Counter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { validateEmail, validatePhone, validateTFN } from "@/utils/validation";

interface Director {
  id: string;
  fullName: string;
  dateOfBirth: string;
  tfn: string;
  email: string;
  phone: string;
  residentialAddress: string;
  isAustralianResident: boolean;
  hasDirectorId: boolean;
  directorIdNumber: string;
}

const createEmptyDirector = (): Director => ({
  id: crypto.randomUUID(),
  fullName: "",
  dateOfBirth: "",
  tfn: "",
  email: "",
  phone: "",
  residentialAddress: "",
  isAustralianResident: true,
  hasDirectorId: false,
  directorIdNumber: "",
});

interface CRStepDirectorsProps {
  onNext: () => void;
  onBack: () => void;
}

export const CRStepDirectors: React.FC<CRStepDirectorsProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [directors, setDirectors] = useState<Director[]>(() => {
    const saved = customer?.crDirectors as Director[] | undefined;
    return saved && saved.length > 0 ? saved : [createEmptyDirector()];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const directorCount = directors.length;

  const setDirectorCount = (count: number) => {
    if (count > directors.length) {
      const newDirectors = [...directors];
      for (let i = directors.length; i < count; i++) {
        newDirectors.push(createEmptyDirector());
      }
      setDirectors(newDirectors);
    } else if (count < directors.length && count >= 1) {
      setDirectors(directors.slice(0, count));
    }
  };

  const updateDirector = (id: string, field: keyof Director, value: any) => {
    const updated = directors.map((d) => (d.id === id ? { ...d, [field]: value } : d));
    setDirectors(updated);
    // Real-time validation for key fields
    if (typeof value === "string") {
      const key = `${id}_${field}`;
      let error: string | null = null;
      if (field === "email") error = validateEmail(value);
      else if (field === "phone") error = validatePhone(value);
      else if (field === "tfn") error = validateTFN(value);
      setErrors((prev) => {
        if (!error) { const next = { ...prev }; delete next[key]; return next; }
        return { ...prev, [key]: error };
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const hasAustralianResident = directors.some((d) => d.isAustralianResident);
    if (!hasAustralianResident) {
      newErrors.resident = "At least one director must be an Australian resident";
    }

    directors.forEach((dir) => {
      if (!dir.fullName.trim()) newErrors[`${dir.id}_fullName`] = "Required";
      if (!dir.dateOfBirth.trim()) newErrors[`${dir.id}_dateOfBirth`] = "Required";
      const tfnErr = validateTFN(dir.tfn);
      if (tfnErr) newErrors[`${dir.id}_tfn`] = tfnErr;
      const emailErr = validateEmail(dir.email);
      if (emailErr) newErrors[`${dir.id}_email`] = emailErr;
      const phoneErr = validatePhone(dir.phone || "");
      if (phoneErr) newErrors[`${dir.id}_phone`] = phoneErr;
      if (!dir.residentialAddress.trim()) newErrors[`${dir.id}_residentialAddress`] = "Required";
      if (dir.hasDirectorId && !dir.directorIdNumber.trim()) newErrors[`${dir.id}_directorIdNumber`] = "Required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({ crDirectors: directors });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Directors</h2>
        <p className="text-muted-foreground mt-1">Who will be directing the company?</p>
      </div>

      {/* Director Requirements */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">Director Requirements</p>
            <ul className="text-sm text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
              <li>Minimum 1 director required (Proprietary companies)</li>
              <li>Must be at least 18 years old</li>
              <li>At least one director must be an Australian resident</li>
              <li>Directors need a Director ID from ABRS (we can help with this)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ATO Requirement */}
      <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-[hsl(var(--cta))] mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">ATO Requirement: TFN & Date of Birth</p>
            <p className="text-sm text-muted-foreground mt-1">
              As per ATO regulations, we must collect Tax File Numbers (TFN) and dates of birth for all directors when registering a company. This information is used for ABN/TFN registration and ASIC company registration.
            </p>
          </div>
        </div>
      </div>

      {/* Number of Directors */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Number of Directors <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-3">At least 1 director must be an Australian resident</p>
        <Counter
          value={directorCount}
          onChange={setDirectorCount}
          min={1}
          max={10}
          label=""
        />
      </div>

      {errors.resident && (
        <p className="text-destructive text-sm">{errors.resident}</p>
      )}

      {/* Directors list */}
      <div className="space-y-6">
        {directors.map((director, index) => (
          <div key={director.id} className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Director {index + 1}</h3>
            </div>

            <div className="space-y-4">
              {/* Full Legal Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Full Legal Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={director.fullName}
                  onChange={(e) => updateDirector(director.id, "fullName", e.target.value)}
                  placeholder="As per official ID"
                  className={errors[`${director.id}_fullName`] ? "border-destructive" : ""}
                />
                {errors[`${director.id}_fullName`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_fullName`]}</p>}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !director.dateOfBirth && "text-muted-foreground",
                        errors[`${director.id}_dateOfBirth`] && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {director.dateOfBirth ? director.dateOfBirth : <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={director.dateOfBirth ? new Date(director.dateOfBirth.split("-").reverse().join("-")) : undefined}
                      onSelect={(date) => {
                        updateDirector(director.id, "dateOfBirth", date ? format(date, "dd-MM-yyyy") : "");
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {errors[`${director.id}_dateOfBirth`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_dateOfBirth`]}</p>}
              </div>

              {/* TFN */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tax File Number (TFN) <span className="text-destructive">*</span>
                </label>
                <Input
                  value={director.tfn}
                  onChange={(e) => updateDirector(director.id, "tfn", e.target.value)}
                  placeholder="123 456 789"
                  className={errors[`${director.id}_tfn`] ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground mt-1">Required for ATO and ASIC registration</p>
                {errors[`${director.id}_tfn`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_tfn`]}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    value={director.email}
                    onChange={(e) => updateDirector(director.id, "email", e.target.value)}
                    placeholder="email@example.com"
                    className={errors[`${director.id}_email`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_email`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_email`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={director.phone}
                    onChange={(e) => updateDirector(director.id, "phone", e.target.value)}
                    placeholder="04XX XXX XXX"
                    className={errors[`${director.id}_phone`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_phone`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_phone`]}</p>}
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Residential Address <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={director.residentialAddress}
                  onChange={(e) => updateDirector(director.id, "residentialAddress", e.target.value)}
                  placeholder="Full street address including suburb, state and postcode"
                  rows={2}
                  className={errors[`${director.id}_residentialAddress`] ? "border-destructive" : ""}
                />
                {errors[`${director.id}_residentialAddress`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_residentialAddress`]}</p>}
              </div>

              {/* Australian Resident Checkbox */}
              <div className={`flex items-start gap-3 p-3 rounded-lg ${director.isAustralianResident ? "bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)]" : "border border-border"}`}>
                <Checkbox
                  id={`resident-${director.id}`}
                  checked={director.isAustralianResident}
                  onCheckedChange={(checked) => updateDirector(director.id, "isAustralianResident", !!checked)}
                  className="mt-0.5"
                />
                <div>
                  <label htmlFor={`resident-${director.id}`} className="text-sm font-medium text-foreground cursor-pointer">
                    This director is an Australian resident <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">At least one director must be an Australian resident</p>
                </div>
              </div>

              {/* Director ID Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`directorId-${director.id}`}
                  checked={director.hasDirectorId}
                  onCheckedChange={(checked) => updateDirector(director.id, "hasDirectorId", !!checked)}
                  className="mt-0.5"
                />
                <div>
                  <label htmlFor={`directorId-${director.id}`} className="text-sm font-medium text-foreground cursor-pointer">
                    This director already has a Director ID
                  </label>
                  {!director.hasDirectorId && (
                    <p className="text-xs text-[hsl(var(--cta))] mt-0.5 flex items-center gap-1">
                      💡 Don't have a Director ID? We'll help you apply for one as part of this registration.
                    </p>
                  )}
                </div>
              </div>

              {/* Director ID Input - shown when checkbox is checked */}
              {director.hasDirectorId && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Director ID Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={(director as any).directorIdNumber || ""}
                    onChange={(e) => updateDirector(director.id, "directorIdNumber" as any, e.target.value)}
                    placeholder="Enter your Director Identification Number"
                    className={errors[`${director.id}_directorIdNumber`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_directorIdNumber`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_directorIdNumber`]}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} disabled={directors.length === 0} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue to Shareholders <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
