import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch saved cities
  const { data: savedCities } = await supabase
    .from("saved_cities")
    .select(`
      city_id,
      cities (
        id, slug, name, country, country_code, flag_emoji, image_url,
        monthly_total_budget_usd, internet_speed_mbps, safety_score, english_proficiency
      )
    `)
    .eq("user_id", user.id);

  return (
    <DashboardClient
      user={user}
      savedCities={(savedCities ?? []).map((r: any) => r.cities).filter(Boolean)}
    />
  );
}
