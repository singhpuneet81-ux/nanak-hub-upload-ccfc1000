import React, { useState } from "react";
import { X, Check, Briefcase, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoNanak from "@/assets/logo-nanak.webp";
import StepPersonalInfo from "./steps/StepPersonalInfo";
import StepExperience from "./steps/StepExperience";
import StepMotivation from "./steps/StepMotivation";
import StepDocuments from "./steps/StepDocuments";
import StepScreening from "./steps/StepScreening";
import { toast } from "sonner";

export type JobApplicationData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  currentRole: string;
  yearsExperience: string;
  relevantExperience: string;
  qualifications: string;
  qualificationsDetail: string;
  whyJoin: string;
  whyRole: string;
  strengths: string;
  salaryExpectation: string;
  availability: string;
  workArrangement: string;
  resume: File | null;
  coverLetter: File | null;
  workRights: string;
  relocation: string;
  noticePeriod: string;
  references: string;
  privacyConsent: boolean;
};

const INITIAL_DATA: JobApplicationData = {
  firstName: "", lastName: "", email: "", phone: "", location: "",
  linkedin: "", portfolio: "", currentRole: "", yearsExperience: "",
  relevantExperience: "", qualifications: "", qualificationsDetail: "",
  whyJoin: "", whyRole: "", strengths: "", salaryExpectation: "",
  availability: "", workArrangement: "", resume: null, coverLetter: null,
  workRights: "", relocation: "", noticePeriod: "", references: "",
  privacyConsent: false,
};

const STEPS = [
  { label: "Personal Info" },
  { label: "Experience" },
  { label: "Motivation" },
  { label: "Documents" },
  { label: "Screening" },
];

type Props = {
  job: { title: string; department: string; location: string };
  onClose: () => void;
};

const JobApplicationModal: React.FC<Props> = ({ job, onClose }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<JobApplicationData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (fields: Partial<JobApplicationData>) => {
    setData((prev) => ({ ...prev, ...fields }));
    // Clear errors for updated fields
    const cleared: Record<string, string> = {};
    Object.keys(fields).forEach((k) => { cleared[k] = ""; });
    setErrors((prev) => ({ ...prev, ...cleared }));
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!data.firstName.trim()) e.firstName = "Required";
      if (!data.lastName.trim()) e.lastName = "Required";
      if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Valid email required";
      if (!data.phone.trim() || !/^[\d\s+()-]{8,15}$/.test(data.phone)) e.phone = "Valid phone required";
      if (!data.location.trim()) e.location = "Required";
    } else if (step === 2) {
      if (!data.yearsExperience) e.yearsExperience = "Required";
      if (data.relevantExperience.length < 50) e.relevantExperience = "Minimum 50 characters";
      if (!data.qualifications) e.qualifications = "Required";
      if (data.qualifications === "equivalent" && !data.qualificationsDetail.trim()) e.qualificationsDetail = "Please elaborate";
    } else if (step === 3) {
      if (data.whyJoin.length < 100) e.whyJoin = "Minimum 100 characters";
      if (data.whyRole.length < 100) e.whyRole = "Minimum 100 characters";
      if (data.strengths.length < 50) e.strengths = "Minimum 50 characters";
      if (!data.salaryExpectation) e.salaryExpectation = "Required";
      if (!data.availability) e.availability = "Required";
    } else if (step === 4) {
      if (!data.resume) e.resume = "Resume is required";
    } else if (step === 5) {
      if (!data.workRights) e.workRights = "Required";
      if (!data.relocation) e.relocation = "Required";
      if (!data.noticePeriod) e.noticePeriod = "Required";
      if (!data.references) e.references = "Required";
      if (!data.privacyConsent) e.privacyConsent = "You must accept";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    if (step < 5) setStep(step + 1);
    else {
      toast.success("Application submitted successfully! We'll be in touch within 5 business days.");
      onClose();
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-background rounded-2xl shadow-2xl my-6 mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background rounded-t-2xl border-b border-border px-6 pt-5 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold">{job.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Briefcase className="w-3.5 h-3.5" /> {job.department}
            <span>•</span>
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-cta rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          {/* Stepper */}
          <div className="flex justify-between mt-4">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = num < step;
              const active = num === step;
              return (
                <div key={s.label} className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    done ? "bg-success border-success text-white" :
                    active ? "bg-cta border-cta text-cta-foreground" :
                    "bg-muted border-border text-muted-foreground"
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-xs mt-1.5 hidden sm:block ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {step === 1 && <StepPersonalInfo data={data} errors={errors} update={update} />}
          {step === 2 && <StepExperience data={data} errors={errors} update={update} />}
          {step === 3 && <StepMotivation data={data} errors={errors} update={update} />}
          {step === 4 && <StepDocuments data={data} errors={errors} update={update} />}
          {step === 5 && <StepScreening data={data} errors={errors} update={update} />}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex justify-between rounded-b-2xl">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full px-6">
              ← Back
            </Button>
          ) : <div />}
          <Button onClick={handleContinue} className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-full px-8 font-semibold">
            {step === 5 ? "Submit Application ✓" : "Continue →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
