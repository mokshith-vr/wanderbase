"use client";

import { useState, useEffect } from "react";
import { checkVisa, getVisaCountries } from "@/lib/api";
import { getAffiliateLink, trackAffiliateClick } from "@/lib/affiliate";
import { VisaBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { VisaCheckResponse } from "@nomadly/types";

const DISCLAIMER =
  "Visa requirements can change without notice. Always verify with the official embassy or consulate before making travel plans.";

type PageState = "idle" | "loading" | "loaded" | "error";

const QUICK_DESTINATIONS = [
  { code: "GE", name: "Georgia",   flag: "🇬🇪" },
  { code: "TH", name: "Thailand",  flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MX", name: "Mexico",    flag: "🇲🇽" },
  { code: "MY", name: "Malaysia",  flag: "🇲🇾" },
  { code: "PT", name: "Portugal",  flag: "🇵🇹" },
];

export default function VisaCheckerPage() {
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [state, setState] = useState<PageState>("idle");
  const [result, setResult] = useState<VisaCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVisaCountries().then((res) => {
      if (res.success && res.data) setCountries(res.data);
    });
  }, []);

  async function handleCheck(countryCode?: string) {
    const code = countryCode || selectedCountry;
    if (!code) return;
    if (countryCode) setSelectedCountry(countryCode);
    setState("loading");
    setError(null);
    const res = await checkVisa(code);
    if (res.success && res.data) {
      setResult(res.data);
      setState("loaded");
    } else {
      setError(res.error || "Failed to check visa");
      setState("error");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-border" style={{
        background: "linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 50%, #FAFAF8 100%)"
      }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] text-text-primary mb-4">
            Visa Requirements
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            Instantly check if you need a visa, can get one on arrival, or enter visa-free.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        {/* Checker card */}
        <div className="card p-8 shadow-md">
          <div className="space-y-5">
            {/* Passport */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Your passport
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-2 border border-border">
                <span className="text-2xl">🇮🇳</span>
                <span className="text-text-primary font-semibold">India</span>
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Destination country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="input-base text-base"
              >
                <option value="">Select a destination...</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => handleCheck()}
              disabled={!selectedCountry}
              loading={state === "loading"}
              size="lg"
              className="w-full"
            >
              Check visa requirements →
            </Button>
          </div>

          {/* Quick destinations */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
              Popular destinations
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_DESTINATIONS.map((c) => (
                <button key={c.code} onClick={() => handleCheck(c.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    selectedCountry === c.code
                      ? "bg-primary-light border-primary/30 text-primary"
                      : "bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-primary hover:bg-primary-light"
                  }`}>
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {state === "loading" && (
          <div className="card p-8 space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="card p-8 text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <p className="text-danger font-semibold mb-1">Couldn't load visa data</p>
            <p className="text-text-muted text-sm mb-5">{error}</p>
            <Button variant="secondary" onClick={() => handleCheck()}>Try again</Button>
          </div>
        )}

        {/* Result */}
        {state === "loaded" && result && (
          <div className="space-y-4 animate-[entrance_0.4s_ease_both]">

            {result.is_stale && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning-light border border-warning-border">
                <span className="text-warning mt-0.5">⚠️</span>
                <p className="text-warning text-sm font-medium">
                  This data may be outdated — verify with the official embassy before travel.
                </p>
              </div>
            )}

            {/* Main result */}
            <div className="card p-8 shadow-md space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-text-muted text-sm mb-3">
                    India → {result.requirement.destination_country_name}
                  </p>
                  <VisaBadge type={result.requirement.visa_type} />
                </div>
                {result.requirement.max_stay_days && (
                  <div className="text-right bg-surface-2 rounded-2xl px-5 py-3">
                    <p className="text-4xl font-black text-text-primary leading-none">
                      {result.requirement.max_stay_days}
                    </p>
                    <p className="text-text-muted text-xs mt-1">days max</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {result.requirement.notes && (
                <div className="bg-surface-2 rounded-xl p-5 border border-border">
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {result.requirement.notes}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-col sm:flex-row gap-3">
                {result.requirement.evisa_link && (
                  <a href={result.requirement.evisa_link} target="_blank" rel="noopener noreferrer"
                    className="btn-primary text-sm flex-1 text-center py-3">
                    Apply for e-Visa ↗
                  </a>
                )}
                {result.requirement.embassy_link && (
                  <a href={result.requirement.embassy_link} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-sm flex-1 text-center py-3">
                    Official embassy ↗
                  </a>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-text-muted text-xs">
                  Verified:{" "}
                  {new Date(result.requirement.last_verified_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
                <a href={`mailto:data@nomadly.in?subject=Incorrect visa data: ${result.requirement.destination_country_name}`}
                  className="text-xs text-text-muted hover:text-danger transition-colors">
                  Report error
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-text-muted text-xs px-1 leading-relaxed">{DISCLAIMER}</p>

            {/* SafetyWing */}
            <a href={getAffiliateLink("safetywing")} target="_blank" rel="noopener noreferrer"
              onClick={() => trackAffiliateClick("safetywing", "visa_checker")}
              className="card-hover flex items-center gap-4 p-5 group">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                🛡️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                    SafetyWing Travel Insurance
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted border border-border leading-none flex-shrink-0">
                    sponsored
                  </span>
                </div>
                <p className="text-text-muted text-xs">From $45/month. Medical, trip cancellation & more.</p>
              </div>
              <span className="text-text-muted group-hover:text-primary text-sm flex-shrink-0">↗</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
