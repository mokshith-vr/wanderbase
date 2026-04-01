"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { checkVisa, getCity, getJobs } from "@/lib/api";
import { formatInr, usdToInr, cn } from "@/lib/utils";
import { getAffiliateLink, trackAffiliateClick } from "@/lib/affiliate";
import { VisaBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { CityDetail, VisaCheckResponse, Job } from "@nomadly/types";

// Top cities for autocomplete
const POPULAR_CITIES = [
  { slug: "bali", name: "Bali", country: "Indonesia", flag: "🇮🇩" },
  { slug: "lisbon", name: "Lisbon", country: "Portugal", flag: "🇵🇹" },
  { slug: "tbilisi", name: "Tbilisi", country: "Georgia", flag: "🇬🇪" },
  { slug: "chiang-mai", name: "Chiang Mai", country: "Thailand", flag: "🇹🇭" },
  { slug: "medellin", name: "Medellín", country: "Colombia", flag: "🇨🇴" },
  { slug: "budapest", name: "Budapest", country: "Hungary", flag: "🇭🇺" },
  { slug: "prague", name: "Prague", country: "Czech Republic", flag: "🇨🇿" },
  { slug: "tallinn", name: "Tallinn", country: "Estonia", flag: "🇪🇪" },
  { slug: "mexico-city", name: "Mexico City", country: "Mexico", flag: "🇲🇽" },
  { slug: "bangkok", name: "Bangkok", country: "Thailand", flag: "🇹🇭" },
  { slug: "barcelona", name: "Barcelona", country: "Spain", flag: "🇪🇸" },
  { slug: "porto", name: "Porto", country: "Portugal", flag: "🇵🇹" },
  { slug: "taipei", name: "Taipei", country: "Taiwan", flag: "🇹🇼" },
  { slug: "seoul", name: "Seoul", country: "South Korea", flag: "🇰🇷" },
  { slug: "cape-town", name: "Cape Town", country: "South Africa", flag: "🇿🇦" },
  { slug: "dubai", name: "Dubai", country: "UAE", flag: "🇦🇪" },
  { slug: "kuala-lumpur", name: "Kuala Lumpur", country: "Malaysia", flag: "🇲🇾" },
  {
    slug: "ho-chi-minh-city",
    name: "Ho Chi Minh City",
    country: "Vietnam",
    flag: "🇻🇳",
  },
  { slug: "berlin", name: "Berlin", country: "Germany", flag: "🇩🇪" },
  {
    slug: "playa-del-carmen",
    name: "Playa del Carmen",
    country: "Mexico",
    flag: "🇲🇽",
  },
];

type SnapshotState = "idle" | "loading" | "loaded" | "error";

interface SnapshotData {
  city: CityDetail;
  visa: VisaCheckResponse | null;
  jobs: Job[];
}

export function CitySnapshotWidget() {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<(typeof POPULAR_CITIES)[0] | null>(null);
  const [state, setState] = useState<SnapshotState>("idle");
  const [data, setData] = useState<SnapshotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? POPULAR_CITIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.country.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_CITIES;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleCitySelect(city: (typeof POPULAR_CITIES)[0]) {
    setSelectedCity(city);
    setQuery(city.name);
    setShowDropdown(false);
    setState("loading");
    setError(null);

    try {
      const [cityRes, jobsRes] = await Promise.all([
        getCity(city.slug),
        getJobs({ india_friendly: true, limit: 25 }),
      ]);

      if (!cityRes.success || !cityRes.data) {
        throw new Error(cityRes.error || "City not found");
      }

      // Fetch visa separately using city's country code
      const visaRes = await checkVisa(cityRes.data.country_code);

      setData({
        city: cityRes.data,
        visa: visaRes.success && visaRes.data ? visaRes.data : null,
        jobs: jobsRes.data || [],
      });
      setState("loaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      setState("error");
    }
  }

  function handleRetry() {
    if (selectedCity) {
      handleCitySelect(selectedCity);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Type a city — Bali, Lisbon, Tbilisi..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border-2 border-border focus:border-primary text-text-primary placeholder:text-text-muted text-base focus:outline-none transition-colors shadow-xl shadow-black/20"
          />
          {query && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              onClick={() => {
                setQuery("");
                setSelectedCity(null);
                setState("idle");
                setData(null);
                inputRef.current?.focus();
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden max-h-72 overflow-y-auto"
          >
            {filtered.slice(0, 10).map((city) => (
              <button
                key={city.slug}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left"
                onClick={() => handleCitySelect(city)}
              >
                <span className="text-2xl leading-none">{city.flag}</span>
                <div>
                  <div className="font-medium text-text-primary text-sm">{city.name}</div>
                  <div className="text-text-muted text-xs">{city.country}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {state === "idle" && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {["Bali", "Lisbon", "Tbilisi", "Mexico City", "Bangkok"].map((name) => {
            const city = POPULAR_CITIES.find((c) => c.name === name)!;
            return (
              <button
                key={name}
                onClick={() => handleCitySelect(city)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border hover:border-primary/50 text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                <span>{city.flag}</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      )}

      {state === "loading" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="mt-6 card p-6 text-center">
          <p className="text-danger font-medium mb-2">Couldn&apos;t load data</p>
          <p className="text-text-muted text-sm mb-4">{error}</p>
          <button onClick={handleRetry} className="btn-secondary text-sm">
            Try again
          </button>
        </div>
      )}

      {state === "loaded" && data && (
        <div className="mt-6 space-y-4 animate-slide-up">
          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Visa Card */}
            <VisaCard visa={data.visa} cityName={data.city.name} countryCode={data.city.country_code} />

            {/* Cost Card */}
            <CostCard city={data.city} />

            {/* Jobs Card */}
            <JobsCard jobs={data.jobs} cityName={data.city.name} />
          </div>

          {/* Affiliate strip */}
          <AffiliateStrip countryName={data.city.country} />

          {/* Full city link */}
          <div className="text-center">
            <Link
              href={`/cities/${data.city.slug}`}
              className="text-sm text-primary hover:underline"
            >
              See full guide for {data.city.name} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function VisaCard({
  visa,
  cityName,
  countryCode,
}: {
  visa: VisaCheckResponse | null;
  cityName: string;
  countryCode: string;
}) {
  if (!visa) {
    return (
      <div className="card p-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          🛂 Visa Status
        </p>
        <p className="text-text-muted text-sm">
          Visa data not available for this country
        </p>
        <Link href="/visa-checker" className="mt-3 inline-block text-xs text-primary hover:underline">
          Try Visa Checker →
        </Link>
      </div>
    );
  }

  const { requirement, is_stale } = visa;

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          🛂 Visa Status
        </p>
        {is_stale && (
          <span className="text-xs text-warning">⚠ May be outdated</span>
        )}
      </div>

      <VisaBadge type={requirement.visa_type} />

      {requirement.max_stay_days && (
        <p className="text-2xl font-bold text-text-primary">
          {requirement.max_stay_days}
          <span className="text-sm font-normal text-text-muted ml-1">days</span>
        </p>
      )}

      {requirement.notes && (
        <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
          {requirement.notes}
        </p>
      )}

      <div className="flex flex-col gap-1.5 pt-1">
        {requirement.evisa_link && (
          <a
            href={requirement.evisa_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Apply for e-Visa →
          </a>
        )}
        {requirement.embassy_link && (
          <a
            href={requirement.embassy_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Official source ↗
          </a>
        )}
      </div>

      <p className="text-text-muted text-xs border-t border-border pt-2">
        Verified{" "}
        {new Date(requirement.last_verified_at).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

function CostCard({ city }: { city: CityDetail }) {
  const totalInr = usdToInr(city.monthly_total_budget_usd);
  const { costs } = city;

  const items = [
    { label: "Rent", usd: costs.rent_usd, color: "primary" as const },
    { label: "Food", usd: costs.food_usd, color: "success" as const },
    { label: "Transport", usd: costs.transport_usd, color: "warning" as const },
  ];

  return (
    <div className="card p-5 space-y-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
        💸 Monthly Cost
      </p>

      <div>
        <p className="text-2xl font-bold text-text-primary">
          {formatInr(totalInr)}
        </p>
        <p className="text-text-muted text-xs">${city.monthly_total_budget_usd}/month</p>
      </div>

      <div className="space-y-2 pt-1">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>{item.label}</span>
              <span>{formatInr(usdToInr(item.usd))}</span>
            </div>
            <Progress
              value={(item.usd / city.monthly_total_budget_usd) * 100}
              color={item.color}
            />
          </div>
        ))}
      </div>

      <Link
        href={`/cost-calculator`}
        className="text-xs text-primary hover:underline block pt-1"
      >
        Calculate with your salary →
      </Link>
    </div>
  );
}

function JobsCard({ jobs, cityName }: { jobs: Job[]; cityName: string }) {
  const count = jobs.length;
  const topStacks = Array.from(
    new Set(jobs.flatMap((j) => j.tech_stack).slice(0, 6))
  ).slice(0, 3);

  return (
    <div className="card p-5 space-y-3">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
        💼 Remote Jobs
      </p>

      <div>
        <p className="text-2xl font-bold text-text-primary">{count}</p>
        <p className="text-text-muted text-xs">India-friendly jobs open</p>
      </div>

      {topStacks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topStacks.map((stack) => (
            <span
              key={stack}
              className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border"
            >
              {stack}
            </span>
          ))}
        </div>
      )}

      <Link
        href="/jobs"
        className="btn-primary text-xs py-2 w-full justify-center block text-center"
      >
        Browse all jobs →
      </Link>
    </div>
  );
}

function AffiliateStrip({ countryName }: { countryName: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <a
        href={getAffiliateLink("safetywing")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackAffiliateClick("safetywing", "city_snapshot")}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 bg-surface transition-all group"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-base flex-shrink-0">
          🛡️
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors">
            SafetyWing Travel Insurance
          </p>
          <p className="text-xs text-text-muted truncate">From $45/month · nomad-friendly</p>
        </div>
        <span className="text-xs text-text-muted group-hover:text-primary transition-colors">↗</span>
      </a>

      <a
        href={getAffiliateLink("wise")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackAffiliateClick("wise", "city_snapshot")}
        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 bg-surface transition-all group"
      >
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-base flex-shrink-0">
          💱
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors">
            Wise — Send money to {countryName}
          </p>
          <p className="text-xs text-text-muted truncate">Real exchange rates, first transfer free</p>
        </div>
        <span className="text-xs text-text-muted group-hover:text-primary transition-colors">↗</span>
      </a>
    </div>
  );
}
