import React, { useState } from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { ArrowLeft, ArrowRight, Info, AlertTriangle, User, Building2, HelpCircle, CalendarIcon } from "lucide-react";
import { validateEmail, validateTFN, validateACN } from "@/utils/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Counter } from "@/components/checkout/Counter";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ShareholderType = "individual" | "company";

interface Shareholder {
  id: string;
  type: ShareholderType;
  fullName: string;
  dateOfBirth: string;
  tfn: string;
  email: string;
  phone: string;
  residentialAddress: string;
  numberOfShares: number;
  shareClass: string;
  companyName: string;
  acn: string;
  contactEmail: string;
  contactPhone: string;
}

const createEmptyShareholder = (): Shareholder => ({
  id: crypto.randomUUID(),
  type: "individual",
  fullName: "",
  dateOfBirth: "",
  tfn: "",
  email: "",
  phone: "",
  residentialAddress: "",
  numberOfShares: 0,
  shareClass: "Ordinary",
  companyName: "",
  acn: "",
  contactEmail: "",
  contactPhone: "",
});

const SHARE_CLASSES = [
  { value: "Ordinary", label: "Ordinary" },
  { value: "Class A", label: "Class A" },
  { value: "Class B", label: "Class B" },
  { value: "Preference", label: "Preference" },
];

interface CRStepShareholdersProps {
  onNext: () => void;
  onBack: () => void;
}

