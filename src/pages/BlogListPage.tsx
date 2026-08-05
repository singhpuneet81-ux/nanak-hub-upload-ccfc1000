import { Link } from "react-router-dom";
import { useBlogs, BLOG_API_BASE } from "@/hooks/useBlogs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function formatDate(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function BlogListPage() {
  const { blogs, loading, error } = useBlogs();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Insights &amp; Guides
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Practical Australian tax and business advice from Nanak Accountants.
        </p>

        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-10 text-destructive text-sm">{error}</p>
        )}

        {!loading && !error && blogs.length === 0 && (
          <p className="mt-10 text-muted-foreground">No published articles yet. Check back soon.</p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog.slug}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              {blog.coverImage ? (
                <img
                  src={
                    blog.coverImage.startsWith("http")
                      ? blog.coverImage
                      : `${BLOG_API_BASE}${blog.coverImage}`
                  }
                  alt=""
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="h-44 w-full bg-muted" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {blog.category && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      {blog.category}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(blog.publishedAt || blog.createdAt)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {blog.title}
                </h2>
                {blog.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{blog.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
