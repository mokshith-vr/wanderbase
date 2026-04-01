import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCity, getJobs } from "@/lib/api";
import { formatInr, usdToInr, formatUsd } from "@/lib/utils";
import { VisaBadge } from "@/components/ui/badge";
import { Flag } from "@/components/ui/flag";
import { Progress } from "@/components/ui/progress";
import { JobCard } from "@/components/jobs/JobCard";
import { getAffiliateLink } from "@/lib/affiliate";
import { SaveCityButton } from "@/components/cities/SaveCityButton";
import type { Metadata } from "next";

interface PageProps {
  params: { city: string };
}

// ISR — rebuild every 24 hours
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const res = await getCity(params.city);
  if (!res.success || !res.data) {
    return { title: "City not found" };
  }
  const city = res.data;
  return {
    title: `${city.name} for Indian Nomads — Visa, Cost & Jobs`,
    description: `Indian passport visa status, cost of living in ₹, and remote jobs for ${city.name}, ${city.country}. ${city.description.slice(0, 120)}`,
  };
}

export default async function CityPage({ params }: PageProps) {
  const [cityRes, jobsRes] = await Promise.all([
    getCity(params.city),
    getJobs({ india_friendly: true, limit: 5 }),
  ]);

  if (!cityRes.success || !cityRes.data) {
    notFound();
  }

  const city = cityRes.data;
  const jobs = jobsRes.data || [];
  const { costs, visa } = city;

  const totalInr = usdToInr(city.monthly_total_budget_usd);

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
        <Link href="/cities" className="hover:text-primary transition-colors">
          Cities
        </Link>
        <span className="mx-2">›</span>
        <span className="text-text-secondary">{city.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        {/* City photo banner */}
        {city.image_url && (
          <div className="relative h-52 sm:h-72 w-full rounded-2xl overflow-hidden mb-6">
            <Image
              src={city.image_url}
              alt={city.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Flag countryCode={city.country_code} size={64} />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
                {city.name}
              </h1>
              <p className="text-text-muted">{city.country} · {city.continent}</p>
            </div>
          </div>
          <SaveCityButton cityId={city.id} />
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="card p-4 text-center">
            <p className="text-xl font-bold text-text-primary">
              {formatInr(totalInr)}
            </p>
            <p className="text-text-muted text-xs mt-1">Monthly cost</p>
          </div>
          {visa && (
            <div className="card p-4 text-center">
              <VisaBadge type={visa.visa_type} />
              <p className="text-text-muted text-xs mt-2">Indian passport</p>
            </div>
          )}
          <div className="card p-4 text-center">
            <p className="text-xl font-bold text-text-primary">
              {city.internet_speed_mbps} Mbps
            </p>
            <p className="text-text-muted text-xs mt-1">Avg internet</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xl font-bold text-text-primary">
              {city.safety_score}/100
            </p>
            <p className="text-text-muted text-xs mt-1">Safety score</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card p-6 mb-6">
        <p className="text-text-secondary leading-relaxed">{city.description}</p>
        {city.best_for.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-text-muted">Best for:</span>
            {city.best_for.map((b) => (
              <span
                key={b}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cost Breakdown */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">
              💸 Cost of Living
            </h2>
            <div className="card p-6 space-y-4">
              {costItems.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-secondary">{item.label}</span>
                    <div className="text-right">
                      <span className="font-semibold text-text-primary">
                        {formatInr(usdToInr(item.usd))}
                      </span>
                      <span className="text-text-muted text-xs ml-2">
                        {formatUsd(item.usd)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(item.usd / city.monthly_total_budget_usd) * 100}
                    color="primary"
                  />
                </div>
              ))}

              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-bold text-text-primary">Total</span>
                <div className="text-right">
                  <span className="font-bold text-text-primary">
                    {formatInr(totalInr)}
                  </span>
                  <span className="text-text-muted text-sm ml-2">
                    {formatUsd(city.monthly_total_budget_usd)}/mo
                  </span>
                </div>
              </div>

              <p className="text-text-muted text-xs">
                Source: Numbeo · Updated{" "}
                {new Date(city.updated_at).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <Link
              href={`/cost-calculator?city=${city.slug}`}
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Calculate with your salary →
            </Link>
          </section>

          {/* Visa Section */}
          {visa && (
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">
                🛂 Visa for Indian Passport
              </h2>
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <VisaBadge type={visa.visa_type} />
                  {visa.max_stay_days && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-text-primary">
                        {visa.max_stay_days}
                      </p>
                      <p className="text-text-muted text-xs">days max stay</p>
                    </div>
                  )}
                </div>

                {visa.notes && (
                  <div className="bg-surface-2 rounded-xl p-4">
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {visa.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {visa.evisa_link && (
                    <a
                      href={visa.evisa_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      Apply for e-Visa ↗
                    </a>
                  )}
                  {visa.embassy_link && (
                    <a
                      href={visa.embassy_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm"
                    >
                      Official embassy ↗
                    </a>
                  )}
                </div>

                <p className="text-text-muted text-xs">
                  Verified:{" "}
                  {new Date(visa.last_verified_at).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  <a
                    href={`mailto:data@nomadly.in?subject=Incorrect visa data: ${city.country}`}
                    className="text-danger hover:underline"
                  >
                    Report incorrect info
                  </a>
                </p>
              </div>
            </section>
          )}

          {/* City Details */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">
              🏙️ City Overview
            </h2>
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

          {/* Jobs Section */}
          {jobs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">
                  💼 Remote Jobs
                </h2>
                <Link href="/jobs" className="text-sm text-primary hover:underline">
                  See all jobs →
                </Link>
              </div>
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Wise affiliate */}
          <a
            href={getAffiliateLink("wise")}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-border hover:border-green-500/30 bg-surface transition-all group"
          >
            <div className="text-2xl mb-2">💱</div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-green-400">
              Transfer money to {city.country}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Real exchange rates. No hidden fees. First transfer free.
            </p>
            <p className="text-xs text-primary mt-2">Try Wise ↗</p>
          </a>

          {/* SafetyWing */}
          <a
            href={getAffiliateLink("safetywing")}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-border hover:border-blue-500/30 bg-surface transition-all group"
          >
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-blue-400">
              Travel insurance
            </p>
            <p className="text-xs text-text-muted mt-1">
              SafetyWing covers medical + travel. From $45/month.
            </p>
            <p className="text-xs text-primary mt-2">Get covered ↗</p>
          </a>

          {/* Airalo */}
          <a
            href={getAffiliateLink("airalo")}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-border hover:border-orange-500/30 bg-surface transition-all group"
          >
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-orange-400">
              eSIM for {city.country}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Buy a local data plan on Airalo before you land. No roaming.
            </p>
            <p className="text-xs text-primary mt-2">Get eSIM ↗</p>
          </a>

          <p className="text-xs text-text-muted text-center">
            We may earn a commission
          </p>
        </aside>
      </div>
    </div>
  );
}
