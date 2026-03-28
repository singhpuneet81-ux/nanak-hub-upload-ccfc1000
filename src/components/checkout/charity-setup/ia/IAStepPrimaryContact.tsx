import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, CalendarIcon } from "lucide-react";
import { validateTFN } from "@/utils/validation";
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

interface IAStepPrimaryContactProps {
  onNext: () => void;
  onBack: () => void;
}

export const IAStepPrimaryContact: React.FC<IAStepPrimaryContactProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [firstName, setFirstName] = useState((customer?.iaContactFirstName as string) || "");
  const [lastName, setLastName] = useState((customer?.iaContactLastName as string) || "");
  const [email, setEmail] = useState((customer?.iaContactEmail as string) || "");
  const [phone, setPhone] = useState((customer?.iaContactPhone as string) || "");
  const [tfn, setTfn] = useState((customer?.iaContactTfn as string) || "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(() => {
    const saved = customer?.iaContactDob as string;
    return saved ? new Date(saved) : undefined;
  });
  const [residentialAddress, setResidentialAddress] = useState((customer?.iaContactAddress as string) || "");
  const [suburb, setSuburb] = useState((customer?.iaContactSuburb as string) || "");
  const [state, setState] = useState((customer?.iaContactState as string) || "");
  const [postcode, setPostcode] = useState((customer?.iaContactPostcode as string) || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!tfn.trim()) newErrors.tfn = "TFN is required";
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!residentialAddress.trim()) newErrors.residentialAddress = "Residential address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isFormValid = !!(firstName.trim() && lastName.trim() && email.trim() && phone.trim() && tfn.trim() && dateOfBirth && residentialAddress.trim());
  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({
      iaContactFirstName: firstName,
      iaContactLastName: lastName,
      iaContactEmail: email,
      iaContactPhone: phone,
      iaContactTfn: tfn,
      iaContactDob: dateOfBirth ? format(dateOfBirth, "dd-MM-yyyy") : "",
      iaContactAddress: residentialAddress,
      iaContactSuburb: suburb,
      iaContactState: state,
      iaContactPostcode: postcode,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Primary Contact Person</h2>
        <p className="text-muted-foreground mt-1">Main contact for all association correspondence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            First Name <span className="text-destructive">*</span>
          </label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={errors.firstName ? "border-destructive" : ""} />
          {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Last Name <span className="text-destructive">*</span>
          </label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className={errors.lastName ? "border-destructive" : ""} />
          {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Email Address <span className="text-destructive">*</span>
        </label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? "border-destructive" : ""} />
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Phone Number <span className="text-destructive">*</span>
        </label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04XX XXX XXX" className={errors.phone ? "border-destructive" : ""} />
        {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Tax File Number (TFN) <span className="text-destructive">*</span>
        </label>
        <Input
          value={tfn}
          onChange={(e) => {
            setTfn(e.target.value);
            const err = validateTFN(e.target.value);
            setErrors(prev => {
              if (!err) { const next = { ...prev }; delete next.tfn; return next; }
              return { ...prev, tfn: err };
            });
          }}
          placeholder="XXX XXX XXX"
          className={errors.tfn ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">Required for ATO registration and DGR endorsement eligibility</p>
        {errors.tfn && <p className="text-destructive text-sm mt-1">{errors.tfn}</p>}
      </div>

      <div>
        <label className="form-label">
          Date of Birth <span className="text-destructive">*</span>
        </label>
        <Popover modal>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "soft-input w-full flex items-center gap-2 text-left",
                !dateOfBirth && "text-muted-foreground",
                errors.dateOfBirth && "border-destructive"
              )}
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              {dateOfBirth ? format(dateOfBirth, "dd-MM-yyyy") : "dd-mm-yyyy"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
            <Calendar
              mode="single"
              selected={dateOfBirth}
              onSelect={setDateOfBirth}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {errors.dateOfBirth && <p className="text-destructive text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Residential Address <span className="text-destructive">*</span>
        </label>
        <Input value={residentialAddress} onChange={(e) => setResidentialAddress(e.target.value)} placeholder="Street address" className={errors.residentialAddress ? "border-destructive" : ""} />
        {errors.residentialAddress && <p className="text-destructive text-sm mt-1">{errors.residentialAddress}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="Suburb" />
        <Select value={state} onValueChange={setState}>
          <SelectTrigger>
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            {AUSTRALIAN_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="Postcode" maxLength={4} />
      </div>

      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} disabled={!isFormValid} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue to Committee <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
