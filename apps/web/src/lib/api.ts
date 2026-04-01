import type {
  ApiResponse,
  City,
  CityDetail,
  Job,
  VisaCheckResponse,
} from "@nomadly/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timer);

    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (e) {
    console.error(`API error for ${path}:`, e);
    return {
      success: false,
      data: null,
      error: "Network error — please try again",
    };
  }
}

// Visa
export async function checkVisa(
  to: string
): Promise<ApiResponse<VisaCheckResponse>> {
  return apiFetch<VisaCheckResponse>(`/visa/check?from=IN&to=${to}`);
}

export async function getVisaCountries(): Promise<
  ApiResponse<Array<{ code: string; name: string }>>
> {
  return apiFetch<Array<{ code: string; name: string }>>("/visa/countries");
}

// Cities
export async function getCities(params?: {
  continent?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<City[]>> {
  const query = new URLSearchParams();
  if (params?.continent) query.set("continent", params.continent);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<City[]>(`/cities${qs}`);
}

export async function getCity(
  slug: string
): Promise<ApiResponse<CityDetail>> {
  return apiFetch<CityDetail>(`/cities/${slug}`);
}

// Jobs
export async function getJobs(params?: {
  stack?: string;
  min_salary?: number;
  india_friendly?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Job[]>> {
  const query = new URLSearchParams();
  if (params?.stack) query.set("stack", params.stack);
  if (params?.min_salary) query.set("min_salary", String(params.min_salary));
  if (params?.india_friendly !== undefined)
    query.set("india_friendly", String(params.india_friendly));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<Job[]>(`/jobs${qs}`);
}

export async function getJob(id: string): Promise<ApiResponse<Job>> {
  return apiFetch<Job>(`/jobs/${id}`);
}
