import type { MetadataRoute } from "next";

const BASE_URL = "https://nomadly.in";

const CITY_SLUGS = [
  "bali",
  "lisbon",
  "tbilisi",
  "chiang-mai",
  "medellin",
  "budapest",
  "prague",
  "tallinn",
  "mexico-city",
  "bangkok",
  "barcelona",
  "porto",
  "taipei",
  "seoul",
  "cape-town",
  "dubai",
  "kuala-lumpur",
  "ho-chi-minh-city",
  "berlin",
  "playa-del-carmen",
];

const BLOG_SLUGS = [
  "visa-free-countries-indian-passport-2025",
  "cost-of-living-bali-indian-rupees",
  "best-countries-indian-software-engineers-remote-work",
  "digital-nomad-tax-india-guide",
  "how-to-get-remote-job-india",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/visa-checker`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cost-calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cities`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/cities/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...blogPages];
}
