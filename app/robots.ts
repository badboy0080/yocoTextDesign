import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site-config";
import { ROBOTS_DISALLOW } from "@/lib/site-seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW],
    },
    sitemap: `${SITE_CONFIG.siteUrl}/sitemap.xml`,
    host: SITE_CONFIG.siteUrl,
  };
}
