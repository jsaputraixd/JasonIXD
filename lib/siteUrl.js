/** Canonical site origin for metadata, sitemap, and robots. */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) return raw.replace(/\/$/, "");
  return "https://jasonixd.com";
}
