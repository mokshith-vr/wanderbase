import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCity } from "@/lib/api";
import { formatInr, usdToInr, formatUsd } from "@/lib/utils";
import { VisaBadge } from "@/components/ui/badge";
import { Flag } from "@/components/ui/flag";
import { Progress } from "@/components/ui/progress";
import { getAffiliateLink } from "@/lib/affiliate";
import { SaveCityButton } from "@/components/cities/SaveCityButton";
import type { Metadata } from "next";
import type { ColivingOption } from "@nomadly/types";

interface PageProps {
  params: { city: string };
}

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const res = await getCity(params.city);
  if (!res.success || !res.data) return { title: "City not found" };
  const city = res.data;
  return {
    title: `${city.name} — Visa, Cost & Nomad Guide`,
    description: `Real costs in ₹, visa requirements, hostels, coliving spaces and nomad info for ${city.name}, ${city.country}.`,
  };
}

// Same multipliers as the cost calculator — keeps numbers consistent
function getBudgetRanges(costs: { rent_usd: number; food_usd: number; transport_usd: number; utilities_usd: number }, totalUsd: number) {
  function coworkingRate(t: number) {
    if (t <= 800) return 5;
    if (t <= 1200) return 8;
    if (t <= 1800) return 12;
    if (t <= 2500) return 18;
    return 25;
  }
  const rate = coworkingRate(totalUsd);
  const sim = 12;

  const backpacker = usdToInr(
    costs.rent_usd * 0.45 + costs.food_usd * 0.55 +
    costs.transport_usd * 0.7 + costs.utilities_usd + sim
  );
  const balanced = usdToInr(
    costs.rent_usd * 0.72 + costs.food_usd * 0.78 +
    costs.transport_usd * 0.85 + costs.utilities_usd + sim + rate * 10
  );
  const comfortable = usdToInr(
    costs.rent_usd + costs.food_usd + costs.transport_usd +
    costs.utilities_usd + sim + rate * 22
  );
  return { backpacker, balanced, comfortable };
}

