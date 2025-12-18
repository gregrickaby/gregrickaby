import { getProfileData } from "@/lib/services/dataService";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getProfileData();
  const baseUrl = data.profile.url;
  const blogUrl = data.links.find((link) => link.title === "Blog")?.url;
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...(blogUrl
      ? [
          {
            url: blogUrl,
            lastModified: currentDate,
            changeFrequency: "daily" as const,
            priority: 1,
          },
        ]
      : []),
  ];
}
