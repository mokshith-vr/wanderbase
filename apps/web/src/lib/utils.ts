import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fixed exchange rate — update periodically or wire to an API
const USD_TO_INR = 83.5;

export function usdToInr(usd: number): number {
  return Math.round(usd * USD_TO_INR);
}

// Format as Indian number system: ₹1,50,000
export function formatInr(inr: number): string {
  const num = Math.round(inr);
  if (num >= 100000) {
    // Format in lakhs
    const lakhs = num / 100000;
    if (lakhs >= 10) {
      return `₹${lakhs.toFixed(1)}L`;
    }
    return `₹${lakhs.toFixed(2)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

// Format USD
export function formatUsd(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

// Show both USD and INR equivalent
export function formatCost(usd: number): string {
  return `${formatUsd(usd)} · ${formatInr(usdToInr(usd))}/mo`;
}

// Determine affordability given user's monthly salary in INR
export type AffordabilityLevel = "comfortable" | "moderate" | "tight" | "stretch";

export function getAffordability(
  monthlyCostInr: number,
  monthlySalaryInr: number
): AffordabilityLevel {
  const ratio = monthlyCostInr / monthlySalaryInr;
  if (ratio <= 0.5) return "comfortable";
  if (ratio <= 0.7) return "moderate";
  if (ratio <= 0.9) return "tight";
  return "stretch";
}

export const AFFORDABILITY_LABELS: Record<AffordabilityLevel, string> = {
  comfortable: "Comfortable",
  moderate: "Manageable",
  tight: "Tight but doable",
  stretch: "Stretch",
};

export const AFFORDABILITY_COLORS: Record<AffordabilityLevel, string> = {
  comfortable: "text-success",
  moderate: "text-primary",
  tight: "text-warning",
  stretch: "text-danger",
};

// Format salary range
export function formatSalaryRange(
  minUsd: number | null,
  maxUsd: number | null
): string {
  if (!minUsd && !maxUsd) return "Salary not specified";
  if (minUsd && !maxUsd) return `$${minUsd.toLocaleString()}+/mo`;
  if (!minUsd && maxUsd) return `Up to $${maxUsd.toLocaleString()}/mo`;
  return `$${minUsd!.toLocaleString()} – $${maxUsd!.toLocaleString()}/mo`;
}

// Time ago
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}
