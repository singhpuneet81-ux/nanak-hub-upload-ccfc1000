import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Info, Users, Plus, Minus, HelpCircle } from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateEmail, validatePhone, validateACN } from "@/utils/validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Unitholder {
  id: string;
  type: "individual" | "company";
  fullName: string;
  email: string;
  phone: string;
  numberOfUnits: number;
  unitClass: string;
  // Company fields
  companyName?: string;
  acn?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface UTStepUnitholdersProps {
  onNext: () => void;
  onBack: () => void;
}

const unitClasses = [
  { value: "ordinary", label: "Ordinary Units" },
  { value: "class_a", label: "Class A (Priority Income)" },
  { value: "class_b", label: "Class B (Capital Growth)" },
  { value: "class_c", label: "Class C (Special Purpose)" },
];

export const UTStepUnitholders: React.FC<UTStepUnitholdersProps> = ({
  onNext,
  onBack,
}) => {
  const { customer, updateCustomer } = useCheckout();

  const [totalUnits, setTotalUnits] = useState(
    customer?.totalUnits || 100
  );
  const [selectedUnitClass, setSelectedUnitClass] = useState(
    customer?.defaultUnitClass || "ordinary"
  );
  const [unitholders, setUnitholders] = useState<Unitholder[]>(
    customer?.unitholders || [
      {
        id: "1",
        type: "individual",
        fullName: "",
        email: "",
        phone: "",
        numberOfUnits: 0,
        unitClass: "ordinary",
      },
      {
        id: "2",
        type: "individual",
        fullName: "",
        email: "",
        phone: "",
        numberOfUnits: 0,
        unitClass: "ordinary",
      },
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate allocated units
  const allocatedUnits = unitholders.reduce(
    (sum, uh) => sum + (uh.numberOfUnits || 0),
    0
  );
  const remainingUnits = totalUnits - allocatedUnits;

  useEffect(() => {
    updateCustomer({
      totalUnits,
      defaultUnitClass: selectedUnitClass,
      unitholders,
    });
  }, [totalUnits, selectedUnitClass, unitholders]);

  const addUnitholder = () => {
    setUnitholders([
      ...unitholders,
      {
        id: String(Date.now()),
        type: "individual",
        fullName: "",
        email: "",
        phone: "",
        numberOfUnits: 0,
        unitClass: "ordinary",
      },
    ]);
  };

  const removeUnitholder = () => {
    if (unitholders.length > 1) {
      setUnitholders(unitholders.slice(0, -1));
    }
  };

  const updateUnitholder = (index: number, updates: Partial<Unitholder>) => {
    const updated = [...unitholders];
    updated[index] = { ...updated[index], ...updates };
    setUnitholders(updated);
    // Inline validation
    Object.entries(updates).forEach(([field, value]) => {
      if (typeof value !== "string") return;
      let error: string | null = null;
      if (field === "email" || field === "contactEmail") error = validateEmail(value);
      else if (field === "phone" || field === "contactPhone") error = value.trim() ? validatePhone(value) : null;
      else if (field === "acn") error = validateACN(value);
      if (error !== null) {
        setErrors(prev => ({ ...prev, [`uh_${index}_${field}`]: error! }));
      } else {
        setErrors(prev => { const next = { ...prev }; delete next[`uh_${index}_${field}`]; return next; });
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (totalUnits < 1) {
      newErrors.totalUnits = "Total units must be at least 1";
    }

    unitholders.forEach((uh, index) => {
      if (uh.type === "individual") {
        if (!uh.fullName?.trim()) newErrors[`uh_${index}_fullName`] = "Full name is required";
        const emailErr = validateEmail(uh.email || "");
        if (emailErr) newErrors[`uh_${index}_email`] = emailErr;
        if (uh.phone?.trim()) {
          const phoneErr = validatePhone(uh.phone);
          if (phoneErr) newErrors[`uh_${index}_phone`] = phoneErr;
        }
      } else if (uh.type === "company") {
        if (!uh.companyName?.trim()) newErrors[`uh_${index}_companyName`] = "Company name is required";
        const acnErr = validateACN(uh.acn || "");
        if (acnErr) newErrors[`uh_${index}_acn`] = acnErr;
        const emailErr = validateEmail(uh.contactEmail || "");
        if (emailErr) newErrors[`uh_${index}_contactEmail`] = emailErr;
        if (uh.contactPhone?.trim()) {
          const phoneErr = validatePhone(uh.contactPhone);
          if (phoneErr) newErrors[`uh_${index}_contactPhone`] = phoneErr;
        }
      }

      if (uh.numberOfUnits < 0) {
        newErrors[`uh_${index}_units`] = "Units cannot be negative";
      }
    });

    if (allocatedUnits !== totalUnits) {
      newErrors.allocation = `Units allocated (${allocatedUnits}) must equal total units (${totalUnits})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Unitholder Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Who will hold units in this trust?
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[hsl(var(--cta))] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">About Unitholders</p>
            <p className="mt-1">
              Unitholders own specific units in the trust. Each unit represents
              a fixed proportion of the trust's income and capital. You can have
              different classes of units (A, B, etc.) with different rights.
            </p>
          </div>
        </div>
      </div>

      {/* Total Units & Unit Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Total Number of Units <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            value={totalUnits}
            onChange={(e) => setTotalUnits(parseInt(e.target.value) || 0)}
            className={errors.totalUnits ? "border-destructive" : ""}
          />
          {errors.totalUnits && (
            <p className="text-xs text-destructive">{errors.totalUnits}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Unit Classes</Label>
          <Select value={selectedUnitClass} onValueChange={setSelectedUnitClass}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitClasses.map((uc) => (
                <SelectItem key={uc.value} value={uc.value}>
                  {uc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Most trusts use ordinary units only
          </p>
        </div>
      </div>

      {/* Units allocation indicator */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">
          {allocatedUnits} / {totalUnits}
        </span>
        <span
          className={`text-sm ${remainingUnits === 0 ? "text-[hsl(var(--success))]" : "text-[hsl(var(--cta))]"}`}
        >
          💡 {remainingUnits} units remaining
        </span>
      </div>

      {errors.allocation && (
        <p className="text-sm text-destructive">{errors.allocation}</p>
      )}

      {/* Number of Unitholders */}
      <div className="space-y-2">
        <Label>
          Number of Unitholders <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={removeUnitholder}
            disabled={unitholders.length <= 1}
            className="counter-btn-inline"
          >
            <Minus size={18} />
          </button>
          <span className="text-lg font-semibold w-8 text-center">
            {unitholders.length}
          </span>
          <button
            type="button"
            onClick={addUnitholder}
            className="counter-btn-inline"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Unitholder Cards */}
      {unitholders.map((uh, index) => (
        <div
          key={uh.id}
          className="p-5 bg-card border border-border rounded-xl space-y-4"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h4 className="font-semibold">Unitholder {index + 1}</h4>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label>
              Unitholder Type <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {["individual", "company"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    updateUnitholder(index, {
                      type: type as Unitholder["type"],
                    })
                  }
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all capitalize ${
                    uh.type === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Fields */}
          {uh.type === "individual" && (
            <>
              <div className="space-y-2">
                <Label>
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Full legal name"
                  value={uh.fullName}
                  onChange={(e) =>
                    updateUnitholder(index, { fullName: e.target.value })
                  }
                  className={
                    errors[`uh_${index}_fullName`] ? "border-destructive" : ""
                  }
                />
                {errors[`uh_${index}_fullName`] && (
                  <p className="text-xs text-destructive">
                    {errors[`uh_${index}_fullName`]}
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
                    value={uh.email}
                    onChange={(e) =>
                      updateUnitholder(index, { email: e.target.value })
                    }
                    className={
                      errors[`uh_${index}_email`] ? "border-destructive" : ""
                    }
                  />
                  {errors[`uh_${index}_email`] && (
                    <p className="text-xs text-destructive">
                      {errors[`uh_${index}_email`]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="04XX XXX XXX"
                    value={uh.phone}
                    onChange={(e) =>
                      updateUnitholder(index, { phone: e.target.value })
                    }
                    className={errors[`uh_${index}_phone`] ? "border-destructive" : ""}
                  />
                  {errors[`uh_${index}_phone`] && (
                    <p className="text-xs text-destructive">{errors[`uh_${index}_phone`]}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Company Fields */}
          {uh.type === "company" && (
            <>
              <div className="space-y-2">
                <Label>
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g., ABC Pty Ltd"
                  value={uh.companyName || ""}
                  onChange={(e) =>
                    updateUnitholder(index, { companyName: e.target.value })
                  }
                  className={
                    errors[`uh_${index}_companyName`] ? "border-destructive" : ""
                  }
                />
                {errors[`uh_${index}_companyName`] && (
                  <p className="text-xs text-destructive">
                    {errors[`uh_${index}_companyName`]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    ACN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="XXX XXX XXX"
                    value={uh.acn || ""}
                    onChange={(e) =>
                      updateUnitholder(index, { acn: e.target.value })
                    }
                    className={
                      errors[`uh_${index}_acn`] ? "border-destructive" : ""
                    }
                  />
                  {errors[`uh_${index}_acn`] && (
                    <p className="text-xs text-destructive">
                      {errors[`uh_${index}_acn`]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Contact Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@company.com"
                    value={uh.contactEmail || ""}
                    onChange={(e) =>
                      updateUnitholder(index, { contactEmail: e.target.value })
                    }
                    className={
                      errors[`uh_${index}_contactEmail`]
                        ? "border-destructive"
                        : ""
                    }
                  />
                  {errors[`uh_${index}_contactEmail`] && (
                    <p className="text-xs text-destructive">
                      {errors[`uh_${index}_contactEmail`]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  placeholder="04XX XXX XXX"
                  value={uh.contactPhone || ""}
                  onChange={(e) =>
                    updateUnitholder(index, { contactPhone: e.target.value })
                  }
                  className={errors[`uh_${index}_contactPhone`] ? "border-destructive" : ""}
                />
                {errors[`uh_${index}_contactPhone`] && (
                  <p className="text-xs text-destructive">{errors[`uh_${index}_contactPhone`]}</p>
                )}
              </div>
            </>
          )}


          {/* Number of Units & Unit Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Number of Units <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={uh.numberOfUnits || ""}
                onChange={(e) =>
                  updateUnitholder(index, {
                    numberOfUnits: parseInt(e.target.value) || 0,
                  })
                }
                className={
                  errors[`uh_${index}_units`] ? "border-destructive" : ""
                }
              />
              {errors[`uh_${index}_units`] && (
                <p className="text-xs text-destructive">
                  {errors[`uh_${index}_units`]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Unit Class
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3">
                      <p className="font-medium mb-2">
                        Understanding Unit Classes:
                      </p>
                      <p className="text-xs mb-1">
                        <strong>Ordinary Units:</strong> Standard units with
                        equal rights to income and capital distributions
                      </p>
                      <p className="text-xs mb-1">
                        <strong>Class A:</strong> Priority income units - receive
                        income distributions before other classes
                      </p>
                      <p className="text-xs mb-1">
                        <strong>Class B:</strong> Capital growth units - designed
                        for long-term capital appreciation
                      </p>
                      <p className="text-xs mb-2">
                        <strong>Class C:</strong> Special purpose units -
                        customizable rights for specific investors
                      </p>
                      <p className="text-xs text-muted-foreground">
                        💡 Most unit trusts use Ordinary Units for simplicity
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select
                value={uh.unitClass}
                onValueChange={(value) =>
                  updateUnitholder(index, { unitClass: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitClasses.map((uc) => (
                    <SelectItem key={uc.value} value={uc.value}>
                      {uc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button
          onClick={onBack}
          className="py-3 border border-border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={handleNext}
          className="py-3 bg-[hsl(var(--cta))] hover:opacity-90 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        >
          Continue to Trustee Details
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
