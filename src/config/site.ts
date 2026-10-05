/**
 * site.ts
 * -----------------
 * Single source of truth for site-wide identity used by the Metadata API
 * (title template, Open Graph, JSON-LD, sitemap, robots, manifest).
 *
 * @module src/config/site
 */

export const SITE_NAME = "Scriverly";

export const SITE_TITLE = "Scriverly — AI-Powered Academic Writing Assistant";

export const SITE_DESCRIPTION =
  "Write better essays with real-time AI feedback, smart outlines, grammar analysis, and style guidance tailored to your academic level.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://www.scriverly.com"
).replace(/\/$/, "");

export const SITE_ACCENT_COLOR = "#C8854A";
export const SITE_BACKGROUND_COLOR = "#F9F7F4";
