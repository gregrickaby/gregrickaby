import { getProfileData } from "@/lib/services/dataService";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getProfileData();
  const baseUrl = data.profile.url;
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog/how-gain-maps-elevate-hdr-photography`,
      lastModified: new Date("2023-10-27T12:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