export default async function CityPage({ params }: PageProps) {
  const cityRes = await getCity(params.city);
  if (!cityRes.success || !cityRes.data) notFound();

  const city = cityRes.data;
  const { costs, visa } = city;
  const acc = city.accommodation;
  const colivingOptions: ColivingOption[] = city.coliving_options ?? [];
  const budgets = getBudgetRanges(costs, city.monthly_total_budget_usd);

  const costItems = [
    { label: "Rent (1BR, city centre)", usd: costs.rent_usd },
    { label: "Food & groceries", usd: costs.food_usd },
    { label: "Transport", usd: costs.transport_usd },
    { label: "Utilities & internet", usd: costs.utilities_usd },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/cities" className="hover:text-primary transition-colors">Cities</Link>
        <span className="mx-2">›</span>
        <span className="text-text-secondary">{city.name}</span>
      </nav>

      {/* Hero photo */}
      {city.image_url && (
        <div className="relative h-52 sm:h-72 w-full rounded-2xl overflow-hidden mb-6">
          <Image src={city.image_url} alt={city.name} fill className="object-cover" priority sizes="(max-width: 896px) 100vw, 896px" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      )}

      {/* City name + save */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Flag countryCode={city.country_code} size={56} />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">{city.name}</h1>
            <p className="text-text-muted">{city.country} · {city.continent}</p>
          </div>
        </div>
        <SaveCityButton cityId={city.id} />
      </div>

      {/* ── COMBINED COST + STAY WIDGET ─────────────────────── */}
      <section className="mb-8">
        <div className="rounded-2xl overflow-hidden" style={{
          background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #F0FDF4 100%)",
          border: "1px solid #E5E7EB"
        }}>
          <div className="px-5 pt-5 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-0.5">Full monthly cost</p>
                <h2 className="text-lg font-black text-text-primary tracking-tight">What will I spend in {city.name}?</h2>
              </div>
              <Link href="/cost-calculator" className="text-xs text-primary hover:underline font-medium">
                Personalise →
              </Link>
            </div>

            {/* 3 style columns */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Backpacker",
                  living: budgets.backpacker,
                  accInr: acc ? usdToInr(acc.hostel_per_night_usd * 30) : null,
                  accLabel: "Hostel room",
                  dot: "bg-success",
                  border: "border-success/25",
                  bg: "bg-white/70",
                  livingNote: "Street food · café WiFi",
                },
                {
                  label: "Balanced",
                  living: budgets.balanced,
                  accInr: acc ? usdToInr(acc.airbnb_monthly_usd) : null,
                  accLabel: acc?.airbnb_available ? "Airbnb / flat" : "Guesthouse",
                  dot: "bg-primary",
                  border: "border-primary/30",
                  bg: "bg-white/90",
                  popular: true,
                  livingNote: "Mix of cooking & restaurants",
                },
                {
                  label: "Comfortable",
                  living: budgets.comfortable,
                  accInr: acc ? usdToInr(acc.apartment_monthly_usd) : null,
                  accLabel: "1BHK lease",
                  dot: "bg-warning",
                  border: "border-warning/25",
                  bg: "bg-white/70",
                  livingNote: "Mostly restaurants",
                },
              ].map((s) => (
                <div key={s.label} className={`relative rounded-xl border ${s.border} ${s.bg} p-3 flex flex-col`}>
                  {s.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm">
                      Most common
                    </span>
                  )}
                  <div className={`w-2 h-2 rounded-full ${s.dot} mb-2`} />
                  <p className="text-[11px] font-bold text-text-secondary">{s.label}</p>

                  {/* Living costs row */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <p className="text-[10px] text-text-muted">Living costs</p>
                      <p className="text-sm font-bold text-text-primary">{formatInr(s.living)}</p>
                    </div>
                    {s.accInr && (
                      <div className="flex justify-between items-baseline">
                        <p className="text-[10px] text-text-muted">{s.accLabel}</p>
                        <p className="text-sm font-bold text-text-primary">{formatInr(s.accInr)}</p>
                      </div>
                    )}
                    {s.accInr && (
                      <div className="flex justify-between items-baseline border-t border-border/50 pt-1 mt-1">
                        <p className="text-[10px] font-semibold text-text-secondary">Total/mo</p>
                        <p className="text-base font-black text-text-primary">{formatInr(s.living + s.accInr)}</p>
                      </div>
                    )}
                    {!s.accInr && (
                      <p className="text-base font-black text-text-primary mt-1">{formatInr(s.living)}</p>
                    )}
                  </div>

                  <p className="text-[10px] text-text-muted mt-2 leading-tight">{s.livingNote}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-text-muted mt-3">
              Living costs = food + transport + SIM + utilities + coworking (not accommodation).
              Total/mo = living costs + accommodation combined.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHERE TO STAY ───────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">Where to stay</h2>

        {colivingOptions.length > 0 ? (
          <div className="space-y-2">
            {colivingOptions.map((opt) => (
              <a
                key={opt.name}
                href={opt.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 bg-surface hover:bg-primary/5 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-lg">
                  {opt.type === "coliving" ? "🏘️" : opt.type === "hostel" ? "🛏️" : "🏠"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-text-primary group-hover:text-primary">{opt.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      opt.type === "coliving" ? "bg-primary/10 text-primary" :
                      opt.type === "hostel" ? "bg-success/10 text-success" :
                      "bg-warning/10 text-warning"
                    }`}>{opt.type}</span>
                    {opt.includes_desk && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted">desk ✓</span>}
                    {opt.wifi_mbps && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted">{opt.wifi_mbps} Mbps</span>}
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{opt.neighborhood} · {opt.highlight}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-black text-text-primary">
                    {opt.price_per_month_usd
                      ? <>{formatInr(usdToInr(opt.price_per_month_usd))}<span className="text-[10px] font-normal text-text-muted">/mo</span></>
                      : opt.price_per_night_usd
                      ? <>{formatInr(usdToInr(opt.price_per_night_usd))}<span className="text-[10px] font-normal text-text-muted">/night</span></>
                      : null}
                  </p>
                  <span className="text-[10px] text-primary font-medium">Book ↗</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center text-text-muted text-sm">
            Accommodation listings coming soon for {city.name}.
          </div>
        )}

        <p className="text-[11px] text-text-muted mt-3">Prices are estimates · Always verify on booking page</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div className="card p-6">
            <p className="text-text-secondary leading-relaxed">{city.description}</p>
            {city.best_for.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs text-text-muted">Best for:</span>
                {city.best_for.map((b) => (
                  <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{b}</span>
                ))}
              </div>
            )}
          </div>

          {/* Visa */}
          {visa && (
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">🛂 Visa for Indian Passport</h2>
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <VisaBadge type={visa.visa_type} />
                  {visa.max_stay_days && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-text-primary">{visa.max_stay_days}</p>
                      <p className="text-text-muted text-xs">days max stay</p>
                    </div>
                  )}
                </div>
                {visa.notes && (
                  <div className="bg-surface-2 rounded-xl p-4">
                    <p className="text-text-secondary text-sm leading-relaxed">{visa.notes}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {visa.evisa_link && (
                    <a href={visa.evisa_link} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                      Apply for e-Visa ↗
                    </a>
                  )}
                  {visa.embassy_link && (
                    <a href={visa.embassy_link} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                      Official embassy ↗
                    </a>
                  )}
                </div>
                <p className="text-text-muted text-xs">
                  Verified:{" "}
                  {new Date(visa.last_verified_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  {" · "}
                  <a href={`mailto:data@wanderbase.in?subject=Incorrect visa data: ${city.country}`} className="text-danger hover:underline">
                    Report incorrect info
                  </a>
                </p>
              </div>
            </section>
          )}

          {/* Cost breakdown — full detail for those who want it */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">💸 Full Cost of Living</h2>
            <div className="card p-6 space-y-4">
              {costItems.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-secondary">{item.label}</span>
                    <div className="text-right">
                      <span className="font-semibold text-text-primary">{formatInr(usdToInr(item.usd))}</span>
                      <span className="text-text-muted text-xs ml-2">{formatUsd(item.usd)}</span>
                    </div>
                  </div>
                  <Progress value={(item.usd / city.monthly_total_budget_usd) * 100} color="primary" />
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-bold text-text-primary">Total (1BR standard)</span>
                <div className="text-right">
                  <span className="font-bold text-text-primary">{formatInr(usdToInr(city.monthly_total_budget_usd))}</span>
                  <span className="text-text-muted text-sm ml-2">{formatUsd(city.monthly_total_budget_usd)}/mo</span>
                </div>
              </div>
              <p className="text-text-muted text-xs">
                Based on 1BR apartment, city centre.{" "}
                <Link href="/cost-calculator" className="text-primary hover:underline">Calculate for your travel style →</Link>
              </p>
            </div>
          </section>

          {/* City overview */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">🏙️ City Overview</h2>
            <div className="card p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Timezone", value: city.timezone },
                  { label: "Currency", value: city.currency_code },
                  { label: "English", value: city.english_proficiency.charAt(0).toUpperCase() + city.english_proficiency.slice(1) + " proficiency" },
                  { label: "Coworking spaces", value: `${city.coworking_count}+ spaces` },
                  { label: "Internet speed", value: `${city.internet_speed_mbps} Mbps avg` },
                  { label: "Safety score", value: `${city.safety_score}/100` },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-2 rounded-xl p-3">
                    <p className="text-text-muted text-xs mb-1">{item.label}</p>
                    <p className="text-text-primary font-semibold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <a href={getAffiliateLink("wise")} target="_blank" rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-border hover:border-green-500/30 bg-surface transition-all group">
            <div className="text-2xl mb-2">💱</div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-green-400">Transfer money to {city.country}</p>
            <p className="text-xs text-text-muted mt-1">Real exchange rates. No hidden fees. First transfer free.</p>
            <p className="text-xs text-primary mt-2">Try Wise ↗</p>
          </a>

          <a href={getAffiliateLink("safetywing")} target="_blank" rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-border hover:border-blue-500/30 bg-surface transition-all group">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-blue-400">Travel insurance</p>
            <p className="text-xs text-text-muted mt-1">SafetyWing covers medical + travel. From $45/month.</p>
            <p className="text-xs text-primary mt-2">Get covered ↗</p>
          </a>

          <a href={getAffiliateLink("airalo")} target="_blank" rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-border hover:border-orange-500/30 bg-surface transition-all group">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-orange-400">eSIM for {city.country}</p>
            <p className="text-xs text-text-muted mt-1">Buy a local data plan on Airalo before you land. No roaming.</p>
            <p className="text-xs text-primary mt-2">Get eSIM ↗</p>
          </a>

          <p className="text-xs text-text-muted text-center">We may earn a commission</p>
        </aside>
      </div>
    </div>
  );
}
