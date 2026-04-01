import { z } from "zod";

export const LocationTypeEnum = z.enum(["fully_remote", "remote_friendly"]);
export type LocationType = z.infer<typeof LocationTypeEnum>;

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  company_logo_url: z.string().nullable(),
  location_type: LocationTypeEnum,
  india_friendly: z.boolean(),
  salary_min_usd: z.number().nullable(),
  salary_max_usd: z.number().nullable(),
  tech_stack: z.array(z.string()),
  job_url: z.string(),
  source: z.string(),
  is_featured: z.boolean(),
  posted_at: z.string(),
});

export type Job = z.infer<typeof JobSchema>;

export const JobFilterSchema = z.object({
  stack: z.string().optional(),
  min_salary: z.coerce.number().optional(),
  india_friendly: z.coerce.boolean().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export type JobFilter = z.infer<typeof JobFilterSchema>;
