import React from "react";
import { ShieldCheck, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { JobApplicationData } from "../JobApplicationModal";

type Props = {
  data: JobApplicationData;
  errors: Record<string, string>;
  update: (fields: Partial<JobApplicationData>) => void;
};

const WORK_RIGHTS = [
  { value: "citizen", label: "Australian Citizen / PR", desc: "No work restrictions" },
  { value: "visa", label: "Yes, on a valid work visa", desc: "Details to be verified" },
  { value: "sponsorship", label: "No, require sponsorship", desc: "Subject to visa eligibility" },
];

const RELOCATION = [
  { value: "yes", label: "Yes, I'm willing to relocate" },
  { value: "already", label: "I already live in the area" },
  { value: "no", label: "No, prefer remote work" },
];

const REFERENCES = [
  { value: "yes", label: "Yes, you may contact my references", desc: "With advance notice" },
  { value: "offer_only", label: "Only if offered the position", desc: "References available upon request" },
  { value: "no_current", label: "Please don't contact current employer", desc: "Other references available" },
];

const NOTICE_OPTIONS = ["Immediately", "1 week", "2 weeks", "1 month", "2 months", "3 months"];

const RadioGroup = ({ options, value, onChange, error }: { options: { value: string; label: string; desc?: string }[]; value: string; onChange: (v: string) => void; error?: string }) => (
  <div className="space-y-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`w-full text-left p-3.5 rounded-xl border-2 transition-colors ${
          value === opt.value ? "border-cta bg-[hsl(var(--cta)/0.05)]" : "border-border hover:border-muted-foreground/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${value === opt.value ? "border-cta" : "border-muted-foreground/40"}`}>
            {value === opt.value && <div className="w-2 h-2 rounded-full bg-cta" />}
          </div>
          <div>
            <p className="font-semibold text-sm">{opt.label}</p>
            {opt.desc && <p className="text-xs text-muted-foreground">{opt.desc}</p>}
          </div>
        </div>
      </button>
    ))}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const StepScreening: React.FC<Props> = ({ data, errors, update }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--cta)/0.1)] flex items-center justify-center">
        <ShieldCheck className="w-5 h-5 text-cta" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Screening Questions</h3>
        <p className="text-sm text-muted-foreground">Final few questions to complete your application</p>
      </div>
    </div>

    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Do you have the legal right to work in Australia? <span className="text-destructive">*</span></Label>
        <RadioGroup options={WORK_RIGHTS} value={data.workRights} onChange={(v) => update({ workRights: v })} error={errors.workRights} />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Are you willing to relocate if required?</Label>
        <RadioGroup options={RELOCATION} value={data.relocation} onChange={(v) => update({ relocation: v })} error={errors.relocation} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">What is your current notice period? <span className="text-destructive">*</span></Label>
        <select value={data.noticePeriod} onChange={(e) => update({ noticePeriod: e.target.value })} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select notice period</option>
          {NOTICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {errors.noticePeriod && <p className="text-xs text-destructive">{errors.noticePeriod}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Are you happy for us to contact your references? <span className="text-destructive">*</span></Label>
        <RadioGroup options={REFERENCES} value={data.references} onChange={(v) => update({ references: v })} error={errors.references} />
      </div>

      {/* Privacy */}
      <div className="rounded-xl border border-border bg-[hsl(var(--muted)/0.3)] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Privacy & Consent</p>
        </div>
        <p className="text-xs text-muted-foreground">
          By submitting this application, you consent to Nanak Accountants & Associates collecting, storing, and processing your personal information for recruitment purposes in accordance with Australian Privacy Principles.
        </p>
        <p className="text-xs text-cta">
          Your information will be securely stored and only shared with relevant hiring managers. You can request access to or deletion of your data at any time.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            checked={data.privacyConsent}
            onCheckedChange={(c) => update({ privacyConsent: !!c })}
          />
          <span className="text-sm">I agree to the Privacy & Consent terms</span>
        </div>
        {errors.privacyConsent && <p className="text-xs text-destructive">{errors.privacyConsent}</p>}
      </div>
    </div>
  </div>
);

export default StepScreening;
