import { Hono } from "hono";
import { ok, err } from "@nomadly/types";
import { supabase } from "../lib/supabase";

const visa = new Hono();

// GET /visa/check?from=IN&to=PT
visa.get("/check", async (c) => {
  const from = (c.req.query("from") || "IN").toUpperCase();
  const to = c.req.query("to")?.toUpperCase();

  if (!to) return c.json(err("Missing 'to' query parameter"), 400);

  if (from !== "IN") {
    return c.json(err("Only Indian passport (IN) is supported in this version"), 400);
  }

  const { data, error } = await supabase
    .from("visa_requirements")
    .select("*")
    .eq("passport_country_code", from)
    .eq("destination_country_code", to)
    .single();

  if (error || !data) {
    return c.json(err(`No visa data found for ${from} → ${to}`), 404);
  }

  const { data: cityData } = await supabase
    .from("cities")
    .select("country")
    .eq("country_code", to)
    .limit(1)
    .single();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const isStale = new Date(data.last_verified_at) < thirtyDaysAgo;

  return c.json(ok({
    requirement: {
      passport_country_code: data.passport_country_code,
      destination_country_code: data.destination_country_code,
      destination_country_name: cityData?.country ?? to,
      visa_type: data.visa_type,
      max_stay_days: data.max_stay_days,
      evisa_link: data.evisa_link,
      embassy_link: data.embassy_link,
      notes: data.notes,
      last_verified_at: data.last_verified_at,
    },
    is_stale: isStale,
  }));
});

// GET /visa/countries
visa.get("/countries", async (c) => {
  const { data, error } = await supabase
    .from("visa_requirements")
    .select("destination_country_code")
    .eq("passport_country_code", "IN");

  if (error) return c.json(err(error.message), 500);

  const codes = data?.map((r) => r.destination_country_code) ?? [];

  const { data: citiesData } = await supabase
    .from("cities")
    .select("country, country_code")
    .in("country_code", codes);

  const seen = new Set<string>();
  const countries = (citiesData ?? [])
    .filter((c) => {
      if (seen.has(c.country_code)) return false;
      seen.add(c.country_code);
      return true;
    })
    .map((c) => ({ code: c.country_code, name: c.country }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return c.json(ok(countries));
});

export default visa;
