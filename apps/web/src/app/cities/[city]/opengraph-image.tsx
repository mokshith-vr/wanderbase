import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Wanderbase City Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CITY_META: Record<string, { name: string; flag: string; cost: string }> = {
  bali: { name: "Bali", flag: "🇮🇩", cost: "₹1,00,200/mo" },
  lisbon: { name: "Lisbon", flag: "🇵🇹", cost: "₹1,83,700/mo" },
  tbilisi: { name: "Tbilisi", flag: "🇬🇪", cost: "₹75,150/mo" },
  "chiang-mai": { name: "Chiang Mai", flag: "🇹🇭", cost: "₹83,500/mo" },
  medellin: { name: "Medellín", flag: "🇨🇴", cost: "₹91,850/mo" },
  budapest: { name: "Budapest", flag: "🇭🇺", cost: "₹1,33,600/mo" },
  prague: { name: "Prague", flag: "🇨🇿", cost: "₹1,50,300/mo" },
  tallinn: { name: "Tallinn", flag: "🇪🇪", cost: "₹1,58,650/mo" },
  "mexico-city": { name: "Mexico City", flag: "🇲🇽", cost: "₹1,08,550/mo" },
  bangkok: { name: "Bangkok", flag: "🇹🇭", cost: "₹91,850/mo" },
  barcelona: { name: "Barcelona", flag: "🇪🇸", cost: "₹2,08,750/mo" },
  porto: { name: "Porto", flag: "🇵🇹", cost: "₹1,58,650/mo" },
  taipei: { name: "Taipei", flag: "🇹🇼", cost: "₹1,33,600/mo" },
  seoul: { name: "Seoul", flag: "🇰🇷", cost: "₹1,67,000/mo" },
  "cape-town": { name: "Cape Town", flag: "🇿🇦", cost: "₹1,00,200/mo" },
  dubai: { name: "Dubai", flag: "🇦🇪", cost: "₹2,92,250/mo" },
  "kuala-lumpur": { name: "Kuala Lumpur", flag: "🇲🇾", cost: "₹83,500/mo" },
  "ho-chi-minh-city": { name: "Ho Chi Minh City", flag: "🇻🇳", cost: "₹75,150/mo" },
  berlin: { name: "Berlin", flag: "🇩🇪", cost: "₹2,33,800/mo" },
  "playa-del-carmen": { name: "Playa del Carmen", flag: "🇲🇽", cost: "₹1,00,200/mo" },
};

export default function Image({ params }: { params: { city: string } }) {
  const meta = CITY_META[params.city] ?? {
    name: "City Guide",
    flag: "🌍",
    cost: "",
  };

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
        {/* Top: logo */}
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
            Wanderbase
          </span>
        </div>

        {/* City info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "80px" }}>{meta.flag}</div>
          <div
            style={{
              color: "#F8FAFC",
              fontSize: "64px",
              fontWeight: "800",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}
          >
            {meta.name}
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span
              style={{
                background: "#1E293B",
                border: "1px solid #334155",
                borderRadius: "12px",
                padding: "8px 20px",
                color: "#94A3B8",
                fontSize: "18px",
              }}
            >
              {meta.cost}
            </span>
            <span
              style={{
                background: "#6366F1",
                borderRadius: "12px",
                padding: "8px 20px",
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Indian passport guide
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ color: "#6366F1", fontSize: "18px", fontWeight: "600" }}>
          wanderbase.in · Visa · Cost · Remote Jobs
        </div>
      </div>
    ),
    size
  );
}
