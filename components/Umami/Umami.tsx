import Script from "next/script";

export function Umami() {
  const umamiUrl = "https://umami.wiregrasswebsites.com/script.js";
  const umamiWebsiteId = "6c9a6b77-ad28-4680-aabb-42eb25772a82";

  if (process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <Script
      data-website-id={umamiWebsiteId}
      src={umamiUrl}
      strategy="afterInteractive"
    />
  );
}
