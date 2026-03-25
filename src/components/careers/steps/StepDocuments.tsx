import React, { useRef } from "react";
import { Upload, FileText, Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { JobApplicationData } from "../JobApplicationModal";

type Props = {
  data: JobApplicationData;
  errors: Record<string, string>;
  update: (fields: Partial<JobApplicationData>) => void;
};

const ACCEPT = ".pdf,.doc,.docx";

const UploadZone = ({
  label,
  file,
  onSelect,
  icon: Icon,
  error,
}: {
  label: string;
  file: File | null;
  onSelect: (f: File) => void;
  icon: React.ElementType;
  error?: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input ref={ref} type="file" accept={ACCEPT} className="hidden" onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:border-cta/50 ${
          error ? "border-destructive" : file ? "border-success bg-[hsl(var(--success)/0.04)]" : "border-border"
        }`}
      >
        <Icon className={`w-8 h-8 mx-auto mb-2 ${file ? "text-success" : "text-muted-foreground"}`} />
        <p className="font-semibold text-sm">{file ? file.name : label}</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB)</p>
      </button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

const StepDocuments: React.FC<Props> = ({ data, errors, update }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--cta)/0.1)] flex items-center justify-center">
        <Upload className="w-5 h-5 text-cta" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Upload Documents</h3>
        <p className="text-sm text-muted-foreground">Please upload your documents (PDF, DOC, DOCX only)</p>
      </div>
    </div>

    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Resume / CV <span className="text-destructive">*</span></Label>
        <UploadZone label="Click to upload your resume" file={data.resume} onSelect={(f) => update({ resume: f })} icon={Upload} error={errors.resume} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Cover Letter (Optional but recommended)</Label>
        <UploadZone label="Click to upload cover letter" file={data.coverLetter} onSelect={(f) => update({ coverLetter: f })} icon={FileText} />
        <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
          <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
          A cover letter helps us understand your motivation and increases your chances
        </div>
      </div>
    </div>
  </div>
);

export default StepDocuments;
