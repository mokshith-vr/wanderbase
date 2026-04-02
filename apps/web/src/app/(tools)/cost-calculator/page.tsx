"use client";

import { useState, useEffect } from "react";
import { getCities, getCity } from "@/lib/api";
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
import type { City, CityDetail, ColivingOption } from "@nomadly/types";

const BUDGET_PRESETS = [
  { label: "₹50k", monthly: 50000 },
  { label: "₹75k", monthly: 75000 },
  { label: "₹1L", monthly: 100000 },
  { label: "₹1.5L", monthly: 150000 },
  { label: "₹2L", monthly: 200000 },
];

type TravelStyle = "backpacker" | "balanced" | "comfortable";

const TRAVEL_STYLES: { id: TravelStyle; label: string; emoji: string; desc: string }[] = [
  {
    id: "backpacker",
    label: "Backpacker",
    emoji: "🎒",
    desc: "Hostel room, street food, public transport, café WiFi",
  },
  {
    id: "balanced",
    label: "Balanced",
    emoji: "⚖️",
    desc: "Shared flat, mix of local & restaurant food, 10 days coworking",
  },
  {
    id: "comfortable",
    label: "Comfortable",
    emoji: "🛋️",
    desc: "Studio/1BHK, mostly restaurants, Grab/taxi, full coworking",
  },
];

// Style multipliers applied to Numbeo base costs
// Backpacker: cut rent (shared room ~50%), food (street food ~60%), coworking = 0
// Balanced: private room in local flat ~75% of Numbeo 1BR, food ~80%, 10 days coworking
// Comfortable: Numbeo full costs + full coworking membership
const STYLE_CONFIG: Record<TravelStyle, {
  rentMultiplier: number;
  foodMultiplier: number;
  transportMultiplier: number;
  coworkingDays: number;
  accommodationNote: string;
  foodNote: string;
}> = {
  backpacker: {
    rentMultiplier: 0.45,   // private hostel room or shared flat
    foodMultiplier: 0.55,   // mostly street food + occasional restaurant
    transportMultiplier: 0.7,
    coworkingDays: 0,       // works from cafés
    accommodationNote: "Hostel private room or shared guesthouse",
    foodNote: "Street food + local eateries",
  },
  balanced: {
    rentMultiplier: 0.72,   // private room in a local shared flat
    foodMultiplier: 0.78,   // mix of cooking + restaurants
    transportMultiplier: 0.85,
    coworkingDays: 10,
    accommodationNote: "Private room in local shared flat",
    foodNote: "Mix of cooking & restaurants",
  },
  comfortable: {
    rentMultiplier: 1.0,    // full 1BR per Numbeo
    foodMultiplier: 1.0,
    transportMultiplier: 1.0,
    coworkingDays: 22,      // full month coworking membership
    accommodationNote: "1BHK furnished apartment",
    foodNote: "Mostly restaurants + delivery",
  },
};

function estimateCoworkingDayRate(totalUsd: number): number {
  if (totalUsd <= 800) return 5;
  if (totalUsd <= 1200) return 8;
  if (totalUsd <= 1800) return 12;
  if (totalUsd <= 2500) return 18;
  return 25;
}

