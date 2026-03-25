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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POSITIONS = [
  { value: "president", label: "President" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "vice_president", label: "Vice President" },
  { value: "committee_member", label: "Committee Member" },
];

interface CommitteeMember {
  id: string;
  position: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tfn: string;
  dateOfBirth: string;
}

const DEFAULT_MEMBERS: CommitteeMember[] = [
  { id: crypto.randomUUID(), position: "president", firstName: "", lastName: "", email: "", phone: "", tfn: "", dateOfBirth: "" },
  { id: crypto.randomUUID(), position: "secretary", firstName: "", lastName: "", email: "", phone: "", tfn: "", dateOfBirth: "" },
  { id: crypto.randomUUID(), position: "treasurer", firstName: "", lastName: "", email: "", phone: "", tfn: "", dateOfBirth: "" },
];

const createEmptyMember = (): CommitteeMember => ({
  id: crypto.randomUUID(),
  position: "committee_member",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  tfn: "",
  dateOfBirth: "",
});

interface IAStepCommitteeMembersProps {
  onNext: () => void;
  onBack: () => void;
}

export const IAStepCommitteeMembers: React.FC<IAStepCommitteeMembersProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [members, setMembers] = useState<CommitteeMember[]>(() => {
    const saved = customer?.iaCommitteeMembers as CommitteeMember[] | undefined;
    return saved && saved.length > 0 ? saved : DEFAULT_MEMBERS;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMember = (id: string, field: keyof CommitteeMember, value: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
    if (field === "tfn") {
      const err = validateTFNOptional(value);
      setErrors(prev => {
        if (!err) { const next = { ...prev }; delete next[`${id}_tfn`]; return next; }
        return { ...prev, [`${id}_tfn`]: err };
      });
    }
  };

  const addMember = () => setMembers((prev) => [...prev, createEmptyMember()]);

  const removeMember = (id: string) => {
    if (members.length > 3) setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const getPositionLabel = (pos: string) => POSITIONS.find((p) => p.value === pos)?.label || pos;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (members.length < 3) {
      newErrors.count = "Minimum 3 committee members required (President, Secretary, Treasurer)";
    }
    members.forEach((m) => {
      if (!m.position) newErrors[`${m.id}_position`] = "Required";
      if (!m.firstName.trim()) newErrors[`${m.id}_firstName`] = "Required";
      if (!m.lastName.trim()) newErrors[`${m.id}_lastName`] = "Required";
      if (!m.email.trim()) {
        newErrors[`${m.id}_email`] = "Required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) {
        newErrors[`${m.id}_email`] = "Invalid email";
      }
      if (!m.phone.trim()) newErrors[`${m.id}_phone`] = "Required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({ iaCommitteeMembers: members });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Committee Members</h2>
        <p className="text-muted-foreground mt-1">Minimum 3 committee members required (President, Secretary, Treasurer)</p>
      </div>

      <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-[hsl(var(--cta))] mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">ACNC Governance Requirements</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your committee (also called "board" or "responsible persons") must comply with ACNC Governance Standards. All committee members must be over 18, fit and proper persons, and act with reasonable care and diligence.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {members.map((member, index) => (
          <div key={member.id} className="border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <h3 className="font-semibold text-foreground">
                  Committee Member {index + 1} - {getPositionLabel(member.position)}
                </h3>
              </div>
              {members.length > 3 && (
                <button onClick={() => removeMember(member.id)} className="text-destructive hover:text-destructive/80 p-1">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Position</label>
                <Select value={member.position} onValueChange={(v) => updateMember(member.id, "position", v)}>
                  <SelectTrigger className={errors[`${member.id}_position`] ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Name <span className="text-destructive">*</span></label>
                  <Input value={member.firstName} onChange={(e) => updateMember(member.id, "firstName", e.target.value)} className={errors[`${member.id}_firstName`] ? "border-destructive" : ""} />
                  {errors[`${member.id}_firstName`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_firstName`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last Name <span className="text-destructive">*</span></label>
                  <Input value={member.lastName} onChange={(e) => updateMember(member.id, "lastName", e.target.value)} className={errors[`${member.id}_lastName`] ? "border-destructive" : ""} />
                  {errors[`${member.id}_lastName`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_lastName`]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-destructive">*</span></label>
                  <Input type="email" value={member.email} onChange={(e) => updateMember(member.id, "email", e.target.value)} className={errors[`${member.id}_email`] ? "border-destructive" : ""} />
                  {errors[`${member.id}_email`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_email`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone <span className="text-destructive">*</span></label>
                  <Input value={member.phone} onChange={(e) => updateMember(member.id, "phone", e.target.value)} className={errors[`${member.id}_phone`] ? "border-destructive" : ""} />
                  {errors[`${member.id}_phone`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_phone`]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">TFN</label>
                  <Input value={member.tfn} onChange={(e) => updateMember(member.id, "tfn", e.target.value)} placeholder="XXX XXX XXX" className={errors[`${member.id}_tfn`] ? "border-destructive" : ""} />
                  {errors[`${member.id}_tfn`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_tfn`]}</p>}
                </div>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn("soft-input w-full flex items-center gap-2 text-left", !member.dateOfBirth && "text-muted-foreground")}
                      >
                        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        {member.dateOfBirth ? member.dateOfBirth : "dd-mm-yyyy"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={member.dateOfBirth ? new Date(member.dateOfBirth.split("-").reverse().join("-")) : undefined}
                        onSelect={(date) => date && updateMember(member.id, "dateOfBirth", format(date, "dd-MM-yyyy"))}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addMember}
        className="w-full py-3 border-2 border-dashed border-[hsl(var(--cta))] text-[hsl(var(--cta))] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[hsl(var(--cta)/0.05)] transition-colors"
      >
        <Plus size={18} />
        + Add Another Committee Member
      </button>

      {errors.count && <p className="text-destructive text-sm">{errors.count}</p>}

      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} disabled={members.length === 0} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue to Registration <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
