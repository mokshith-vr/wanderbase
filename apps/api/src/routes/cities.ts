import { Hono } from "hono";
import { ok, err } from "@nomadly/types";
import { supabase } from "../lib/supabase";
import { getTeleportData } from "../lib/teleport";
import { getCityImage } from "../lib/city-images";
import { CITIES } from "../data/cities";

const cities = new Hono();

// GET /cities?continent=Asia&sort=cost&page=1&limit=20
cities.get("/", async (c) => {
  const continent = c.req.query("continent");
  const sort = c.req.query("sort") || "cost";
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");

  let query = supabase
    .from("cities")
    .select("id, slug, name, country, country_code, continent, flag_emoji, monthly_total_budget_usd, internet_speed_mbps, safety_score, english_proficiency, coworking_count, timezone, currency_code, image_url");

  if (continent) {
    query = query.ilike("continent", continent);
  }

  if (sort === "cost") {
    query = query.order("monthly_total_budget_usd", { ascending: true });
  } else if (sort === "safety") {
    query = query.order("safety_score", { ascending: false });
  } else if (sort === "internet") {
    query = query.order("internet_speed_mbps", { ascending: false });
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1);

  if (error) return c.json(err(error.message), 500);

  // Inject fallback image for each city
  const enriched = (data ?? []).map((city: any) => ({
    ...city,
    image_url: getCityImage(city.slug, city.image_url),
  }));

  return c.json(ok(enriched, { page, total: count ?? enriched.length }));
});

// GET /cities/:slug
cities.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (cityError || !city) return c.json(err(`City not found: ${slug}`), 404);

  // Get accommodation data from seed (not in Supabase yet)
  const seedCity = CITIES.find((c) => c.slug === slug);

  // Fetch Teleport data in parallel with visa/jobs
  const teleportPromise = getTeleportData(slug);

  // Get visa requirement for this city
  const { data: visa } = await supabase
    .from("visa_requirements")
    .select("*")
    .eq("passport_country_code", "IN")
    .eq("destination_country_code", city.country_code)
    .single();

  const teleport = await teleportPromise;

  return c.json(ok({
    ...city,
    image_url: teleport.image_url ?? getCityImage(slug, city.image_url),
    teleport_scores: teleport.scores,
    teleport_url: teleport.web_url,
    costs: {
      rent_usd: city.monthly_rent_usd,
      food_usd: city.monthly_food_usd,
      transport_usd: city.monthly_transport_usd,
      utilities_usd: city.monthly_utilities_usd,
      total_usd: city.monthly_total_budget_usd,
    },
    visa: visa ? {
      visa_type: visa.visa_type,
      max_stay_days: visa.max_stay_days,
      evisa_link: visa.evisa_link,
      embassy_link: visa.embassy_link,
      notes: visa.notes,
      last_verified_at: visa.last_verified_at,
    } : null,
    accommodation: seedCity?.accommodation ?? null,
    updated_at: city.updated_at,
  }));
});

export default cities;
