import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { validateTFNOptional } from "@/utils/validation";
import { ArrowLeft, ArrowRight, CalendarIcon, Info, Plus, User, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Trustee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  tfn: string;
  positionRole: string;
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
}

const AUSTRALIAN_STATES = [
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
];

const createEmptyTrustee = (): Trustee => ({
  id: crypto.randomUUID(),
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  tfn: "",
  positionRole: "",
  streetAddress: "",
  suburb: "",
  state: "",
  postcode: "",
});

interface CSStepTrusteesProps {
  onNext: () => void;
  onBack: () => void;
}

export const CSStepTrustees: React.FC<CSStepTrusteesProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [trustees, setTrustees] = useState<Trustee[]>(() => {
    const saved = customer?.trustees as Trustee[] | undefined;
    return saved && saved.length > 0 ? saved : [createEmptyTrustee()];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateTrustee = (id: string, field: keyof Trustee, value: string) => {
    setTrustees(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    if (field === "tfn") {
      const err = validateTFNOptional(value);
      setErrors(prev => {
        if (!err) { const next = { ...prev }; delete next[`${id}_tfn`]; return next; }
        return { ...prev, [`${id}_tfn`]: err };
      });
    }
  };

  const addTrustee = () => {
    setTrustees(prev => [...prev, createEmptyTrustee()]);
  };

  const removeTrustee = (id: string) => {
    if (trustees.length > 1) {
      setTrustees(prev => prev.filter(t => t.id !== id));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (trustees.length < 3) {
      newErrors.count = `You need at least 3 trustees (currently have ${trustees.length})`;
    }

    trustees.forEach((trustee, index) => {
      if (!trustee.firstName.trim()) {
        newErrors[`${trustee.id}_firstName`] = "Required";
      }
      if (!trustee.lastName.trim()) {
        newErrors[`${trustee.id}_lastName`] = "Required";
      }
      if (!trustee.email.trim()) {
        newErrors[`${trustee.id}_email`] = "Required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trustee.email)) {
        newErrors[`${trustee.id}_email`] = "Invalid email";
      }
      if (!trustee.dateOfBirth) {
        newErrors[`${trustee.id}_dateOfBirth`] = "Required";
      }
      if (!trustee.tfn.trim()) {
        newErrors[`${trustee.id}_tfn`] = "Required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    updateCustomer({ trustees });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Trustees</h2>
        <p className="text-muted-foreground mt-1">Provide details for responsible persons (minimum 3 required)</p>
      </div>

      {/* Requirements info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">Responsible Person Requirements</p>
            <p className="text-sm text-muted-foreground mt-1">
              Must be 18+, not disqualified by ACNC, and have proper authority to act. We conduct probity checks as required.
            </p>
          </div>
        </div>
      </div>

      {/* Trustees list */}
      <div className="space-y-6">
        {trustees.map((trustee, index) => (
          <div key={trustee.id} className="border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Trustee {index + 1}</h3>
              </div>
              {trustees.length > 1 && (
                <button
                  onClick={() => removeTrustee(trustee.id)}
                  className="text-destructive hover:text-destructive/80 p-1"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={trustee.firstName}
                    onChange={(e) => updateTrustee(trustee.id, "firstName", e.target.value)}
                    placeholder="First Name"
                    className={errors[`${trustee.id}_firstName`] ? "border-destructive" : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={trustee.lastName}
                    onChange={(e) => updateTrustee(trustee.id, "lastName", e.target.value)}
                    placeholder="Last Name"
                    className={errors[`${trustee.id}_lastName`] ? "border-destructive" : ""}
                  />
                </div>
              </div>

              {/* Contact row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    value={trustee.email}
                    onChange={(e) => updateTrustee(trustee.id, "email", e.target.value)}
                    placeholder="email@example.com"
                    className={errors[`${trustee.id}_email`] ? "border-destructive" : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                  <Input
                    value={trustee.phone}
                    onChange={(e) => updateTrustee(trustee.id, "phone", e.target.value)}
                    placeholder="04XX XXX XXX"
                  />
                </div>
              </div>

              {/* DOB & TFN row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          "w-full justify-start text-left font-normal",
                          !trustee.dateOfBirth && "text-muted-foreground",
                          errors[`${trustee.id}_dateOfBirth`] && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {trustee.dateOfBirth ? trustee.dateOfBirth : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={trustee.dateOfBirth ? new Date(trustee.dateOfBirth.split("-").reverse().join("-")) : undefined}
                        onSelect={(date) => date && updateTrustee(trustee.id, "dateOfBirth", format(date, "dd-MM-yyyy"))}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    TFN <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={trustee.tfn}
                    onChange={(e) => updateTrustee(trustee.id, "tfn", e.target.value)}
                    placeholder="XXX XXX XXX"
                    className={errors[`${trustee.id}_tfn`] ? "border-destructive" : ""}
                  />
                  {errors[`${trustee.id}_tfn`] && <p className="text-destructive text-sm mt-1">{errors[`${trustee.id}_tfn`]}</p>}
                </div>
              </div>

              {/* Position/Role */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Position/Role</label>
                <Input
                  value={trustee.positionRole}
                  onChange={(e) => updateTrustee(trustee.id, "positionRole", e.target.value)}
                  placeholder="e.g., Chairperson, Secretary, Treasurer"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Residential Address</label>
                <Input
                  value={trustee.streetAddress}
                  onChange={(e) => updateTrustee(trustee.id, "streetAddress", e.target.value)}
                  placeholder="Street address"
                  className="mb-3"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    value={trustee.suburb}
                    onChange={(e) => updateTrustee(trustee.id, "suburb", e.target.value)}
                    placeholder="Suburb"
                  />
                  <Select 
                    value={trustee.state} 
                    onValueChange={(val) => updateTrustee(trustee.id, "state", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUSTRALIAN_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={trustee.postcode}
                    onChange={(e) => updateTrustee(trustee.id, "postcode", e.target.value)}
                    placeholder="Postcode"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add another trustee */}
      <button
        onClick={addTrustee}
        className="w-full py-3 border-2 border-dashed border-[hsl(var(--cta))] text-[hsl(var(--cta))] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[hsl(var(--cta)/0.05)] transition-colors"
      >
        <Plus size={18} />
        Add Another Trustee
      </button>

      {/* Trustee count warning */}
      <p className={`text-sm ${trustees.length >= 3 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--cta))]"}`}>
        {trustees.length >= 3 
          ? `✓ You have ${trustees.length} trustees` 
          : `⚠ You need at least 3 trustees (currently have ${trustees.length})`
        }
      </p>

      {errors.count && <p className="text-destructive text-sm">{errors.count}</p>}

      {/* Navigation */}
      <div className="hidden md:flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleContinue} disabled={trustees.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
