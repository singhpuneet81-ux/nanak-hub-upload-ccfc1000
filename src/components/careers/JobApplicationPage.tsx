import React, { useState } from "react";
import { X, Check, Briefcase, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoNanak from "@/assets/logo-nanak.webp";
import StepPersonalInfo from "./steps/StepPersonalInfo";
import StepExperience from "./steps/StepExperience";
import StepMotivation from "./steps/StepMotivation";
import StepDocuments from "./steps/StepDocuments";
import StepScreening from "./steps/StepScreening";
import { toast } from "sonner";
import { submitJobApplication } from "@/utils/submitJobApplication";

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

const JobApplicationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobTitle = searchParams.get("title") || "Job Application";
  const jobDepartment = searchParams.get("dept") || "";
  const jobLocation = searchParams.get("loc") || "";
  const jobId = searchParams.get("jobId") || null;
  const isGeneral = jobTitle === "General Application";

  const [step, setStep] = useState(1);
  const [data, setData] = useState<JobApplicationData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (fields: Partial<JobApplicationData>) => {
    setData((prev) => ({ ...prev, ...fields }));
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
      if (!data.resume) {
        e.resume = "Resume is required";
      } else {
        const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowed.includes(data.resume.type)) e.resume = "Only PDF, DOC, and DOCX files are allowed";
      }
      if (data.coverLetter && !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(data.coverLetter.type)) {
        e.coverLetter = "Only PDF, DOC, and DOCX files are allowed";
      }
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

  const handleContinue = async () => {
    if (!validateStep()) return;
    if (step < 5) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final step — submit to API
      setSubmitting(true);
      try {
        const result = await submitJobApplication(
          {
            jobId: jobId,
            jobTitle,
            applicationType: isGeneral ? "general" : "specific",
            personalInfo: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              location: data.location,
              linkedin: data.linkedin || undefined,
              portfolio: data.portfolio || undefined,
            },
            experience: {
              currentRole: data.currentRole,
              yearsExperience: data.yearsExperience,
              relevantExperience: data.relevantExperience,
              qualifications: data.qualifications,
              qualificationsDetail: data.qualificationsDetail || undefined,
            },
            motivation: {
              whyJoin: data.whyJoin,
              whyRole: data.whyRole,
              strengths: data.strengths,
              salaryExpectation: data.salaryExpectation,
              availability: data.availability,
              workArrangement: data.workArrangement,
            },
            screening: {
              workRights: data.workRights,
              relocation: data.relocation,
              noticePeriod: data.noticePeriod,
              references: data.references,
              privacyConsent: data.privacyConsent,
            },
          },
          data.resume!,
          data.coverLetter
        );

        if (result.success) {
          toast.success("Application submitted successfully!");
          setSubmitted(true);
        } else {
          toast.error(result.error || "Submission failed — please try again");
        }
      } catch {
        toast.error("Network error — please try again");
      } finally {
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progress = (step / 5) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[hsl(var(--muted)/0.25)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-background rounded-2xl border border-border shadow-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Application Submitted!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Thank you for applying to <strong>{jobTitle}</strong> at Nanak Accountants & Associates. We've received your application and our team will review it carefully.
          </p>

          <div className="mt-6 bg-[hsl(var(--muted)/0.3)] rounded-xl p-5 text-left">
            <h3 className="font-bold text-center text-sm mb-4">What Happens Next?</h3>
            <div className="space-y-4">
              {[
                { num: "1", color: "bg-cta", title: "Application Review", desc: "Our team will review your application within 5 business days" },
                { num: "2", color: "bg-amber-500", title: "Initial Contact", desc: "If shortlisted, we'll reach out via email or phone" },
                { num: "3", color: "bg-success", title: "Interview Process", desc: "We'll schedule interviews with relevant team members" },
              ].map((s) => (
                <div key={s.num} className="flex gap-3">
                  <div className={`w-7 h-7 rounded-full ${s.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                    {s.num}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={() => navigate("/careers")} className="flex-1 bg-cta text-cta-foreground hover:bg-cta-hover rounded-full font-semibold">
              Back to Careers
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="flex-1 rounded-full font-semibold">
              Go to Homepage
            </Button>
          </div>

          {data.email && (
            <p className="text-xs text-muted-foreground mt-4">
              Check your email ({data.email}) for confirmation
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--muted)/0.25)]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{jobTitle}</h1>
              {(jobDepartment || jobLocation) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                  {jobDepartment && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {jobDepartment}
                    </span>
                  )}
                  {jobDepartment && jobLocation && <span>•</span>}
                  {jobLocation && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {jobLocation}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/careers")}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-cta rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {/* Stepper */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = num < step;
              const active = num === step;
              return (
                <div key={s.label} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-colors ${
                    done ? "bg-success border-success text-white" :
                    active ? "bg-cta border-cta text-cta-foreground" :
                    "bg-muted border-border text-muted-foreground"
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : num}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1 text-center leading-tight ${
                    active ? "font-semibold text-foreground" : "text-muted-foreground"
                  } ${!active && !done ? "hidden sm:block" : ""}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-background rounded-2xl border border-border shadow-card p-5 sm:p-8">
          {step === 1 && <StepPersonalInfo data={data} errors={errors} update={update} />}
          {step === 2 && <StepExperience data={data} errors={errors} update={update} />}
          {step === 3 && <StepMotivation data={data} errors={errors} update={update} />}
          {step === 4 && <StepDocuments data={data} errors={errors} update={update} />}
          {step === 5 && <StepScreening data={data} errors={errors} update={update} />}
        </div>
      </main>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="rounded-full px-5 sm:px-6 h-10 sm:h-11">
              ← Back
            </Button>
          ) : <div />}
          <Button
            onClick={handleContinue}
            disabled={submitting}
            className="bg-cta text-cta-foreground hover:bg-cta-hover rounded-full px-6 sm:px-8 h-10 sm:h-11 font-semibold"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : step === 5 ? "Submit Application ✓" : "Continue →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;
