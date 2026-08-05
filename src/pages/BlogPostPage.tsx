import { Link, useParams } from "react-router-dom";
import { useBlogPost, BLOG_API_BASE } from "@/hooks/useBlogs";
import { FreeCallBlogCard } from "@/components/blog/FreeCallBlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

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

/** Render content as HTML if it looks like markup; otherwise preserve newlines. */
function ArticleBody({ content }: { content: string }) {
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (looksHtml) {
    return (
      <div
        className="prose prose-neutral max-w-none text-[16.5px] leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <div className="whitespace-pre-wrap text-[16.5px] leading-relaxed text-muted-foreground">
      {content}
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { blog, loading, error } = useBlogPost(slug);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{error || "Article not found."}</p>
        <Link to="/blog" className="mt-4 inline-flex text-sm text-primary underline">
          Back to blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {blog.category && (
            <Badge variant="outline" className="rounded-full text-xs">
              {blog.category}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(blog.publishedAt || blog.createdAt)}
            {blog.authorName ? ` · ${blog.authorName}` : ""}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
          {blog.title}
        </h1>
        {blog.excerpt && (
          <p className="mt-3 text-lg text-muted-foreground">{blog.excerpt}</p>
        )}

        {blog.coverImage && (
          <img
            src={
              blog.coverImage.startsWith("http")
                ? blog.coverImage
                : `${BLOG_API_BASE}${blog.coverImage}`
            }
            alt=""
            className="mt-8 w-full rounded-2xl object-cover max-h-[420px]"
          />
        )}

        <div className="mt-8">
          <ArticleBody content={blog.content || ""} />
        </div>

        <FreeCallBlogCard
          slug={blog.slug}
          articleTitle={blog.title}
          category={blog.category}
          blogId={blog._id}
        />
      </article>
    </div>
  );
}
