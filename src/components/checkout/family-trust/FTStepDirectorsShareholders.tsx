import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Info, Users, Plus, Minus, AlertTriangle, CalendarIcon } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { validateTFN, validateEmail, validatePhone } from "@/utils/validation";

interface Person {
  fullName: string;
  dob: string;
  tfn: string;
  email: string;
  phone: string;
  address: string;
}

interface FTStepDirectorsShareholdersProps {
  onNext: () => void;
  onBack: () => void;
}

export const FTStepDirectorsShareholders: React.FC<FTStepDirectorsShareholdersProps> = ({
  onNext,
  onBack,
}) => {
  const { updateCustomer, customer } = useCheckout();

  const [directors, setDirectors] = useState<Person[]>(
    customer.directors || [{ fullName: "", dob: "", tfn: "", email: "", phone: "", address: "" }]
  );

  const [shareholders, setShareholders] = useState<Person[]>(
    customer.shareholders || [{ fullName: "", dob: "", tfn: "", email: "", phone: "", address: "" }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addDirector = () => {
    setDirectors([...directors, { fullName: "", dob: "", tfn: "", email: "", phone: "", address: "" }]);
  };

  const removeDirector = () => {
    if (directors.length > 1) {
      setDirectors(directors.slice(0, -1));
    }
  };

  const updateDirector = (index: number, field: keyof Person, value: string) => {
    const updated = [...directors];
    updated[index] = { ...updated[index], [field]: value };
    setDirectors(updated);
    // Inline validation
    const key = `d_${index}_${field}`;
    let error: string | null = null;
    if (field === "tfn") error = validateTFN(value);
    else if (field === "email") error = validateEmail(value);
    else if (field === "phone") error = value.trim() ? validatePhone(value) : null;
    if (error) setErrors(prev => ({ ...prev, [key]: error! }));
    else setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  const addShareholder = () => {
    setShareholders([...shareholders, { fullName: "", dob: "", tfn: "", email: "", phone: "", address: "" }]);
  };

  const removeShareholder = () => {
    if (shareholders.length > 1) {
      setShareholders(shareholders.slice(0, -1));
    }
  };

  const updateShareholder = (index: number, field: keyof Person, value: string) => {
    const updated = [...shareholders];
    updated[index] = { ...updated[index], [field]: value };
    setShareholders(updated);
    // Inline validation
    const key = `s_${index}_${field}`;
    let error: string | null = null;
    if (field === "tfn") error = validateTFN(value);
    else if (field === "email") error = validateEmail(value);
    else if (field === "phone") error = value.trim() ? validatePhone(value) : null;
    if (error) setErrors(prev => ({ ...prev, [key]: error! }));
    else setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  const handleContinue = () => {
    updateCustomer({
      directors,
      shareholders,
    });
    onNext();
  };

  const isValid = directors.every(d => d.fullName && d.dob && d.tfn && d.email && d.phone && d.address && !errors[`d_${directors.indexOf(d)}_tfn`] && !errors[`d_${directors.indexOf(d)}_email`] && !errors[`d_${directors.indexOf(d)}_phone`]) &&
    shareholders.every(s => s.fullName && s.dob && s.tfn && s.email && s.phone && s.address && !errors[`s_${shareholders.indexOf(s)}_tfn`] && !errors[`s_${shareholders.indexOf(s)}_email`] && !errors[`s_${shareholders.indexOf(s)}_phone`]);

  const renderPersonForm = (
    person: Person,
    index: number,
    type: "Director" | "Shareholder",
    onUpdate: (index: number, field: keyof Person, value: string) => void
  ) => (
    <div key={index} className="border border-border rounded-xl p-4 space-y-4">
      <p className="font-medium text-foreground">{type} {index + 1}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name <span className="text-destructive">*</span></Label>
          <Input
            placeholder="Full Name"
            value={person.fullName}
            onChange={(e) => onUpdate(index, "fullName", e.target.value)}
            className={cn("h-12", errors[`${type === "Director" ? "d" : "s"}_${index}_fullName`] ? "border-destructive" : "")}
          />
          {errors[`${type === "Director" ? "d" : "s"}_${index}_fullName`] && (
            <p className="text-xs text-destructive">{errors[`${type === "Director" ? "d" : "s"}_${index}_fullName`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Date of Birth <span className="text-destructive">*</span></Label>
          <Popover modal>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("w-full h-12 justify-start text-left font-normal", !person.dob && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {person.dob || <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
              <Calendar
                mode="single"
                selected={person.dob ? new Date(person.dob.split("-").reverse().join("-")) : undefined}
                onSelect={(date) => date && onUpdate(index, "dob", format(date, "dd-MM-yyyy"))}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tax File Number (TFN) <span className="text-destructive">*</span></Label>
          <Input
            placeholder="123 456 789"
            value={person.tfn}
            onChange={(e) => onUpdate(index, "tfn", e.target.value)}
            className={cn("h-12", errors[`${type === "Director" ? "d" : "s"}_${index}_tfn`] ? "border-destructive" : "")}
          />
          <p className="text-xs text-muted-foreground">Required for ATO registration</p>
          {errors[`${type === "Director" ? "d" : "s"}_${index}_tfn`] && (
            <p className="text-destructive text-sm">{errors[`${type === "Director" ? "d" : "s"}_${index}_tfn`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Email <span className="text-destructive">*</span></Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={person.email}
            onChange={(e) => onUpdate(index, "email", e.target.value)}
            className={cn("h-12", errors[`${type === "Director" ? "d" : "s"}_${index}_email`] ? "border-destructive" : "")}
          />
          {errors[`${type === "Director" ? "d" : "s"}_${index}_email`] && (
            <p className="text-destructive text-sm">{errors[`${type === "Director" ? "d" : "s"}_${index}_email`]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone <span className="text-destructive">*</span></Label>
          <Input
            placeholder="0400 000 000"
            value={person.phone}
            onChange={(e) => onUpdate(index, "phone", e.target.value)}
            className={cn("h-12", errors[`${type === "Director" ? "d" : "s"}_${index}_phone`] ? "border-destructive" : "")}
          />
          {errors[`${type === "Director" ? "d" : "s"}_${index}_phone`] && (
            <p className="text-destructive text-sm">{errors[`${type === "Director" ? "d" : "s"}_${index}_phone`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Residential Address <span className="text-destructive">*</span></Label>
          <Input
            placeholder="123 Main Street, Suburb, VIC 3000"
            value={person.address}
            onChange={(e) => onUpdate(index, "address", e.target.value)}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Corporate Trustee Details</h2>
        <p className="text-muted-foreground mt-1">
          Provide details for the company directors and shareholders
        </p>
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-medium text-primary mb-2">Understanding Directors & Shareholders</p>
            <p className="text-foreground">
              <span className="font-medium">Director:</span> Manages the day-to-day operations of the trustee company (usually you or your spouse)
            </p>
            <p className="text-foreground mt-1">
              <span className="font-medium">Shareholder:</span> Owns the trustee company (can be the same person as director)
            </p>
            <p className="text-yellow-600 mt-2 flex items-center gap-1">
              💡 Tip: Most family trusts have 1-2 directors who are also shareholders
            </p>
          </div>
        </div>
      </div>

      {/* TFN Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-medium text-amber-800">ATO Requirement: TFN & Date of Birth</p>
            <p className="text-amber-700 mt-1">
              As per ATO regulations, we must collect Tax File Numbers (TFN) and dates of birth for all directors and shareholders when registering the corporate trustee company. This information is used for ABN/TFN registration and ASIC company registration.
            </p>
          </div>
        </div>
      </div>

      {/* Directors */}
      <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
      <Users className="text-primary" size={18} />
    </div>
    <h3 className="text-lg font-semibold text-foreground tracking-tight">
      Directors
    </h3>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={removeDirector}
      disabled={directors.length <= 1}
      className="counter-btn-inline-sm"
    >
      <Minus size={16} />
    </button>

    <span
      className="
        px-4 py-1.5 rounded-full
        bg-primary/10 border border-primary/20
        text-sm font-semibold text-primary
        min-w-[110px] text-center
      "
    >
      {directors.length} Director{directors.length > 1 ? "s" : ""}
    </span>

    <button
      onClick={addDirector}
      className="counter-btn-inline-sm"
    >
      <Plus size={16} />
    </button>
  </div>
</div>


        {directors.map((director, index) => 
          renderPersonForm(director, index, "Director", updateDirector)
        )}
      </div>

      {/* Shareholders */}
      <div className="space-y-4">
       <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
      <Users className="text-primary" size={18} />
    </div>
    <h3 className="text-lg font-semibold text-foreground tracking-tight">
      Shareholders
    </h3>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={removeShareholder}
      disabled={shareholders.length <= 1}
      className="
        w-9 h-9 rounded-lg border border-border
        flex items-center justify-center
        transition-all
        hover:bg-muted hover:scale-105
        disabled:opacity-40 disabled:cursor-not-allowed
      "
    >
      <Minus size={16} />
    </button>

    <span
      className="
        px-4 py-1.5 rounded-full
        bg-primary/10 border border-primary/20
        text-sm font-semibold text-primary
        min-w-[130px] text-center
      "
    >
      {shareholders.length} Shareholder{shareholders.length > 1 ? "s" : ""}
    </span>

    <button
      onClick={addShareholder}
      className="
        w-9 h-9 rounded-lg border border-border
        flex items-center justify-center
        transition-all
        hover:bg-muted hover:scale-105
      "
    >
      <Plus size={16} />
    </button>
  </div>
</div>


        {shareholders.map((shareholder, index) => 
          renderPersonForm(shareholder, index, "Shareholder", updateShareholder)
        )}
      </div>

      {/* Navigation buttons */}
      <div className="checkout-nav hidden md:flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl font-semibold bg-muted text-foreground flex items-center justify-center gap-2 hover:bg-muted/80 transition-all"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`
            flex-1 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all
            ${isValid 
              ? "bg-[hsl(var(--cta))] hover:bg-[hsl(var(--cta))]/90 disabled:opacity-50" 
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          Continue to Add-ons
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
