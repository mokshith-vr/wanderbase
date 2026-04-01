"use client";

import { useState, useEffect } from "react";
import { getCities } from "@/lib/api";
import {
  formatInr,
  usdToInr,
  formatUsd,
  getAffordability,
  AFFORDABILITY_LABELS,
  AFFORDABILITY_COLORS,
  cn,
} from "@/lib/utils";
import { getAffiliateLink, trackAffiliateClick } from "@/lib/affiliate";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { City } from "@nomadly/types";

const BUDGET_PRESETS = [
  { label: "₹50k", monthly: 50000 },
  { label: "₹75k", monthly: 75000 },
  { label: "₹1L", monthly: 100000 },
  { label: "₹1.5L", monthly: 150000 },
  { label: "₹2L", monthly: 200000 },
];

export default function CostCalculatorPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCitySlug, setSelectedCitySlug] = useState("");
  const [monthlySalaryInr, setMonthlySalaryInr] = useState<number>(150000);
  const [salaryInput, setSalaryInput] = useState("1,50,000");
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    getCities({ sort: "cost", limit: 20 }).then((res) => {
      if (res.success && res.data) setCities(res.data);
    });
  }, []);

  const selectedCity = cities.find((c) => c.slug === selectedCitySlug);

  function handleSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw) || 0;
    setMonthlySalaryInr(num);
    setSalaryInput(num.toLocaleString("en-IN"));
  }

  function handlePreset(monthly: number) {
    setMonthlySalaryInr(monthly);
    setSalaryInput(monthly.toLocaleString("en-IN"));
  }

  function handleCalculate() {
    setHasCalculated(true);
  }

  const canCalculate = selectedCitySlug && monthlySalaryInr > 0;

  // Calculation results
  const getResults = () => {
    if (!selectedCity || !hasCalculated) return null;

    const cityMonthlyInr = usdToInr(selectedCity.monthly_total_budget_usd);
    const rentInr = usdToInr(
      Math.round(selectedCity.monthly_total_budget_usd * 0.38)
    );
    const foodInr = usdToInr(
      Math.round(selectedCity.monthly_total_budget_usd * 0.25)
    );
    const transportInr = usdToInr(
      Math.round(selectedCity.monthly_total_budget_usd * 0.07)
    );
    const utilitiesInr = usdToInr(
      Math.round(selectedCity.monthly_total_budget_usd * 0.05)
    );
    const otherInr = cityMonthlyInr - rentInr - foodInr - transportInr - utilitiesInr;

    const affordability = getAffordability(cityMonthlyInr, monthlySalaryInr);
    const savingsInr = monthlySalaryInr - cityMonthlyInr;

    const costItems = [
      { label: "Rent (1BR apt, city centre)", inr: rentInr, color: "primary" as const },
      { label: "Food & groceries", inr: foodInr, color: "success" as const },
      { label: "Transport", inr: transportInr, color: "warning" as const },
      { label: "Utilities & internet", inr: utilitiesInr, color: "danger" as const },
      { label: "Misc & leisure", inr: otherInr, color: "primary" as const },
    ];

    return {
      cityMonthlyInr,
      savingsInr,
      affordability,
      costItems,
    };
  };

  const results = getResults();

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="border-b border-border" style={{
        background: "linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 50%, #FAFAF8 100%)"
      }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] text-text-primary mb-4">
            Cost of Living Calculator
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            Enter your monthly budget and pick a city to see exactly how much you'd spend — with all costs in ₹.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

      {/* Input card */}
      <div className="card p-6 space-y-5">
        {/* Salary input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Your monthly budget (in ₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">
              ₹
            </span>
            <input
              type="text"
              value={salaryInput}
              onChange={handleSalaryChange}
              placeholder="1,50,000"
              className="input-base pl-8"
            />
          </div>
          {/* Salary presets */}
          <div className="flex flex-wrap gap-2 mt-3">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.monthly)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  monthlySalaryInr === preset.monthly
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-surface-2 text-text-secondary border-border hover:border-primary/40"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* City select */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Destination city
          </label>
          <select
            value={selectedCitySlug}
            onChange={(e) => {
              setSelectedCitySlug(e.target.value);
              setHasCalculated(false);
            }}
            className="input-base"
          >
            <option value="">Select a city...</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.flag_emoji} {city.name}, {city.country} — ${city.monthly_total_budget_usd}/mo
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!canCalculate}
          size="lg"
          className="w-full"
        >
          Calculate affordability
        </Button>
      </div>

      {/* Results */}
      {results && selectedCity && (
        <div className="mt-6 space-y-4 animate-slide-up">
          {/* Summary card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedCity.flag_emoji}</span>
              <div>
                <h2 className="font-bold text-text-primary text-lg">
                  {selectedCity.name}, {selectedCity.country}
                </h2>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    AFFORDABILITY_COLORS[results.affordability]
                  )}
                >
                  {AFFORDABILITY_LABELS[results.affordability]}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-2 rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Monthly cost</p>
                <p className="text-xl font-bold text-text-primary">
                  {formatInr(results.cityMonthlyInr)}
                </p>
                <p className="text-xs text-text-muted">
                  {formatUsd(selectedCity.monthly_total_budget_usd)}/mo
                </p>
              </div>
              <div
                className={cn(
                  "rounded-xl p-4",
                  results.savingsInr >= 0
                    ? "bg-success/10 border border-success/20"
                    : "bg-danger/10 border border-danger/20"
                )}
              >
                <p className="text-xs text-text-muted mb-1">
                  {results.savingsInr >= 0 ? "Monthly savings" : "Monthly shortfall"}
                </p>
                <p
                  className={cn(
                    "text-xl font-bold",
                    results.savingsInr >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {results.savingsInr >= 0 ? "+" : ""}
                  {formatInr(results.savingsInr)}
                </p>
                <p className="text-xs text-text-muted">after all expenses</p>
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-text-primary">Cost breakdown</h3>
            {results.costItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-semibold text-text-primary">
                    {formatInr(item.inr)}
                  </span>
                </div>
                <Progress
                  value={(item.inr / results.cityMonthlyInr) * 100}
                  color={item.color}
                />
              </div>
            ))}

            <div className="flex justify-between text-sm pt-3 border-t border-border">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="font-bold text-text-primary">
                {formatInr(results.cityMonthlyInr)}
              </span>
            </div>
          </div>

          {/* Context */}
          <div className="card p-5">
            <p className="text-text-secondary text-sm leading-relaxed">
              Your monthly budget of{" "}
              <span className="font-semibold text-text-primary">
                {formatInr(monthlySalaryInr)}
              </span>{" "}
              converted to USD is approximately{" "}
              <span className="font-semibold text-text-primary">
                ${Math.round(monthlySalaryInr / 83.5).toLocaleString()}/month
              </span>
              . Living in {selectedCity.name} would cost you{" "}
              <span className="font-semibold text-text-primary">
                {formatInr(results.cityMonthlyInr)}
              </span>{" "}
              — that&apos;s{" "}
              <span
                className={
                  results.savingsInr >= 0 ? "text-success font-semibold" : "text-danger font-semibold"
                }
              >
                {results.savingsInr >= 0
                  ? `${Math.round((results.savingsInr / monthlySalaryInr) * 100)}% of your budget saved`
                  : `${Math.abs(Math.round((results.savingsInr / monthlySalaryInr) * 100))}% more than your budget`}
              </span>
              .
            </p>
          </div>

          {/* Affiliates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={getAffiliateLink("airalo")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick("airalo", "cost_calculator")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 bg-surface transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl flex-shrink-0">
                📱
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                  Airalo eSIM for {selectedCity.country}
                </p>
                <p className="text-xs text-text-muted">No roaming charges ↗</p>
              </div>
            </a>

            <a
              href={getAffiliateLink("wise")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick("wise", "cost_calculator")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 bg-surface transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl flex-shrink-0">
                💱
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                  Transfer money with Wise
                </p>
                <p className="text-xs text-text-muted">Real rates, no hidden fees ↗</p>
              </div>
            </a>
          </div>
          <p className="text-xs text-text-muted text-center">
            We may earn a commission · Doesn&apos;t affect the price you pay
          </p>
        </div>
      )}
    </div>
    </div>
  );
}
