import type { MetadataRoute } from "next";
import { contentMap } from "@/docs/content-map";

const BASE_URL = "https://ruleshub.dev";

const STATIC_ROUTES = [
  { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { url: "/browse", priority: 0.9, changeFrequency: "hourly" as const },
  { url: "/leaderboard", priority: 0.6, changeFrequency: "daily" as const },
  { url: "/collections", priority: 0.6, changeFrequency: "daily" as const },
  { url: "/tools", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/login", priority: 0.3, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const docsEntries: MetadataRoute.Sitemap = Object.keys(contentMap).map(
    (slug) => ({
      url: `${BASE_URL}/docs/${slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    }),
  );

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ url, priority, changeFrequency }) => ({
      url: `${BASE_URL}${url}`,
      priority,
      changeFrequency,
    }),
  );

  return [...staticEntries, ...docsEntries];
}
