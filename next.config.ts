import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const SUPABASE_HOSTNAME = "pceaovdyjuvwnytlatsw.supabase.co";

// Next.js App Router injects its own hydration data via an inline <script>,
// and there's no nonce plumbing set up in proxy.ts — so 'unsafe-inline' stays
// in script-src for now. Fast Refresh needs 'unsafe-eval' too, but only in
// dev. Every other directive is scoped tightly since none of it is needed.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://${SUPABASE_HOSTNAME}`,
  "font-src 'self' data:",
  `connect-src 'self' https://${SUPABASE_HOSTNAME} https://*.sentry.io`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOSTNAME,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: SUPABASE_HOSTNAME,
        pathname: "/storage/v1/object/sign/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  // Only matters if org/project/authToken are set — otherwise source map
  // upload is skipped and this build option has nothing to widen.
  widenClientFileUpload: true,
  disableLogger: true,
});
