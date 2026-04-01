import { z } from "zod";

export const VisaTypeEnum = z.enum([
  "visa_free",
  "visa_on_arrival",
  "evisa",
  "visa_required",
]);

export type VisaType = z.infer<typeof VisaTypeEnum>;

export const VisaRequirementSchema = z.object({
  id: z.string(),
  passport_country_code: z.string(),
  destination_country_code: z.string(),
  destination_country_name: z.string(),
  visa_type: VisaTypeEnum,
  max_stay_days: z.number().nullable(),
  evisa_link: z.string().nullable(),
  embassy_link: z.string().nullable(),
  notes: z.string().nullable(),
  last_verified_at: z.string(),
});

export type VisaRequirement = z.infer<typeof VisaRequirementSchema>;

export const VisaCheckResponseSchema = z.object({
  requirement: VisaRequirementSchema,
  is_stale: z.boolean(),
});

export type VisaCheckResponse = z.infer<typeof VisaCheckResponseSchema>;

export const VISA_TYPE_LABELS: Record<VisaType, string> = {
  visa_free: "Visa Free",
  visa_on_arrival: "Visa on Arrival",
  evisa: "e-Visa",
  visa_required: "Visa Required",
};

export const VISA_TYPE_COLORS: Record<VisaType, string> = {
  visa_free: "success",
  visa_on_arrival: "warning",
  evisa: "warning",
  visa_required: "danger",
};
