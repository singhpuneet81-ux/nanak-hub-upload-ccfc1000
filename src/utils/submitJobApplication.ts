/**
 * Submit a job application (specific or general) via multipart/form-data.
 * Matches the API spec in docs/CAREERS_API_DOCUMENTATION.md
 */

const API_BASE = "https://api.connect.cavaluer.com";

export interface JobApplicationPayload {
  jobId?: string | null;
  jobTitle: string;
  applicationType: "specific" | "general";
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  experience: {
    currentRole: string;
    yearsExperience: string;
    relevantExperience: string;
    qualifications: string;
    qualificationsDetail?: string;
  };
  motivation: {
    whyJoin: string;
    whyRole: string;
    strengths: string;
    salaryExpectation: string;
    availability: string;
    workArrangement: string;
  };
  screening: {
    workRights: string;
    relocation: string;
    noticePeriod: string;
    references: string;
    privacyConsent: boolean;
  };
}

interface SubmitResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function submitJobApplication(
  payload: JobApplicationPayload,
  resumeFile: File,
  coverLetterFile?: File | null
): Promise<SubmitResult> {
  const formData = new FormData();

  // Attach files
  formData.append("resume", resumeFile);
  if (coverLetterFile) {
    formData.append("coverLetter", coverLetterFile);
  }

  // Attach structured JSON data
  formData.append("applicationData", JSON.stringify(payload));

  const endpoint = payload.applicationType === "general"
    ? `${API_BASE}/api/job-applications/general`
    : `${API_BASE}/api/job-applications`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Server error (${res.status})` };
    }

    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error — please try again" };
  }
}
