// src/config/constants.ts
export const MODEL_NAME = "gemini-2.5-flash-lite";
export const TOKEN_USD_RATE = 0.000002;

export const DEFAULTS = {
  temperature: 0.6,
  hashtagLimit: 5,
  language: "English",
  readingLevel: "Professional",
};

export const USER_AGENT = "Mozilla/5.0";

export const DEFAULT_SEARCH_LIMIT = 5; // Links to fetch
export const TOP_SUMMARIZE_COUNT = 3; // Top scored links to summarize

export const MIN_PARAGRAPH_LENGTH = 50;
export const MAX_PARAGRAPHS = 5;
export const MAX_SUMMARY_LENGTH = 500;

export const DEFAULT_HASHTAG_LIMIT = 5;
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_CTA_STYLE = "Neutral";
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_READING_LEVEL = "medium";

import { Github, Linkedin, Twitter } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "GitHub", href: "https://github.com/ashutosh" },
];

export const SOCIAL_LINKS = [
  { name: "GitHub", icon: Github, href: "https://github.com/ashusnapx" },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/in/ashusnapx",
  },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/ashusnapx" },
];

export const GRADIENT_TEXT =
  "bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent";

export const FOOTER_BG = "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md";

export const FOOTER_BORDER = "border-t border-gray-200 dark:border-gray-800";

export const HEALTH_COLORS = {
  loading: "bg-gray-400",
  ok: "bg-green-600",
  error: "bg-red-600",
};

export const HEALTH_TEXT = {
  loading: "Checking health…",
  ok: "Healthy",
  error: "Down",
};

export const FOOTER_TEXT = {
  description:
    "Generate LinkedIn‑ready posts with AI. Polished. Personalized. Instant.",
  copyright: "All rights reserved.",
  builtBy: "Built with ❤️ by Ashutosh",
};

export const PERSONAS = ["Startup Founder", "Career Coach", "Techie", "Analyst"] as const;
export const LENGTHS = ["short", "medium", "long"] as const;
export const POST_COUNTS = ["3", "4", "5"] as const;
export const LANGUAGES = ["English", "Hindi", "Hinglish"] as const;
export const CTA_STYLES = ["Question", "Directive", "Soft Ask", "No CTA"] as const;
export const READING_LEVELS = ["Grade 6", "Grade 8", "Grade 10", "Professional"] as const;

