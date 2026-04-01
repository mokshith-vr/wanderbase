import { ImageResponse } from "next/og";
import { getBlogPost } from "@/lib/blog";

export const runtime = "edge";
export const alt = "Nomadly Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  const title = post?.title ?? "Nomadly — Guides for Indian Nomads";
  const category = post?.category ?? "Guide";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo + category */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              background: "#6366F1",
              borderRadius: "10px",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            N
          </div>
          <span style={{ color: "#F8FAFC", fontSize: "22px", fontWeight: "700" }}>
            Nomadly
          </span>
          <span
            style={{
              background: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "4px 14px",
              color: "#94A3B8",
              fontSize: "14px",
              marginLeft: "8px",
            }}
          >
            {category}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: "#F8FAFC",
            fontSize: title.length > 60 ? "42px" : "52px",
            fontWeight: "800",
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Bottom: domain */}
        <div style={{ color: "#6366F1", fontSize: "18px", fontWeight: "600" }}>
          nomadly.in · Built for Indian tech workers
        </div>
      </div>
    ),
    size
  );
}
