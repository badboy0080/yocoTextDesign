import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS, absoluteUrl } from "@/lib/site-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-23T00:00:00.000Z");
  return INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" || path === "/gongzhonghao-paiban" || path === "/works" || path === "/studio.html" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/gongzhonghao-paiban" ? 0.9 : path === "/works" ? 0.8 : path === "/studio.html" ? 0.7 : path === "/faq" ? 0.6 : 0.3,
  }));
}
