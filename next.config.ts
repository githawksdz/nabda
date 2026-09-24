import type { NextConfig } from "next";

const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

/** Keep nabda_db media out of route file traces — served only via explicit handlers. */
const NABDA_MEDIA_EXCLUDES = [
  "./nabda_db/cat/media/**",
  "./nabda_db/drugs/media/**",
  "./nabda_db/drugs/monographs/**",
  "./nabda_db/calcs/**",
];

const nextConfig: NextConfig = {
  // Staging protection: do not ship browser source maps in production.
  productionBrowserSourceMaps: false,
  // LAN phone/tablet testing (`npm run dev:lan`) hits the machine IP, not localhost.
  // Next.js blocks /_next JS from unknown origins, which leaves the page with no handlers.
  // Set ALLOWED_DEV_ORIGINS (comma-separated) in .env.local — do not hardcode a machine IP.
  allowedDevOrigins: extraDevOrigins,
  outputFileTracingExcludes: {
    "/internal/cat-preview/**": NABDA_MEDIA_EXCLUDES,
    "/internal/drug-preview/**": NABDA_MEDIA_EXCLUDES,
    "/internal/calculator-preview/**": NABDA_MEDIA_EXCLUDES,
    "/content-media/cat": NABDA_MEDIA_EXCLUDES,
    "/content-media/drug": NABDA_MEDIA_EXCLUDES,
    "/cat": NABDA_MEDIA_EXCLUDES,
    "/cat/[slug]": NABDA_MEDIA_EXCLUDES,
    "/drugs": NABDA_MEDIA_EXCLUDES,
    "/drugs/[slug]": NABDA_MEDIA_EXCLUDES,
    "/protocols": NABDA_MEDIA_EXCLUDES,
    "/protocols/[slug]": NABDA_MEDIA_EXCLUDES,
    "/calculators": NABDA_MEDIA_EXCLUDES,
    "/calculators/[slug]": NABDA_MEDIA_EXCLUDES,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
