import React, { useState } from "react";
import {
  ArrowLeft,
  Lock,
  Upload,
  Building2,
  Users,
  Sparkles,
  Pencil,
  CreditCard,
  Check,
} from "lucide-react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckoutLoader } from "@/components/checkout/shared/CheckoutLoader";
import { usePricingPackages } from "@/hooks/usePricingPackages";

interface UTStepPaymentProps {
  onBack: () => void;
  goToStep: (step: number) => void;
}

export const UTStepPayment: React.FC<UTStepPaymentProps> = ({
  onBack,
  goToStep,
}) => {
  const { customer, selections, updateCustomer } = useCheckout();
  const { packages, serviceMeta } = usePricingPackages();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signature
  const [signatureText, setSignatureText] = useState(customer?.utSignature || "");


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(files)]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!signatureText.trim()) {
      newErrors.signature = "Signature is required";
    }
    if (!declarationAccepted) {
      newErrors.declaration = "You must accept the declaration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const { submitCheckout } = await import("@/utils/submitCheckout");
        await submitCheckout({
          serviceKey: "unit_trust",
          customer: { ...customer },
          selections: { ...selections },
          pricing: {
            baseSetupFee,
            businessNameTotal,
            gstFee,
            registeredOfficeFee,
            accountingFee,
            payrollFee,
            subtotal,
            gst: gstAmount,
            total,
          },
        });
      } catch {
        setIsSubmitting(false);
      }
    }
  };

  // Calculate totals for display
  const baseSetupFee = packages.unit_trust.foundation.price;
  const bnServiceFee = packages.business_name.foundation.price;
  const businessNameEnabled = customer?.businessNameAddon === true;
  const businessNameTerm = customer?.businessNameTerm || "1_year";
  const businessNameTotal = businessNameEnabled
    ? bnServiceFee + (businessNameTerm === "3_years" ? 104 : 47)
    : 0;
  const gstEnabled = customer?.gstAddon === true;
  const gstFee = gstEnabled ? packages.gst.foundation.price : 0;
  const registeredOfficeEnabled = customer?.registeredOfficeAddon === true;
  const registeredOfficeFee = registeredOfficeEnabled ? 220 : 0;

  const hasAccounting = selections.package === "registration_plus_accounting";
  const billingFrequency = customer?.billingFrequency || "annual";
  const revenueBracket = customer?.revenueBracket || "0-100k";

  const getAccountingPrice = () => {
    const selectedPlanId = customer?.accountingPlan || "essential";
    const packagePlans = (serviceMeta?.["unit_trust"] as any)?.packagePlans;
    
    if (packagePlans?.plans) {
      const plan = packagePlans.plans.find((p: any) => p.id === selectedPlanId);
      if (plan?.tierPricing?.[revenueBracket]) {
        const tp = plan.tierPricing[revenueBracket];
        return { monthly: Math.round((tp.standard || 0) / 12), annual: tp.standard || 0, bundle: tp.bundle || 0 };
      }
      if (plan?.tierPricing) {
        const firstKey = Object.keys(plan.tierPricing)[0];
        if (firstKey) {
          const tp = plan.tierPricing[firstKey];
          return { monthly: Math.round((tp.standard || 0) / 12), annual: tp.standard || 0, bundle: tp.bundle || 0 };
        }
      }
    }
    return { monthly: 0, annual: 0, bundle: 0 };
  };

  const accountingPrices = getAccountingPrice();
  const accountingFee = hasAccounting
    ? billingFrequency === "annual"
      ? (accountingPrices.bundle || accountingPrices.annual)
      : accountingPrices.annual
    : 0;

  const payrollEnabled = customer?.payrollEnabled === true;
  const staffCount = customer?.staffCount || 0;
  const payrollFee = payrollEnabled ? staffCount * 120 : 0;

  const subtotal =
    baseSetupFee +
    businessNameTotal +
    gstFee +
    registeredOfficeFee +
    accountingFee +
    payrollFee;
  // ASIC fees are GST-free - exclude BN ASIC fee from taxable amount
  const bnAsicFee = businessNameEnabled ? (businessNameTerm === "3_years" ? 104 : 47) : 0;
  const gstAmount = Math.round((subtotal - bnAsicFee) * 0.1);
  const total = subtotal + gstAmount;

  const getBusinessActivityLabel = (value: string) => {
    const activities: Record<string, string> = {
      property: "Property Investment",
      shares: "Share Trading/Investment",
      import_export: "Import/Export",
      consulting: "Consulting Services",
      retail: "Retail Trade",
      construction: "Construction",
      manufacturing: "Manufacturing",
      technology: "Technology/IT Services",
      healthcare: "Healthcare Services",
      hospitality: "Hospitality/Food Services",
      other: "Other",
    };
    return activities[value] || value;
  };

  const getUnitClassLabel = (value: string) => {
    const classes: Record<string, string> = {
      ordinary: "Ordinary Units",
      class_a: "Class A (Priority Income)",
      class_b: "Class B (Capital Growth)",
      class_c: "Class C (Special Purpose)",
    };
    return classes[value] || value;
  };

  return (
    <>
      <CheckoutLoader visible={isSubmitting} />
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Review & Payment
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your details and complete payment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trust Details */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold">Trust Details</h4>
            </div>
            <button
              onClick={() => goToStep(1)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Trust:</span>{" "}
              {customer?.unitTrustName || "Not provided"}
            </p>
            <p>
              <span className="text-muted-foreground">Trustee:</span>{" "}
              {customer?.corporateTrusteeName || "Not provided"}
            </p>
            <p>
              <span className="text-muted-foreground">Activity:</span>{" "}
              {getBusinessActivityLabel(customer?.primaryBusinessActivity || "")}
            </p>
          </div>
        </div>

        {/* Unitholders */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold">Unitholders</h4>
            </div>
            <button
              onClick={() => goToStep(2)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Total Units:</span>{" "}
              {customer?.totalUnits || 100}
            </p>
            <p>
              <span className="text-muted-foreground">Unit Classes:</span>{" "}
              {getUnitClassLabel(customer?.defaultUnitClass || "ordinary")}
            </p>
            <p>
              <span className="text-muted-foreground">Unitholders:</span>{" "}
              {customer?.unitholders?.length || 0}
            </p>
          </div>
        </div>

        {/* Corporate Trustee */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold">Corporate Trustee</h4>
            </div>
            <button
              onClick={() => goToStep(3)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Directors:</span>{" "}
              {customer?.directors?.length || 0}
            </p>
            <p>
              <span className="text-muted-foreground">Shareholders:</span>{" "}
              {customer?.shareholders?.length || 0}
            </p>
          </div>
        </div>

        {/* Add-ons */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold">Add-ons</h4>
            </div>
            <button
              onClick={() => goToStep(4)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
          <div className="space-y-1 text-sm">
            {businessNameEnabled && (
              <p className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[hsl(var(--success))]" />
                Business Name Registration
              </p>
            )}
            {gstEnabled && (
              <p className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[hsl(var(--success))]" />
                GST Registration
              </p>
            )}
            {registeredOfficeEnabled && (
              <p className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[hsl(var(--success))]" />
                Registered Office Address
              </p>
            )}
            {hasAccounting && (
              <p className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[hsl(var(--success))]" />
                Accounting Package
              </p>
            )}
            {!businessNameEnabled &&
              !gstEnabled &&
              !registeredOfficeEnabled &&
              !hasAccounting && (
                <p className="text-muted-foreground">No add-ons selected</p>
              )}
          </div>
        </div>
      </div>

      {/* Upload ID Documents */}
      <div className="space-y-3">
        <Label>
          Upload ID Documents <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Please upload proof of identity for all directors and unitholders
          (Driver's License, Passport, or Medicare Card)
        </p>
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-medium">Click to upload documents</p>
          <p className="text-sm text-muted-foreground">
            or drag and drop files here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supported formats: PDF, JPG, PNG
          </p>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
              >
                <span>{file.name}</span>
                <button
                  onClick={() =>
                    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
                  }
                  className="text-destructive hover:underline text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature */}
      <div className="space-y-2">
        <Label>
          Signature <span className="text-destructive">*</span>
        </Label>
        <input
          type="text"
          value={signatureText}
          onChange={(e) => {
            const val = e.target.value.replace(/\b\w/g, (c: string) => c.toUpperCase());
            setSignatureText(val);
            updateCustomer({ utSignature: val });
          }}
          placeholder="Type your full name as signature"
          className="w-full h-11 px-4 border border-border rounded-lg text-sm bg-background italic focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {errors.signature && (
          <p className="text-xs text-destructive">{errors.signature}</p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Lock className="w-3 h-3" />
          By typing your name, you are providing a legal electronic signature
        </p>
      </div>

      {/* Declaration */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <h4 className="font-semibold">Declaration & Authorisation</h4>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="declaration"
            checked={declarationAccepted}
            onCheckedChange={(checked) =>
              setDeclarationAccepted(checked === true)
            }
            className="mt-1"
          />
          <div className="text-sm">
            <Label htmlFor="declaration" className="cursor-pointer">
              I acknowledge and declare that:
            </Label>
            <ul className="mt-2 space-y-1.5 text-muted-foreground list-disc list-inside">
              <li>
                All information provided in this application is true,{" "}
                <strong className="text-foreground">complete</strong>, and
                accurate to the best of my knowledge
              </li>
              <li>
                I have the authority to apply for this unit trust setup and
                corporate trustee registration on behalf of all parties named
              </li>
              <li>
                I authorize Nanak Accountants & Associates to act as my
                registered agent for ASIC and ATO purposes
              </li>
              <li>
                I understand that providing false or misleading information is a
                serious offense under the Corporations Act 2001
              </li>
              <li>
                I have reviewed all details and pricing in this application
                before proceeding with payment
              </li>
              <li>
                I consent to the collection, use, and disclosure of personal
                information in accordance with the Privacy Act 1988
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              By checking this box and completing payment, you are electronically
              signing this declaration and entering into a binding service
              agreement with{" "}
              <span className="text-primary">
                Nanak Accountants & Associates
              </span>
              .
            </p>
          </div>
        </div>
        {errors.declaration && (
          <p className="text-xs text-destructive">{errors.declaration}</p>
        )}
      </div>


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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="py-3.5 bg-[hsl(var(--cta))] hover:opacity-90 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        >
          <Lock size={18} />
          Complete Payment
        </button>
      </div>
    </div>
    </>
  );
};