export default function CostCalculatorPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCitySlug, setSelectedCitySlug] = useState("");
  const [cityDetail, setCityDetail] = useState<CityDetail | null>(null);
  const [monthlySalaryInr, setMonthlySalaryInr] = useState<number>(100000);
  const [salaryInput, setSalaryInput] = useState("1,00,000");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("balanced");

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

  async function handleCalculate() {
    if (!selectedCitySlug) return;
    setHasCalculated(true);
    const res = await getCity(selectedCitySlug);
    if (res.success && res.data) setCityDetail(res.data);
  }

  const canCalculate = selectedCitySlug && monthlySalaryInr > 0;

  const getResults = () => {
    if (!selectedCity || !hasCalculated || !cityDetail?.costs) return null;

    const { costs } = cityDetail;
    const style = STYLE_CONFIG[travelStyle];
    const dayRate = estimateCoworkingDayRate(selectedCity.monthly_total_budget_usd);

    const rentInr = usdToInr(costs.rent_usd * style.rentMultiplier);
    const foodInr = usdToInr(costs.food_usd * style.foodMultiplier);
    const transportInr = usdToInr(costs.transport_usd * style.transportMultiplier);
    const utilitiesInr = usdToInr(costs.utilities_usd);
    const simInr = usdToInr(12); // ~$12/mo local SIM, consistent across styles
    const coworkingInr = usdToInr(dayRate * style.coworkingDays);

    const cityMonthlyInr = rentInr + foodInr + transportInr + utilitiesInr + simInr + coworkingInr;
    const affordability = getAffordability(cityMonthlyInr, monthlySalaryInr);
    const savingsInr = monthlySalaryInr - cityMonthlyInr;

    const costItems = [
      { label: "Accommodation", sublabel: style.accommodationNote, inr: rentInr, color: "primary" as const },
      { label: "Food", sublabel: style.foodNote, inr: foodInr, color: "success" as const },
      { label: "Transport", sublabel: "Local transit + occasional taxi/scooter", inr: transportInr, color: "warning" as const },
      { label: "Utilities & internet", sublabel: "Electricity, water, home WiFi", inr: utilitiesInr, color: "danger" as const },
      { label: "SIM / mobile data", sublabel: "Local SIM with data plan", inr: simInr, color: "success" as const },
      ...(style.coworkingDays > 0 ? [{
        label: "Coworking space",
        sublabel: travelStyle === "comfortable"
          ? "Full monthly membership"
          : `${style.coworkingDays} day passes/mo · $${dayRate}/day`,
        inr: coworkingInr,
        color: "primary" as const,
      }] : []),
    ];

    // Recommended accommodation from coliving data
    const colivingOptions = cityDetail.coliving_options ?? [];
    const recommendedPlace = travelStyle === "backpacker"
      ? colivingOptions.find((o: ColivingOption) => o.type === "hostel") ?? colivingOptions[0]
      : travelStyle === "balanced"
      ? colivingOptions.find((o: ColivingOption) => o.type === "coliving") ?? colivingOptions[0]
      : colivingOptions[0];

    return {
      cityMonthlyInr,
      savingsInr,
      affordability,
      costItems,
      recommendedPlace,
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
              setCityDetail(null);
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

        {/* Travel style selector */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Your travel style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TRAVEL_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setTravelStyle(style.id)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                  travelStyle === style.id
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-surface-2 border-border text-text-secondary hover:border-primary/30"
                )}
              >
                <span className="text-xl mb-1">{style.emoji}</span>
                <span className="text-xs font-semibold">{style.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-2">
            {TRAVEL_STYLES.find((s) => s.id === travelStyle)?.desc}
          </p>
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

          {/* Recommended place based on travel style */}
          {results.recommendedPlace && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-text-primary">🏡 Where to stay</h3>
                <span className="text-xs text-text-muted">for {TRAVEL_STYLES.find(s => s.id === travelStyle)?.label} style</span>
              </div>
              <a
                href={results.recommendedPlace.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-3 rounded-xl bg-surface-2 hover:bg-primary/5 border border-border hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-lg flex-shrink-0">
                  {results.recommendedPlace.type === "coliving" ? "🏘️" : results.recommendedPlace.type === "hostel" ? "🛏️" : "🏠"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary">{results.recommendedPlace.name}</p>
                    <p className="text-sm font-bold text-text-primary flex-shrink-0 ml-2">
                      {results.recommendedPlace.price_per_month_usd
                        ? `${formatInr(usdToInr(results.recommendedPlace.price_per_month_usd))}/mo`
                        : results.recommendedPlace.price_per_night_usd
                        ? `${formatInr(usdToInr(results.recommendedPlace.price_per_night_usd))}/night`
                        : ""}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted">{results.recommendedPlace.neighborhood}</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{results.recommendedPlace.highlight}</p>
                  <div className="flex gap-2 mt-1.5">
                    {results.recommendedPlace.wifi_mbps && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-muted">{results.recommendedPlace.wifi_mbps} Mbps</span>
                    )}
                    {results.recommendedPlace.includes_desk && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-muted">desk included</span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary ml-auto">Book ↗</span>
                  </div>
                </div>
              </a>
              <p className="text-[11px] text-text-muted">
                Not included in cost above — accommodation is separate from the living cost breakdown.
              </p>
            </div>
          )}

          {/* Cost breakdown */}
          <div className="card p-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold text-text-primary">Cost breakdown</h3>
              <span className="text-[10px] text-text-muted">Source: Numbeo · verified 2025</span>
            </div>
            {results.costItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <div>
                    <span className="text-sm text-text-secondary font-medium">{item.label}</span>
                    <p className="text-[11px] text-text-muted">{item.sublabel}</p>
                  </div>
                  <span className="text-sm font-semibold text-text-primary self-start">
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
          <div className="card p-5 space-y-2">
            <p className="text-text-secondary text-sm leading-relaxed">
              Your monthly budget of{" "}
              <span className="font-semibold text-text-primary">{formatInr(monthlySalaryInr)}</span>{" "}
              (≈ ${Math.round(monthlySalaryInr / 83.5).toLocaleString()}/mo) vs. living in {selectedCity.name} as a <strong>{travelStyle}</strong> for{" "}
              <span className="font-semibold text-text-primary">{formatInr(results.cityMonthlyInr)}</span> —{" "}
              <span className={results.savingsInr >= 0 ? "text-success font-semibold" : "text-danger font-semibold"}>
                {results.savingsInr >= 0
                  ? `you save ${formatInr(results.savingsInr)}/mo`
                  : `${formatInr(Math.abs(results.savingsInr))}/mo over budget`}
              </span>.
            </p>
            <p className="text-[11px] text-text-muted">
              Cost figures from Numbeo city averages. Coworking estimated from local market rates. Accommodation not included — see options above.
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
