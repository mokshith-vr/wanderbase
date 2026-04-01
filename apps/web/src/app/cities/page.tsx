"use client";

import { useState, useEffect } from "react";
import { getCities } from "@/lib/api";
import { CityCard } from "@/components/cities/CityCard";
import { CityCardSkeleton } from "@/components/ui/skeleton";
import type { City, Continent } from "@nomadly/types";
import { cn } from "@/lib/utils";

const CONTINENTS: Array<{ value: Continent | "All"; label: string; emoji: string }> = [
  { value: "All",      label: "All",      emoji: "🌍" },
  { value: "Asia",     label: "Asia",     emoji: "🌏" },
  { value: "Europe",   label: "Europe",   emoji: "🌍" },
  { value: "Americas", label: "Americas", emoji: "🌎" },
  { value: "Africa",   label: "Africa",   emoji: "🌍" },
];

const SORT_OPTIONS = [
  { value: "cost",     label: "💰 Cheapest first" },
  { value: "safety",   label: "🛡️ Safest first" },
  { value: "internet", label: "⚡ Fastest internet" },
];

type LoadState = "loading" | "loaded" | "error";

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [continent, setContinent] = useState<Continent | "All">("All");
  const [sort, setSort] = useState("cost");

  async function loadCities() {
    setState("loading");
    const res = await getCities({
      continent: continent !== "All" ? continent : undefined,
      sort,
      limit: 20,
    });
    if (res.success && res.data) {
      setCities(res.data);
      setState("loaded");
    } else {
      setState("error");
    }
  }

  useEffect(() => { loadCities(); }, [continent, sort]);

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Explore</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary mb-3">
            Explore destinations
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            Verified visa data, cost of living in ₹, internet speed, and safety scores.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {/* Continent tabs */}
          <div className="flex items-center gap-1 bg-white/4 backdrop-blur-sm rounded-xl p-1 border border-white/8 overflow-x-auto flex-1">
            {CONTINENTS.map((c) => (
              <button key={c.value} onClick={() => setContinent(c.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                  continent === c.value
                    ? "bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                )}>
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="input-base sm:w-52 bg-white/4 backdrop-blur-sm">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {state === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CityCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-danger font-semibold mb-2">Failed to load cities</p>
            <p className="text-text-muted text-sm mb-6">Check your connection and try again.</p>
            <button onClick={loadCities} className="btn-secondary text-sm">Try again</button>
          </div>
        )}

        {/* Empty */}
        {state === "loaded" && cities.length === 0 && (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-4">🏙️</p>
            <p className="text-text-primary font-semibold mb-2">No cities found</p>
            <p className="text-text-muted text-sm mb-6">No cities in this region yet.</p>
            <button onClick={() => setContinent("All")} className="btn-secondary text-sm">
              Show all continents
            </button>
          </div>
        )}

        {/* Cities grid */}
        {state === "loaded" && cities.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cities.map((city, i) => (
                <div key={city.id} className="animate-[entrance_0.4s_ease_both]"
                  style={{ animationDelay: `${i * 50}ms` }}>
                  <CityCard city={city} />
                </div>
              ))}
            </div>
            <p className="text-text-muted text-xs text-center mt-10">
              Showing {cities.length} destinations · More cities coming soon
            </p>
          </>
        )}
      </div>
    </div>
  );
}
