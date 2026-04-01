import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getAllBlogSlugs, BLOG_POSTS } from "@/lib/blog";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      url: `https://wanderbase.in/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Visa Guide": "badge-success",
  "Cost Guide": "badge-warning",
  "Destination Guide": "badge-neutral",
  "Tax & Legal": "badge-danger",
  "Jobs Guide": "badge-neutral",
};

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  ).slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8">
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span className="mx-2">›</span>
        <span className="text-text-secondary">{post.category}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[post.category] ?? "badge-neutral"}`}>
            {post.category}
          </span>
          <span className="text-text-muted text-xs">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-text-muted text-xs">· {post.readingTimeMin} min read</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight tracking-tight mb-4">
          {post.title}
        </h1>
        <p className="text-text-muted text-lg leading-relaxed">{post.description}</p>
      </header>

      {/* Article body */}
      <article
        className="prose-nomad"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-lg font-bold text-text-primary mb-4">Related guides</h2>
          <div className="space-y-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block card-hover p-4 group"
              >
                <p className="font-semibold text-text-primary group-hover:text-primary transition-colors text-sm">
                  {p.title}
                </p>
                <p className="text-text-muted text-xs mt-1">{p.readingTimeMin} min read</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link href="/blog" className="text-primary hover:underline text-sm">
          ← Back to all guides
        </Link>
      </div>
    </div>
  );
}
