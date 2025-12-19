import Script from "next/script";

export function Umami() {
  const umamiUrl = process.env.UMAMI_URL || "";
  const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID || "";

  if (process.env.NODE_ENV !== "production") {
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
