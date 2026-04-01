import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  current_salary_inr: z.number().nullable(),
  current_city: z.string().nullable(),
  profession: z.string().nullable(),
  is_premium: z.boolean(),
  premium_expires_at: z.string().nullable(),
  created_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const UserProfileSchema = UserSchema.pick({
  name: true,
  current_salary_inr: true,
  current_city: true,
  profession: true,
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
