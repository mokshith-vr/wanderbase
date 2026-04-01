import { z } from "zod";

export const ApiMetaSchema = z.object({
  page: z.number().optional(),
  total: z.number().optional(),
  cached_at: z.string().nullable().optional(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: z.string().nullable(),
    meta: ApiMetaSchema.optional(),
  });

export type ApiMeta = z.infer<typeof ApiMetaSchema>;

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: ApiMeta;
};

export function ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return { success: true, data, error: null, meta };
}

export function err(message: string): ApiResponse<null> {
  return { success: false, data: null, error: message };
}
