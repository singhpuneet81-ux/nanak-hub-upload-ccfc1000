import { useState, useEffect } from "react";

const API_BASE = "https://api.cavaluer.com";

export interface WebinarAPI {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  speaker: string;
  speakerTitle?: string;
  speakerBio?: string;
  speakerImage?: string;
  videoLink?: string;
  thumbnailImage?: string;
  learnings: string[];
  tags?: string[];
  maxSeats?: number;
  status: string;
  featured?: boolean;
  recordingUrl?: string;
  resourceLinks?: { label: string; url: string }[];
  registered?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface WebinarListResponse {
  success: boolean;
  data: WebinarAPI[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: any;
}

export function useWebinars() {
  const [webinars, setWebinars] = useState<WebinarAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/webinars?status=published&upcoming=true`);
        if (!res.ok) throw new Error("Failed to fetch webinars");
        const json: WebinarListResponse = await res.json();
        if (json.success) {
          setWebinars(json.data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err: any) {
        console.error("[WebinarAPI] Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWebinars();
  }, []);

  return { webinars, loading, error };
}

export async function registerForWebinar(
  webinarId: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  }
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/webinars/${webinarId}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.error || json.message || "Registration failed") as any;
    err.status = res.status;
    throw err;
  }
  return json;
}
