import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Info, Plus, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const createEmptyMember = (): Member => ({
  id: crypto.randomUUID(),
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});

interface CLGStepMembersProps {
  onNext: () => void;
  onBack: () => void;
}

export const CLGStepMembers: React.FC<CLGStepMembersProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = customer?.clgMembers as Member[] | undefined;
    return saved && saved.length > 0 ? saved : [createEmptyMember()];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMember = (id: string, field: keyof Member, value: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const addMember = () => setMembers((prev) => [...prev, createEmptyMember()]);

  const removeMember = (id: string) => {
    if (members.length > 1) setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (members.length < 1) {
      newErrors.count = "At least 1 member is required";
    }

    members.forEach((member) => {
      if (!member.firstName.trim()) newErrors[`${member.id}_firstName`] = "Required";
      if (!member.lastName.trim()) newErrors[`${member.id}_lastName`] = "Required";
      if (!member.email.trim()) {
        newErrors[`${member.id}_email`] = "Required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        newErrors[`${member.id}_email`] = "Invalid email";
      }
      if (!member.phone.trim()) newErrors[`${member.id}_phone`] = "Required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateCustomer({ clgMembers: members });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Members</h2>
        <p className="text-muted-foreground mt-1">At least 1 member required (guarantors of the company)</p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm">About Members (Guarantors)</p>
            <p className="text-sm text-muted-foreground mt-1">
              In a company limited by guarantee, members provide a guarantee (typically $10-$100) rather than paying for shares. Members may vote on major company decisions as outlined in the constitution.
            </p>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="space-y-6">
        {members.map((member, index) => (
          <div key={member.id} className="border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Member {index + 1}</h3>
              </div>
              {members.length > 1 && (
                <button onClick={() => removeMember(member.id)} className="text-destructive hover:text-destructive/80 p-1">
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Name <span className="text-destructive">*</span></label>
                  <Input
                    value={member.firstName}
                    onChange={(e) => updateMember(member.id, "firstName", e.target.value)}
                    className={errors[`${member.id}_firstName`] ? "border-destructive" : ""}
                  />
                  {errors[`${member.id}_firstName`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_firstName`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last Name <span className="text-destructive">*</span></label>
                  <Input
                    value={member.lastName}
                    onChange={(e) => updateMember(member.id, "lastName", e.target.value)}
                    className={errors[`${member.id}_lastName`] ? "border-destructive" : ""}
                  />
                  {errors[`${member.id}_lastName`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_lastName`]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-destructive">*</span></label>
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(member.id, "email", e.target.value)}
                    className={errors[`${member.id}_email`] ? "border-destructive" : ""}
                  />
                  {errors[`${member.id}_email`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_email`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone <span className="text-destructive">*</span></label>
                  <Input
                    value={member.phone}
                    onChange={(e) => updateMember(member.id, "phone", e.target.value)}
                    className={errors[`${member.id}_phone`] ? "border-destructive" : ""}
                  />
                  {errors[`${member.id}_phone`] && <p className="text-destructive text-sm mt-1">{errors[`${member.id}_phone`]}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add another */}
      <button
        onClick={addMember}
        className="w-full py-3 border-2 border-dashed border-[hsl(var(--cta))] text-[hsl(var(--cta))] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[hsl(var(--cta)/0.05)] transition-colors"
      >
        <Plus size={18} />
        + Add Another Member
      </button>

      {errors.count && <p className="text-destructive text-sm">{errors.count}</p>}

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} disabled={members.length === 0} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue to Details <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
