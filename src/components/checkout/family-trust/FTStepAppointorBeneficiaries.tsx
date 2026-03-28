import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Info, Users, Plus, Minus, MapPin, Phone, Mail } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { validateEmail, validatePhone } from "@/utils/validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATES } from "@/config/yourDetails.config";

const states = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const relationships = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Grandchild",
  "Grandparent",
  "Other Family Member",
  "Business Partner",
];

interface Beneficiary {
  fullName: string;
  relationship: string;
  email: string;
  phone: string;
}

interface FTStepAppointorBeneficiariesProps {
  onNext: () => void;
  onBack: () => void;
}

export const FTStepAppointorBeneficiaries: React.FC<FTStepAppointorBeneficiariesProps> = ({
  onNext,
  onBack,
}) => {
  const { updateCustomer, customer } = useCheckout();

  // Appointor details
  const [firstName, setFirstName] = useState(customer.appointorFirstName || "");
  const [lastName, setLastName] = useState(customer.appointorLastName || "");
  const [email, setEmail] = useState(customer.appointorEmail || "");
  const [phone, setPhone] = useState(customer.appointorPhone || "");
  const [address, setAddress] = useState(customer.appointorAddress || "");
  const [suburb, setSuburb] = useState(customer.appointorSuburb || "");
  const [state, setState] = useState(customer.appointorState || "");
  const [postcode, setPostcode] = useState(customer.appointorPostcode || "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inline validation helper
  const validateFieldInline = (key: string, value: string) => {
    let error: string | null = null;
    if (key.includes("Email") || key.includes("email")) error = validateEmail(value);
    else if (key.includes("Phone") || key.includes("phone")) error = value.trim() ? validatePhone(value) : null;
    if (error) setErrors(prev => ({ ...prev, [key]: error! }));
    else setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  // Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
    customer.beneficiaries || [{ fullName: "", relationship: "", email: "", phone: "" }]
  );

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { fullName: "", relationship: "", email: "", phone: "" }]);
  };

  const removeBeneficiary = () => {
    if (beneficiaries.length > 1) {
      setBeneficiaries(beneficiaries.slice(0, -1));
    }
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string) => {
    const updated = [...beneficiaries];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiaries(updated);
    // Inline validation for beneficiary fields
    const key = `ben_${index}_${field}`;
    let error: string | null = null;
    if (field === "email") error = validateEmail(value);
    else if (field === "phone") error = value.trim() ? validatePhone(value) : null;
    if (error) setErrors(prev => ({ ...prev, [key]: error! }));
    else setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  // Auto-save to context so mobile bottom nav works
  useEffect(() => {
    updateCustomer({
      appointorFirstName: firstName,
      appointorLastName: lastName,
      appointorEmail: email,
      appointorPhone: phone,
      appointorAddress: address,
      appointorSuburb: suburb,
      appointorState: state,
      appointorPostcode: postcode,
      beneficiaries,
    });
  }, [firstName, lastName, email, phone, address, suburb, state, postcode, beneficiaries]);

  const handleContinue = () => {
    onNext();
  };

  const isValid = firstName && lastName && email && phone && address && suburb && state && postcode &&
    beneficiaries.every(b => b.fullName && b.relationship && b.email && b.phone);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Appointor & Beneficiaries</h2>
        <p className="text-muted-foreground mt-1">
          Provide details for the trust appointor and beneficiaries
        </p>
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Who is the Appointor?</p>
            <p className="text-foreground">
              The appointor is the person who has the power to appoint and remove trustees. This is typically the person establishing the trust. Think of them as the "controller" of the trust
            </p>
          </div>
        </div>
      </div>

      {/* Appointor Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="text-foreground" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Appointor Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
            <Input
              id="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); validateFieldInline("firstName", e.target.value); }}
              className={cn("h-12", errors.firstName ? "border-destructive" : "")}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
            <Input
              id="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); validateFieldInline("lastName", e.target.value); }}
              className={cn("h-12", errors.lastName ? "border-destructive" : "")}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); validateFieldInline("appointorEmail", e.target.value); }}
                className={cn("h-12 pl-10", errors.appointorEmail ? "border-destructive" : "")}
              />
            </div>
            {errors.appointorEmail && <p className="text-xs text-destructive">{errors.appointorEmail}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="phone"
                placeholder="0400 000 000"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); validateFieldInline("appointorPhone", e.target.value); }}
                className={cn("h-12 pl-10", errors.appointorPhone ? "border-destructive" : "")}
              />
            </div>
            {errors.appointorPhone && <p className="text-xs text-destructive">{errors.appointorPhone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Residential Address <span className="text-destructive">*</span></Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="address"
              placeholder="123 Main Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-12 pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="suburb">Suburb</Label>
            <Input
              id="suburb"
              placeholder="Suburb"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label>State / Territory <span className="text-destructive">*</span></Label>
            <div className="relative">
              <select
                value={state}
                onChange={(e) => { setState(e.target.value); updateCustomer({ appointorState: e.target.value }); }}
                className="h-12 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
              >
                <option value="">Select State</option>
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.96a.75.75 0 111.08 1.04l-4.24 4.53a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              placeholder="Postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
      <Users className="text-primary" size={18} />
    </div>
    <h3 className="text-lg font-semibold text-foreground tracking-tight">
      Beneficiaries
    </h3>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={removeBeneficiary}
      disabled={beneficiaries.length <= 1}
      className="counter-btn-inline-sm"
    >
      <Minus size={16} />
    </button>

    <span
      className="
        px-4 py-1.5 rounded-full
        bg-primary/10 border border-primary/20
        text-sm font-semibold text-primary
        min-w-[96px] text-center
      "
    >
      {beneficiaries.length} Person{beneficiaries.length > 1 ? "s" : ""}
    </span>

    <button
      onClick={addBeneficiary}
      className="counter-btn-inline-sm"
    >
      <Plus size={16} />
    </button>
  </div>
</div>


        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Beneficiaries</span> are individuals or entities who can receive distributions from the trust (e.g., children, spouse, other family members).
        </div>

        {/* Beneficiary forms */}
        {beneficiaries.map((beneficiary, index) => (
          <div key={index} className="border border-border rounded-xl p-4 space-y-4">
            <p className="font-medium text-foreground">Beneficiary {index + 1}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Full Name"
                  value={beneficiary.fullName}
                  onChange={(e) => updateBeneficiary(index, "fullName", e.target.value)}
                  className={cn("h-12", errors[`ben_${index}_fullName`] ? "border-destructive" : "")}
                />
                {errors[`ben_${index}_fullName`] && <p className="text-xs text-destructive">{errors[`ben_${index}_fullName`]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Relation to Appointor <span className="text-destructive">*</span></Label>
                <Select
                  value={beneficiary.relationship}
                  onValueChange={(v) => updateBeneficiary(index, "relationship", v)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={beneficiary.email}
                    onChange={(e) => updateBeneficiary(index, "email", e.target.value)}
                    className={cn("h-12 pl-10", errors[`ben_${index}_email`] ? "border-destructive" : "")}
                  />
                </div>
                {errors[`ben_${index}_email`] && <p className="text-xs text-destructive">{errors[`ben_${index}_email`]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="0400 000 000"
                    value={beneficiary.phone}
                    onChange={(e) => updateBeneficiary(index, "phone", e.target.value)}
                    className={cn("h-12 pl-10", errors[`ben_${index}_phone`] ? "border-destructive" : "")}
                  />
                </div>
                {errors[`ben_${index}_phone`] && <p className="text-xs text-destructive">{errors[`ben_${index}_phone`]}</p>}
              </div>
            </div>
          </div>
        ))}
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
          Continue to Directors & Shareholders
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
