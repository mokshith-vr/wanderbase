// Teleport API — free, no API key needed
// Docs: https://developers.teleport.org/api/

const BASE = "https://api.teleport.org/api";

export interface TeleportScores {
  cost_of_living: number;   // 0–10
  safety: number;           // 0–10
  internet_access: number;  // 0–10
  outdoors: number;         // 0–10
  summary: string;
  teleport_city_score: number; // 0–100
}

export interface TeleportData {
  scores: TeleportScores | null;
  image_url: string | null;
  web_url: string | null;
}

// Map our city slugs → Teleport urban area slugs
const TELEPORT_SLUGS: Record<string, string> = {
  "bali": "bali",
  "lisbon": "lisbon",
  "tbilisi": "tbilisi",
  "chiang-mai": "chiang-mai",
  "medellin": "medellin",
  "budapest": "budapest",
  "prague": "prague",
  "tallinn": "tallinn",
  "mexico-city": "mexico-city",
  "bangkok": "bangkok",
  "barcelona": "barcelona",
  "porto": "porto",
  "taipei": "taipei",
  "seoul": "seoul",
  "cape-town": "cape-town",
  "dubai": "dubai",
  "kuala-lumpur": "kuala-lumpur",
  "ho-chi-minh-city": "ho-chi-minh-city",
  "berlin": "berlin",
  "playa-del-carmen": "playa-del-carmen",
};

export async function getTeleportData(citySlug: string): Promise<TeleportData> {
  const teleportSlug = TELEPORT_SLUGS[citySlug];
  if (!teleportSlug) return { scores: null, image_url: null, web_url: null };

  try {
    const [scoresRes, imagesRes] = await Promise.allSettled([
      fetch(`${BASE}/urban_areas/slug:${teleportSlug}/scores/`, {
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${BASE}/urban_areas/slug:${teleportSlug}/images/`, {
        signal: AbortSignal.timeout(3000),
      }),
    ]);

    let scores: TeleportScores | null = null;
    let image_url: string | null = null;

    if (scoresRes.status === "fulfilled" && scoresRes.value.ok) {
      const data = await scoresRes.value.json();
      const cats = data.categories ?? [];
      scores = {
        cost_of_living: cats.find((c: any) => c.id === "COST-OF-LIVING")?.score_out_of_10 ?? 0,
        safety: cats.find((c: any) => c.id === "SAFETY")?.score_out_of_10 ?? 0,
        internet_access: cats.find((c: any) => c.id === "INTERNET-ACCESS")?.score_out_of_10 ?? 0,
        outdoors: cats.find((c: any) => c.id === "OUTDOORS")?.score_out_of_10 ?? 0,
        summary: data.summary ?? "",
        teleport_city_score: data.teleport_city_score ?? 0,
      };
    }

    if (imagesRes.status === "fulfilled" && imagesRes.value.ok) {
      const data = await imagesRes.value.json();
      image_url = data.photos?.[0]?.image?.web ?? null;
    }

    return {
      scores,
      image_url,
      web_url: `https://teleport.org/cities/${teleportSlug}/`,
    };
  } catch {
    return { scores: null, image_url: null, web_url: null };
  }
}
