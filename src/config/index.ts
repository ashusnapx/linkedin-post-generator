// src/config/index.ts
/**
 * CENTRALIZED CONFIGURATION
 *
 * All application constants, feature flags, and configuration values
 * live here. No more scattered hardcoding across files.
 *
 * USAGE:
 * import { config } from '@/src/config';
 * config.llm.defaultModel
 * config.ui.brand.name
 */

// =============================================================================
// LLM & API CONFIGURATION
// =============================================================================
export const llm = {
  // Model configuration
  defaultModel: "gemini-2.5-flash-lite",
  plannerModel:
    process.env.NEXT_PUBLIC_LLM_PLANNER_MODEL || "gemini-2.5-flash-lite",
  drafterModel:
    process.env.NEXT_PUBLIC_LLM_DRAFTER_MODEL || "gemini-2.5-flash-lite",

  // Token economics
  tokenRate: 0.000002, // USD per token
  costPer1kTokens: 0.03,

  // Generation defaults
  defaults: {
    temperature: 0.6,
    hashtagLimit: 5,
    language: "English",
    readingLevel: "Professional",
    postCount: 3,
  },

  // Rate limiting
  rateLimit: {
    maxRequests: 10,
    windowSeconds: 60,
    prefix: "postgen-ratelimit",
  },
} as const;

// =============================================================================
// API KEY CONFIGURATION
// =============================================================================
export const apiKey = {
  // Where users get their API key
  getKeyUrl: "https://aistudio.google.com/app/apikey",

  // Storage key for session storage
  storageKey: "postgen_api_key",

  // Header name for API requests
  headerName: "X-API-Key",

  // Validation
  minLength: 1,
  prefixes: [], // Relaxed validation per user request
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================
export const ui = {
  // Brand
  brand: {
    name: "PostGen",
    tagline: "AI-Powered LinkedIn Posts",
    description:
      "Generate polished, LinkedIn-ready posts from any topic in seconds. Free forever — bring your own API key.",
  },

  // Form options
  personas: ["Startup Founder", "Career Coach", "Techie", "Analyst"] as const,
  lengths: ["short", "medium", "long"] as const,
  postCounts: ["3", "4", "5"] as const,
  languages: ["English", "Hindi", "Hinglish"] as const,
  ctaStyles: ["Question", "Directive", "Soft Ask", "No CTA"] as const,
  readingLevels: ["Grade 6", "Grade 8", "Grade 10", "Professional"] as const,

  // Animation
  animation: {
    spring: { type: "spring", stiffness: 300, damping: 30 },
    fade: { duration: 0.3 },
    stagger: { staggerChildren: 0.1 },
  },
} as const;

// =============================================================================
// SEO CONFIGURATION
// =============================================================================
export const seo = {
  title: {
    default: "PostGen — AI LinkedIn Post Generator",
    template: "%s | PostGen",
  },
  description:
    "Generate polished, LinkedIn-ready posts from any topic using AI. Multiple tones, personas, hashtags, and CTAs. Free forever — bring your own API key.",
  keywords: [
    "LinkedIn post generator",
    "AI content writer",
    "social media automation",
    "LinkedIn marketing",
    "content creation tool",
    "Gemini AI",
    "free AI tool",
  ],
  author: {
    name: "Ashutosh Kumar",
    url: "https://github.com/ashusnapx",
    twitter: "@ashusnapx",
  },
  url: "https://postgen.ashutosh.dev",
  ogImage: "/og-image.png",
} as const;

// =============================================================================
// SOCIAL LINKS
// =============================================================================
export const social = {
  github: "https://github.com/ashusnapx/linkedin-post-generator",
  linkedin: "https://linkedin.com/in/ashusnapx",
  twitter: "https://twitter.com/ashusnapx",
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================
export const navigation = {
  items: [
    { label: "Home", href: "/" },
    { label: "Generator", href: "#generator" },
    { label: "GitHub", href: social.github, external: true },
  ],
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================
export const features = {
  // User-provided API key (always true now)
  userApiKey: true,

  // Rate limiting (requires Vercel KV)
  rateLimit: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),

  // Show cost metrics to users
  showCostMetrics: true,

  // Advanced settings accordion
  advancedSettings: true,

  // Multi-language support
  multiLanguage: true,
} as const;

// =============================================================================
// FACT SERVICE CONFIGURATION
// =============================================================================
export const factService = {
  searchLimit: 5,
  summarizeCount: 3,
  minParagraphLength: 50,
  maxParagraphs: 5,
  maxSummaryLength: 500,
  userAgent: "Mozilla/5.0 (PostGen/1.0)",
} as const;

// =============================================================================
// EXPORT ALL
// =============================================================================
export const config = {
  llm,
  apiKey,
  ui,
  seo,
  social,
  navigation,
  features,
  factService,
} as const;

export default config;

// Type exports for use in components
export type Persona = (typeof ui.personas)[number];
export type Length = (typeof ui.lengths)[number];
export type PostCount = (typeof ui.postCounts)[number];
export type Language = (typeof ui.languages)[number];
export type CtaStyle = (typeof ui.ctaStyles)[number];
export type ReadingLevel = (typeof ui.readingLevels)[number];
