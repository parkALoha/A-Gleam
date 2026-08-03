// Prefer an explicit override, then Vercel's own auto-provided env vars
// (production domain first, then the deployment-specific one), then fall
// back to localhost for dev — so metadataBase/sitemap/OG URLs are always
// absolute and correct without hardcoding a domain anywhere.
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
