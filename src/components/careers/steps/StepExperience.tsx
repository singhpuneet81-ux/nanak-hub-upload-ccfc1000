import React from "react";
import { Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobApplicationData } from "../JobApplicationModal";

type Props = {
  data: JobApplicationData;
  errors: Record<string, string>;
  update: (fields: Partial<JobApplicationData>) => void;
};

const EXPERIENCE_LEVELS = ["", "0-1 years", "1-2 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"];

const QUALIFICATION_OPTIONS = [
  { value: "yes", label: "Yes, I have all required qualifications", desc: "CA/CPA or relevant certifications" },
  { value: "in_progress", label: "In progress", desc: "Currently pursuing required qualifications" },
  { value: "equivalent", label: "Equivalent experience", desc: "I have equivalent skills through experience" },
];

const StepExperience: React.FC<Props> = ({ data, errors, update }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--cta)/0.1)] flex items-center justify-center">
        <Briefcase className="w-5 h-5 text-cta" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Professional Experience</h3>
        <p className="text-sm text-muted-foreground">Tell us about your background</p>
      </div>
    </div>

    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Current / Most Recent Role</Label>
        <Input placeholder="e.g., Senior Accountant at XYZ Firm" value={data.currentRole} onChange={(e) => update({ currentRole: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Years of Experience <span className="text-destructive">*</span></Label>
        <select
          value={data.yearsExperience}
          onChange={(e) => update({ yearsExperience: e.target.value })}
          className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select experience level</option>
          {EXPERIENCE_LEVELS.filter(Boolean).map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        {errors.yearsExperience && <p className="text-xs text-destructive">{errors.yearsExperience}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Relevant Experience <span className="text-destructive">*</span></Label>
        <p className="text-xs text-muted-foreground">Describe your relevant experience for this role. Be specific about projects, responsibilities, and achievements. (Minimum 50 characters)</p>
        <Textarea
          rows={5}
          placeholder="Example: I have 5 years of experience in corporate accounting, managing financial statements for companies with $50M+ revenue..."
          value={data.relevantExperience}
          onChange={(e) => update({ relevantExperience: e.target.value })}
        />
        <p className="text-xs text-muted-foreground text-right">{data.relevantExperience.length} characters</p>
        {errors.relevantExperience && <p className="text-xs text-destructive">{errors.relevantExperience}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Do you have the required qualifications for this role? <span className="text-destructive">*</span></Label>
        <div className="space-y-2">
          {QUALIFICATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ qualifications: opt.value })}
              className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                data.qualifications === opt.value
                  ? "border-cta bg-[hsl(var(--cta)/0.05)]"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  data.qualifications === opt.value ? "border-cta" : "border-muted-foreground/40"
                }`}>
                  {data.qualifications === opt.value && <div className="w-2 h-2 rounded-full bg-cta" />}
                </div>
                <div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.qualifications && <p className="text-xs text-destructive">{errors.qualifications}</p>}
      </div>

      {data.qualifications === "equivalent" && (
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Please elaborate on your qualifications</Label>
          <Textarea rows={3} value={data.qualificationsDetail} onChange={(e) => update({ qualificationsDetail: e.target.value })} />
          {errors.qualificationsDetail && <p className="text-xs text-destructive">{errors.qualificationsDetail}</p>}
        </div>
      )}
    </div>
  </div>
);

export default StepExperience;
