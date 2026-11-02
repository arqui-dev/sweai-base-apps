import type { NextConfig } from "next";

/**
 * Enforced on every response. The CSP is report-only on purpose: Next injects
 * inline bootstrap scripts and Sanity Studio needs `unsafe-eval`, so enforcing
 * a policy before reading real reports breaks the app. Collect reports, then
 * flip the header name to `Content-Security-Policy`.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://cdn.sanity.io",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.api.sanity.io https://api.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ponytail: cacheComponents off. Every page here reads cookies or Sanity at
  // request time, so the explicit-cache ceremony buys nothing. Turn it on when
  // a route is genuinely static and build time starts to hurt.
  cacheComponents: false,
  typedRoutes: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  headers: async () => [{ source: "/:path*", headers: SECURITY_HEADERS }],
};

export default nextConfig;
