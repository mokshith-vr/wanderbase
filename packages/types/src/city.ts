import { z } from "zod";
import { VisaRequirementSchema } from "./visa";

export const ContinentEnum = z.enum([
  "Asia",
  "Europe",
  "Americas",
  "Africa",
  "Oceania",
]);

export type Continent = z.infer<typeof ContinentEnum>;

export const EnglishProficiencyEnum = z.enum(["high", "medium", "low"]);
export type EnglishProficiency = z.infer<typeof EnglishProficiencyEnum>;

export const CostBreakdownSchema = z.object({
  rent_usd: z.number(),
  food_usd: z.number(),
  transport_usd: z.number(),
  utilities_usd: z.number(),
  total_usd: z.number(),
});

export type CostBreakdown = z.infer<typeof CostBreakdownSchema>;

export const CitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  country_code: z.string(),
  continent: ContinentEnum,
  flag_emoji: z.string(),
  monthly_total_budget_usd: z.number(),
  internet_speed_mbps: z.number(),
  safety_score: z.number(), // 0-100
  english_proficiency: EnglishProficiencyEnum,
  coworking_count: z.number(),
  timezone: z.string(),
  currency_code: z.string(),
  image_url: z.string().nullable(),
});

export type City = z.infer<typeof CitySchema>;

export const CityDetailSchema = CitySchema.extend({
  costs: CostBreakdownSchema,
  visa: VisaRequirementSchema.nullable(),
  jobs_count: z.number(),
  description: z.string(),
  best_for: z.array(z.string()),
  updated_at: z.string(),
});

export type CityDetail = z.infer<typeof CityDetailSchema>;
