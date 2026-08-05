import { useEffect, useState } from "react";

const API_BASE = "https://api.connect.cavaluer.com";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  authorName?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string | null;
  createdAt?: string;
}

export function useBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/blogs?limit=50`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load blogs");
        if (!cancelled) setBlogs(json.data || []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load blogs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { blogs, loading, error };
}

export function useBlogPost(slug: string | undefined) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Blog not found");
        if (!cancelled) setBlog(json.data || null);
      } catch (e: unknown) {
        if (!cancelled) {
          setBlog(null);
          setError(e instanceof Error ? e.message : "Failed to load blog");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { blog, loading, error };
}

export async function submitBlogQuizLead(
  slug: string,
  payload: unknown
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(slug)}/quiz-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || "Failed to submit");
  }
  return { ok: true };
}

export { API_BASE as BLOG_API_BASE };
