import { useState, useEffect, useMemo } from "react";

const API_BASE = "https://api.cavaluer.com";

export type JobOpening = {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  featured: boolean;
};

interface UseJobOpeningsReturn {
  openings: JobOpening[];
  loading: boolean;
  error: string | null;
  departments: string[];
  locations: string[];
}

export const useJobOpenings = (): UseJobOpeningsReturn => {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOpenings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/careers/openings`);
        const json = await res.json();
        if (!cancelled) {
          if (json.success && Array.isArray(json.data)) {
            setOpenings(json.data);
          } else {
            setOpenings([]);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load job openings. Please try again later.");
          setOpenings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOpenings();
    return () => { cancelled = true; };
  }, []);

  const departments = useMemo(
    () => ["All Departments", ...Array.from(new Set(openings.map((o) => o.department)))],
    [openings]
  );

  const locations = useMemo(
    () => ["All Locations", ...Array.from(new Set(openings.map((o) => o.location)))],
    [openings]
  );

  return { openings, loading, error, departments, locations };
};
