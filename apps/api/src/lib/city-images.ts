// Fallback city images from Unsplash (free, no API key, static CDN URLs)
// These are curated, high-quality photos for each city
export const CITY_IMAGES: Record<string, string> = {
  "bali":             "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  "lisbon":           "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  "tbilisi":          "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&q=80",
  "chiang-mai":       "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
  "medellin":         "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80",
  "budapest":         "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
  "prague":           "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
  "tallinn":          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "mexico-city":      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
  "bangkok":          "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
  "barcelona":        "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
  "porto":            "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  "taipei":           "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80",
  "seoul":            "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
  "cape-town":        "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
  "dubai":            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  "kuala-lumpur":     "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  "ho-chi-minh-city": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
  "berlin":           "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80",
  "playa-del-carmen": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80",
};

export function getCityImage(slug: string, dbImageUrl?: string | null): string {
  return dbImageUrl ?? CITY_IMAGES[slug] ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
}
