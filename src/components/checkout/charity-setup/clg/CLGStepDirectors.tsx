import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, CalendarIcon, Info, Plus, Trash2, User } from "lucide-react";
import { validateTFNOptional } from "@/utils/validation";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Director {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tfn: string;
  dateOfBirth: string;
  residentialAddress: string;
}

const createEmptyDirector = (): Director => ({
  id: crypto.randomUUID(),
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  tfn: "",
  dateOfBirth: "",
  residentialAddress: "",
});

interface CLGStepDirectorsProps {
  onNext: () => void;
  onBack: () => void;
}

export const CLGStepDirectors: React.FC<CLGStepDirectorsProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [directors, setDirectors] = useState<Director[]>(() => {
    const saved = customer?.clgDirectors as Director[] | undefined;
    return saved && saved.length > 0 ? saved : [createEmptyDirector()];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateDirector = (id: string, field: keyof Director, value: string) => {
    setDirectors((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
    if (field === "tfn") {
      const err = validateTFNOptional(value);
      setErrors(prev => {
        if (!err) { const next = { ...prev }; delete next[`${id}_tfn`]; return next; }
        return { ...prev, [`${id}_tfn`]: err };
      });
    }
  };

  const addDirector = () => setDirectors((prev) => [...prev, createEmptyDirector()]);

  const removeDirector = (id: string) => {
    if (directors.length > 1) setDirectors((prev) => prev.filter((d) => d.id !== id));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (directors.length < 1) {
      newErrors.count = "At least 1 director is required";
    }

    directors.forEach((dir) => {
      if (!dir.firstName.trim()) newErrors[`${dir.id}_firstName`] = "Required";
      if (!dir.lastName.trim()) newErrors[`${dir.id}_lastName`] = "Required";
      if (!dir.email.trim()) {
        newErrors[`${dir.id}_email`] = "Required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dir.email)) {
        newErrors[`${dir.id}_email`] = "Invalid email";
      }
      if (!dir.phone.trim()) newErrors[`${dir.id}_phone`] = "Required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({ clgDirectors: directors });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Directors</h2>
        <p className="text-muted-foreground mt-1">Minimum 1 director required (best practice is 3 or more)</p>
      </div>

      {/* Info banner */}
      <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-[hsl(var(--cta))] mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">Director Requirements (ASIC & ACNC)</p>
            <p className="text-sm text-muted-foreground mt-1">
              All directors must be over 18, ordinarily reside in Australia, not be disqualified by ASIC or ACNC, and consent to act as a director. While ASIC requires a minimum of 1 director, best practice for charities is to have at least 3 directors to meet ACNC governance standards.
            </p>
          </div>
        </div>
      </div>

      {/* Directors list */}
      <div className="space-y-6">
        {directors.map((director, index) => (
          <div key={director.id} className="border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Director {index + 1}</h3>
              </div>
              {directors.length > 1 && (
                <button onClick={() => removeDirector(director.id)} className="text-destructive hover:text-destructive/80 p-1">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Name <span className="text-destructive">*</span></label>
                  <Input
                    value={director.firstName}
                    onChange={(e) => updateDirector(director.id, "firstName", e.target.value)}
                    className={errors[`${director.id}_firstName`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_firstName`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_firstName`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last Name <span className="text-destructive">*</span></label>
                  <Input
                    value={director.lastName}
                    onChange={(e) => updateDirector(director.id, "lastName", e.target.value)}
                    className={errors[`${director.id}_lastName`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_lastName`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_lastName`]}</p>}
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-destructive">*</span></label>
                  <Input
                    type="email"
                    value={director.email}
                    onChange={(e) => updateDirector(director.id, "email", e.target.value)}
                    className={errors[`${director.id}_email`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_email`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_email`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone <span className="text-destructive">*</span></label>
                  <Input
                    value={director.phone}
                    onChange={(e) => updateDirector(director.id, "phone", e.target.value)}
                    className={errors[`${director.id}_phone`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_phone`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_phone`]}</p>}
                </div>
              </div>

              {/* TFN & DOB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">TFN</label>
                  <Input
                    value={director.tfn}
                    onChange={(e) => updateDirector(director.id, "tfn", e.target.value)}
                    placeholder="XXX XXX XXX"
                    className={errors[`${director.id}_tfn`] ? "border-destructive" : ""}
                  />
                  {errors[`${director.id}_tfn`] && <p className="text-destructive text-sm mt-1">{errors[`${director.id}_tfn`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth</label>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !director.dateOfBirth && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {director.dateOfBirth ? director.dateOfBirth : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={director.dateOfBirth ? new Date(director.dateOfBirth.split("-").reverse().join("-")) : undefined}
                        onSelect={(date) => date && updateDirector(director.id, "dateOfBirth", format(date, "dd-MM-yyyy"))}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Residential Address</label>
                <Input
                  value={director.residentialAddress}
                  onChange={(e) => updateDirector(director.id, "residentialAddress", e.target.value)}
                  placeholder="Full residential address"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add another */}
      <button
        onClick={addDirector}
        className="w-full py-3 border-2 border-dashed border-[hsl(var(--cta))] text-[hsl(var(--cta))] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[hsl(var(--cta)/0.05)] transition-colors"
      >
        <Plus size={18} />
        + Add Another Director
      </button>

      {errors.count && <p className="text-destructive text-sm">{errors.count}</p>}

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} disabled={directors.length === 0} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue to Members <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
