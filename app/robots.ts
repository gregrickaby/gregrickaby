import { getProfileData } from "@/lib/services/dataService";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const data = getProfileData();
  const baseUrl = data.profile.url;
  const blogUrl = data.links.find((link) => link.title === "Blog")?.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      ...(blogUrl ? [`${blogUrl}/sitemap.xml`] : []),
    ],
  };
}