export const CRStepShareholders: React.FC<CRStepShareholdersProps> = ({ onNext, onBack }) => {
  const { customer, updateCustomer } = useCheckout();

  const [totalShares, setTotalShares] = useState<number>((customer?.crTotalShares as number) || 100);
  const [shareClassType, setShareClassType] = useState<string>((customer?.crShareClassType as string) || "Ordinary Shares");
  const [shareholders, setShareholders] = useState<Shareholder[]>(() => {
    const saved = customer?.crShareholders as Shareholder[] | undefined;
    return saved && saved.length > 0 ? saved : [createEmptyShareholder()];
  });
  const [appointSecretary, setAppointSecretary] = useState<boolean>((customer?.crAppointSecretary as boolean) || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shareholderCount = shareholders.length;
  const allocatedShares = shareholders.reduce((sum, s) => sum + (s.numberOfShares || 0), 0);

  const setShareholderCount = (count: number) => {
    if (count > shareholders.length) {
      const newShareholders = [...shareholders];
      for (let i = shareholders.length; i < count; i++) {
        newShareholders.push(createEmptyShareholder());
      }
      setShareholders(newShareholders);
    } else if (count < shareholders.length && count >= 1) {
      setShareholders(shareholders.slice(0, count));
    }
  };

  const updateShareholder = (id: string, field: keyof Shareholder, value: any) => {
    setShareholders((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    // Real-time validation for key fields
    if (typeof value === "string") {
      const key = `${id}_${field}`;
      let error: string | null = null;
      if (field === "email" || field === "contactEmail") {
        if (!value.trim()) error = "Required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email";
      } else if (field === "tfn") {
        error = validateTFN(value);
      } else if (field === "acn") {
        error = validateACN(value);
      }
      setErrors((prev) => {
        if (!error) { const next = { ...prev }; delete next[key]; return next; }
        return { ...prev, [key]: error };
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (totalShares < 1) newErrors.totalShares = "Must have at least 1 share";

    shareholders.forEach((sh) => {
      if (sh.type === "company") {
        if (!sh.companyName.trim()) newErrors[`${sh.id}_companyName`] = "Required";
        const acnErr = validateACN(sh.acn);
        if (acnErr) newErrors[`${sh.id}_acn`] = acnErr;
        if (!sh.contactEmail.trim()) {
          newErrors[`${sh.id}_contactEmail`] = "Required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sh.contactEmail)) {
          newErrors[`${sh.id}_contactEmail`] = "Invalid email";
        }
      } else {
        if (!sh.fullName.trim()) newErrors[`${sh.id}_fullName`] = "Required";
        if (!sh.dateOfBirth.trim()) newErrors[`${sh.id}_dateOfBirth`] = "Required";
        if (!sh.tfn.trim()) newErrors[`${sh.id}_tfn`] = "Required";
        if (!sh.email.trim()) {
          newErrors[`${sh.id}_email`] = "Required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sh.email)) {
          newErrors[`${sh.id}_email`] = "Invalid email";
        }
      }
      if (!sh.residentialAddress.trim()) newErrors[`${sh.id}_residentialAddress`] = "Required";
      if (sh.numberOfShares < 1) newErrors[`${sh.id}_numberOfShares`] = "Must hold at least 1 share";
    });

    if (allocatedShares > totalShares) {
      newErrors.allocation = `Allocated shares (${allocatedShares}) exceed total shares (${totalShares})`;
    }

    // Validate Company Secretary & Public Officer for multiple directors
    const directors = (customer?.crDirectors as any[]) || [];
    if (directors.length > 1 && appointSecretary) {
      if (!(customer?.crCompanySecretary as string)?.trim()) {
        newErrors.crCompanySecretary = "Please select a Company Secretary";
      }
      if (!(customer?.crPublicOfficer as string)?.trim()) {
        newErrors.crPublicOfficer = "Please select a Public Officer";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    // Auto-assign secretary & public officer if only one director
    const directors = (customer?.crDirectors as any[]) || [];
    if (directors.length <= 1) {
      const name = directors[0]?.fullName || "";
      updateCustomer({
        crTotalShares: totalShares,
        crShareClassType: shareClassType,
        crShareholders: shareholders,
        crAppointSecretary: true,
        crCompanySecretary: name,
        crPublicOfficer: name,
      });
    } else {
      updateCustomer({
        crTotalShares: totalShares,
        crShareClassType: shareClassType,
        crShareholders: shareholders,
        crAppointSecretary: appointSecretary,
      });
    }
    onNext();
  };

  const typeIcons: Record<ShareholderType, React.ReactNode> = {
    individual: <User size={16} />,
    company: <Building2 size={16} />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Shareholders & Officers</h2>
        <p className="text-muted-foreground mt-1">Who will own the company and manage compliance?</p>
      </div>

      {/* Info banners */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-muted-foreground">
            Shareholders own the company through shares. They can be individuals or companies.
          </p>
        </div>
      </div>

      <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-[hsl(var(--cta))] mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-muted-foreground">
            ATO requires TFN and DOB for individual shareholders for tax compliance.
          </p>
        </div>
      </div>

      {/* Total Number of Shares & Share Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            Total Number of Shares <span className="text-destructive">*</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-[hsl(220,40%,13%)] text-white border-none">
                <p className="text-sm">The total number of shares your company will issue. Most small businesses start with 100 shares. You can always issue more shares later.</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <Input
            type="number"
            value={totalShares || ""}
            onChange={(e) => setTotalShares(e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
            min={1}
            className={errors.totalShares ? "border-destructive" : ""}
          />
          {errors.totalShares && <p className="text-destructive text-sm mt-1">{errors.totalShares}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            Share Classes
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-[hsl(220,40%,13%)] text-white border-none">
                <p className="text-sm font-medium mb-1">Ordinary Shares (Recommended):</p>
                <p className="text-sm">95% of Australian companies use only ordinary shares. Each share has equal voting rights and dividend entitlements. This is the simplest and most common structure.</p>
                <p className="text-xs text-yellow-300 mt-2">💡 Unless you have specific legal or tax advice to use multiple share classes, we recommend using ordinary shares only.</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <Select value={shareClassType} onValueChange={setShareClassType}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ordinary Shares">Ordinary Shares</SelectItem>
              <SelectItem value="Multiple Classes">Multiple Classes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[hsl(var(--success))] mt-1 flex items-center gap-1">
            ✓ 95% of companies choose ordinary shares
          </p>
        </div>
      </div>

      {/* Shares Allocated tracker */}
      <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50">
        <span className="text-sm font-medium text-foreground">Shares Allocated:</span>
        <span className={`text-sm font-semibold ${allocatedShares > totalShares ? "text-destructive" : "text-foreground"}`}>
          {allocatedShares} / {totalShares}
        </span>
      </div>
      {errors.allocation && <p className="text-destructive text-sm">{errors.allocation}</p>}

      {/* Number of Shareholders */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Number of Shareholders <span className="text-destructive">*</span>
        </label>
        <Counter
          value={shareholderCount}
          onChange={setShareholderCount}
          min={1}
          max={10}
          label=""
        />
      </div>

      {/* Shareholders list */}
      <div className="space-y-6">
        {shareholders.map((shareholder, index) => (
          <div key={shareholder.id} className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Shareholder {index + 1}</h3>
            </div>

            {/* Shareholder Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Shareholder Type <span className="text-destructive">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={14} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs bg-[hsl(220,40%,13%)] text-white border-none">
                    <p className="text-sm font-medium mb-2">Shareholder Types:</p>
                    <p className="text-sm"><strong>Individual:</strong> A person who owns shares in their own name. Most common for small businesses and family companies.</p>
                    <p className="text-sm mt-1"><strong>Company:</strong> A corporate shareholder. Used when another company owns shares in this company.</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["individual", "company"] as ShareholderType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateShareholder(shareholder.id, "type", type)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      shareholder.type === type
                        ? "border-primary bg-[hsl(var(--card-selected-bg))] text-primary"
                        : "border-border hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    {typeIcons[type]}
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {shareholder.type === "company" ? (
                <>
                  {/* Company Name & ACN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Company Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={shareholder.companyName}
                        onChange={(e) => updateShareholder(shareholder.id, "companyName", e.target.value)}
                        placeholder="Company Pty Ltd"
                        className={errors[`${shareholder.id}_companyName`] ? "border-destructive" : ""}
                      />
                      {errors[`${shareholder.id}_companyName`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_companyName`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        ACN <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={shareholder.acn}
                        onChange={(e) => updateShareholder(shareholder.id, "acn", e.target.value)}
                        placeholder="123 456 789"
                        className={errors[`${shareholder.id}_acn`] ? "border-destructive" : ""}
                      />
                      {errors[`${shareholder.id}_acn`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_acn`]}</p>}
                    </div>
                  </div>

                  {/* Registered Address */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Registered Address <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={shareholder.residentialAddress}
                      onChange={(e) => updateShareholder(shareholder.id, "residentialAddress", e.target.value)}
                      placeholder="Full street address including suburb, state and postcode"
                      rows={2}
                      className={errors[`${shareholder.id}_residentialAddress`] ? "border-destructive" : ""}
                    />
                    {errors[`${shareholder.id}_residentialAddress`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_residentialAddress`]}</p>}
                  </div>

                  {/* Contact Email & Contact Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Contact Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        value={shareholder.contactEmail}
                        onChange={(e) => updateShareholder(shareholder.id, "contactEmail", e.target.value)}
                        placeholder="contact@company.com"
                        className={errors[`${shareholder.id}_contactEmail`] ? "border-destructive" : ""}
                      />
                      {errors[`${shareholder.id}_contactEmail`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_contactEmail`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Contact Phone</label>
                      <Input
                        value={shareholder.contactPhone}
                        onChange={(e) => updateShareholder(shareholder.id, "contactPhone", e.target.value)}
                        placeholder="04XX XXX XXX"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={shareholder.fullName}
                      onChange={(e) => updateShareholder(shareholder.id, "fullName", e.target.value)}
                      placeholder="Full legal name"
                      className={errors[`${shareholder.id}_fullName`] ? "border-destructive" : ""}
                    />
                    {errors[`${shareholder.id}_fullName`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_fullName`]}</p>}
                  </div>

                  {/* DOB & TFN (individual only) */}
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
                              !shareholder.dateOfBirth && "text-muted-foreground",
                              errors[`${shareholder.id}_dateOfBirth`] && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {shareholder.dateOfBirth || <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                          <Calendar
                            mode="single"
                            selected={shareholder.dateOfBirth ? new Date(shareholder.dateOfBirth.split("-").reverse().join("-")) : undefined}
                            onSelect={(date) => date && updateShareholder(shareholder.id, "dateOfBirth", format(date, "dd-MM-yyyy"))}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors[`${shareholder.id}_dateOfBirth`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_dateOfBirth`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Tax File Number (TFN) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={shareholder.tfn}
                        onChange={(e) => updateShareholder(shareholder.id, "tfn", e.target.value)}
                        placeholder="123 456 789"
                        className={errors[`${shareholder.id}_tfn`] ? "border-destructive" : ""}
                      />
                      {errors[`${shareholder.id}_tfn`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_tfn`]}</p>}
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Residential Address <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={shareholder.residentialAddress}
                      onChange={(e) => updateShareholder(shareholder.id, "residentialAddress", e.target.value)}
                      placeholder="Full street address including suburb, state and postcode"
                      rows={2}
                      className={errors[`${shareholder.id}_residentialAddress`] ? "border-destructive" : ""}
                    />
                    {errors[`${shareholder.id}_residentialAddress`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_residentialAddress`]}</p>}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        value={shareholder.email}
                        onChange={(e) => updateShareholder(shareholder.id, "email", e.target.value)}
                        placeholder="email@example.com"
                        className={errors[`${shareholder.id}_email`] ? "border-destructive" : ""}
                      />
                      {errors[`${shareholder.id}_email`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_email`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                      <Input
                        value={shareholder.phone}
                        onChange={(e) => updateShareholder(shareholder.id, "phone", e.target.value)}
                        placeholder="04XX XXX XXX"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Shares & Share Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    Number of Shares <span className="text-destructive">*</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle size={14} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-[hsl(220,40%,13%)] text-white border-none">
                        <p className="text-sm">The number of shares this shareholder will hold. Total allocated shares cannot exceed the total number of shares issued.</p>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  <Input
                    type="number"
                    value={shareholder.numberOfShares || ""}
                    onChange={(e) => updateShareholder(shareholder.id, "numberOfShares", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                    min={0}
                    className={errors[`${shareholder.id}_numberOfShares`] ? "border-destructive" : ""}
                  />
                  {errors[`${shareholder.id}_numberOfShares`] && <p className="text-destructive text-sm mt-1">{errors[`${shareholder.id}_numberOfShares`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    Share Class
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle size={14} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-[hsl(220,40%,13%)] text-white border-none">
                        <p className="text-sm">The class of shares allocated to this shareholder. Ordinary shares are the most common and recommended for most businesses.</p>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  <Select
                    value={shareholder.shareClass}
                    onValueChange={(val) => updateShareholder(shareholder.id, "shareClass", val)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHARE_CLASSES.map((sc) => (
                        <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[hsl(var(--success))] mt-1 flex items-center gap-1">
                    ✓ 95% of companies choose ordinary shares
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Company Secretary & Public Officer */}
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Company Secretary & Public Officer</h3>
        </div>

        {/* Info about roles */}
        <div className="bg-[hsl(var(--cta)/0.07)] border border-[hsl(var(--cta)/0.2)] rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="text-[hsl(var(--cta))] mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-medium text-foreground text-sm">About These Roles</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Public Officer:</strong> Required by the ATO for tax purposes. Responsible for ensuring the company meets its tax obligations. Can be a director or another person.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Company Secretary:</strong> Optional for proprietary limited companies. Maintains company records, lodges documents with ASIC, and manages corporate governance. Often a director serves in this role.
              </p>
            </div>
          </div>
        </div>

      {(() => {
          const directors = (customer?.crDirectors as any[]) || [];
          const directorList = directors
            .map((d: any, i: number) => ({
              id: `director_${d.id}`,
              label: d.fullName || `Director ${i + 1}`,
            }))
            .filter((d) => d.label.trim() !== "");

          if (directors.length <= 1) {
            const personName = directorList[0]?.label || "The sole director";
            return (
              <div className="bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">
                  ✓ <strong>{personName}</strong> is automatically the Company Secretary & Public Officer
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  As the sole director, they are automatically appointed to both roles.
                </p>
              </div>
            );
          }

          // Multiple directors — let user choose separately
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="appointSecretary"
                  checked={appointSecretary}
                  onCheckedChange={(checked) => setAppointSecretary(!!checked)}
                  className="mt-0.5"
                />
                <div>
                  <label htmlFor="appointSecretary" className="text-sm font-medium text-foreground cursor-pointer">
                    Appoint Company Secretary & Public Officer from your directors
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">If unchecked, the first director will automatically serve in both roles</p>
                </div>
              </div>

              {appointSecretary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Secretary */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Company Secretary <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={(customer?.crCompanySecretary as string) || ""}
                      onValueChange={(val) => updateCustomer({ crCompanySecretary: val })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a director" />
                      </SelectTrigger>
                      <SelectContent>
                        {directorList.map((person) => (
                          <SelectItem key={person.id} value={person.label}>
                            {person.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.crCompanySecretary && <p className="text-destructive text-sm mt-1">{errors.crCompanySecretary}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Maintains company records & ASIC filings</p>
                  </div>

                  {/* Public Officer */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Public Officer <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={(customer?.crPublicOfficer as string) || ""}
                      onValueChange={(val) => updateCustomer({ crPublicOfficer: val })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a director" />
                      </SelectTrigger>
                      <SelectContent>
                        {directorList.map((person) => (
                          <SelectItem key={person.id} value={person.label}>
                            {person.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.crPublicOfficer && <p className="text-destructive text-sm mt-1">{errors.crPublicOfficer}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Responsible for ATO tax obligations</p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Navigation */}
      <div className="checkout-nav flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={handleContinue} disabled={shareholders.length === 0} className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--cta))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Continue to Add-ons <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
