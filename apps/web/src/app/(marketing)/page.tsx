import Link from "next/link";
import Image from "next/image";
import { CitySnapshotWidget } from "@/components/tools/CitySnapshotWidget";
import { CityCard } from "@/components/cities/CityCard";
import { Flag } from "@/components/ui/flag";
import { getCities } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wanderbase — Work remotely from anywhere.",
  description: "Visa requirements, cost of living in ₹, and accommodation options — all in one place.",
};

export const revalidate = 3600;

const DESTINATIONS = [
  { code: "GE", name: "Tbilisi",      tag: "Visa-free 1 year",  cost: "₹75,000/mo",   slug: "tbilisi" },
  { code: "ID", name: "Bali",         tag: "Visa on arrival",   cost: "₹1,00,000/mo", slug: "bali" },
  { code: "MX", name: "Mexico City",  tag: "Visa-free 180d",    cost: "₹1,08,000/mo", slug: "mexico-city" },
  { code: "MY", name: "Kuala Lumpur", tag: "Visa-free 30d",     cost: "₹83,500/mo",   slug: "kuala-lumpur" },
  { code: "TH", name: "Chiang Mai",   tag: "Visa-free 30d",     cost: "₹83,500/mo",   slug: "chiang-mai" },
  { code: "PT", name: "Lisbon",       tag: "Nomad visa",        cost: "₹1,83,000/mo", slug: "lisbon" },
];

const FEATURES = [
  {
    emoji: "🛂",
    bg: "bg-primary-light",
    color: "text-primary",
    title: "Visa clarity, instantly",
    desc: "Know what visa you need before you book — visa-free, e-visa, or embassy visit — with last-verified dates and official links.",
  },
  {
    emoji: "₹",
    bg: "bg-success-light",
    color: "text-success",
    title: "Real costs in ₹",
    desc: "See rent, food, transport, and accommodation options in ₹ — budget, mid, and comfort tiers for every city.",
  },
  {
    emoji: "🏠",
    bg: "bg-warning-light",
    color: "text-warning",
    title: "Where to stay",
    desc: "Hostel, Airbnb, or long-term lease — we show all 3 tiers per city so you know exactly what to budget before you land.",
  },
];

async function getPopularCities() {
  try {
    const res = await getCities({ sort: "cost", limit: 8 });
    return res.data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const cities = await getPopularCities();

  return (
    <div className="flex flex-col">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{
        background: "linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 35%, #FDF4FF 65%, #FAFAF8 100%)"
      }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #C7D2FE 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #DDD6FE 0%, transparent 70%)" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="font-black tracking-[-0.04em] leading-[0.95] mb-6"
              style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}>
              <span className="text-gray-900 block">Live anywhere.</span>
              <span className="block text-gradient">Work everywhere.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
              Visa requirements, cost of living, and remote jobs — all in one place.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link href="/cities" className="btn-primary text-base py-3.5 px-8">
              Explore destinations →
            </Link>
            <Link href="/visa-checker" className="btn-secondary text-base py-3.5 px-8">
              Check visa requirements
            </Link>
          </div>

          {/* Search Widget */}
          <div className="max-w-3xl mx-auto">
            <CitySnapshotWidget />
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-text-muted">
            {[
              { icon: "✓", text: "Verified visa data" },
              { icon: "✓", text: "Costs in ₹" },
              { icon: "✓", text: "Accommodation tiers" },
              { icon: "✓", text: "Always up to date" },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-1.5">
                <span className="text-success font-bold">{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-3">Destinations</p>
          <h2 className="section-title">Where will you go next?</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Costs in ₹. Verified visa requirements. Pick your city.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DESTINATIONS.map((d) => (
            <Link key={d.slug} href={`/cities/${d.slug}`}
              className="card-hover p-5 text-center group">
              <div className="flex justify-center mb-3">
                <Flag countryCode={d.code} size={44} />
              </div>
              <p className="font-bold text-text-primary text-sm">{d.name}</p>
              <p className="text-success text-xs mt-1 font-medium">{d.tag}</p>
              <p className="text-text-muted text-xs mt-0.5">{d.cost}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/cities" className="btn-secondary text-sm">
            View all destinations →
          </Link>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="bg-surface-2 border-y border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-3">Tools</p>
            <h2 className="section-title">Everything in one place</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Visa rules, cost of living, and accommodation options — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card p-8 hover:shadow-lg transition-shadow duration-300">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${f.bg} ${f.color} text-xl mb-6 font-bold`}>
                  {f.emoji}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">{f.title}</h3>
                <p className="text-text-muted leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR CITIES ───────────────────────────────── */}
      {cities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-eyebrow mb-2">Most affordable</p>
              <h2 className="section-title">Top cities by budget</h2>
              <p className="text-text-muted mt-1">Monthly cost in ₹, cheapest first</p>
            </div>
            <Link href="/cities" className="hidden sm:block btn-secondary text-sm">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cities.map((city, i) => (
              <div key={city.id} className="animate-entrance" style={{ animationDelay: `${i * 60}ms` }}>
                <CityCard city={city} />
              </div>
            ))}
          </div>
        </section>
      )}

{/* ── CTA ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="gradient-border p-px rounded-3xl" style={{
          background: "linear-gradient(135deg, #4F46E5, #7C3AED, #059669) border-box"
        }}>
          <div className="rounded-[calc(1.5rem-1px)] px-8 sm:px-16 py-16 sm:py-20 text-center"
            style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #F0FDF4 100%)" }}>
            <p className="section-eyebrow mb-4">Ready?</p>
            <h2 className="section-title mb-4">Find your city today</h2>
            <p className="section-subtitle max-w-lg mx-auto mb-10">
              Start with the visa checker — know in seconds if you can travel freely,
              get an e-visa, or need an embassy appointment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/visa-checker" className="btn-primary text-base py-4 px-10">
                Check visa requirements →
              </Link>
              <Link href="/cities" className="btn-secondary text-base py-4 px-10">
                Explore destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
