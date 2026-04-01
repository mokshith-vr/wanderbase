import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Remote Work & Digital Nomad Guides for Indians",
  description:
    "Visa guides, cost of living breakdowns, tax advice, and remote job tips — all written for Indian passport holders and tech workers.",
};

export const revalidate = 3600;

const CATEGORY_COLORS: Record<string, string> = {
  "Visa Guide": "badge-success",
  "Cost Guide": "badge-warning",
  "Destination Guide": "badge-neutral",
  "Tax & Legal": "badge-danger",
  "Jobs Guide": "badge-neutral",
};

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-3">
          Guides for Indian Nomads
        </h1>
        <p className="text-text-muted text-lg">
          Visa rules, cost breakdowns, tax guides — written for Indian passport holders.
        </p>
      </div>

      <div className="space-y-4">
        {sorted.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block card-hover p-6 group"
          >
            <div className="flex items-center gap-3 mb-3">
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
            <h2 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors mb-2">
              {post.title}
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">{post.description}</p>
            <p className="text-primary text-sm mt-3">Read article →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
