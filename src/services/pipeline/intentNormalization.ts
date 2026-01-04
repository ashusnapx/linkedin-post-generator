// src/services/pipeline/intentNormalization.ts
import { PipelineContext, PipelineStage } from "./types";

/**
 * Topic categories for internal classification.
 * Used to apply category-specific defaults and optimizations.
 */
const TOPIC_CATEGORIES = {
  technology: [
    "tech",
    "ai",
    "software",
    "programming",
    "developer",
    "code",
    "startup",
    "saas",
    "api",
    "cloud",
    "machine learning",
    "devops",
  ],
  career: [
    "career",
    "job",
    "interview",
    "resume",
    "salary",
    "promotion",
    "manager",
    "leadership",
    "hire",
    "fired",
    "layoff",
  ],
  productivity: [
    "productivity",
    "habits",
    "time",
    "efficiency",
    "routine",
    "morning",
    "focus",
    "remote work",
    "wfh",
  ],
  business: [
    "business",
    "entrepreneur",
    "founder",
    "revenue",
    "growth",
    "marketing",
    "sales",
    "customer",
    "b2b",
  ],
  personal: [
    "personal",
    "life",
    "balance",
    "health",
    "mental",
    "burnout",
    "success",
    "failure",
    "story",
  ],
};

/**
 * Detect topic category based on keyword matching.
 */
function detectCategory(topic: string): string {
  const lowerTopic = topic.toLowerCase();

  for (const [category, keywords] of Object.entries(TOPIC_CATEGORIES)) {
    if (keywords.some((kw) => lowerTopic.includes(kw))) {
      return category;
    }
  }

  return "general";
}

/**
 * Normalize topic by removing common filler words and standardizing format.
 */
function normalizeTopic(topic: string): string {
  // Remove common filler prefixes
  const fillerPrefixes = [
    "write a post about",
    "create a linkedin post about",
    "generate content about",
    "i want to talk about",
    "can you write about",
    "please write about",
  ];

  let normalized = topic.toLowerCase().trim();

  for (const prefix of fillerPrefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length).trim();
    }
  }

  // Capitalize first letter
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return normalized;
}

/**
 * Intent Normalization Stage
 *
 * JUSTIFICATION: This stage does NOT use LLM because:
 * 1. Topic normalization is deterministic (pattern matching)
 * 2. Category detection is rule-based (keyword lookup)
 * 3. Saves ~200-500 tokens per request
 *
 * VALUE ADDED:
 * - Strips user fluff before sending to LLM (reduces input tokens)
 * - Categorizes topic for downstream optimizations
 * - Could enable caching by normalized topic in future
 */
export const intentNormalizationStage: PipelineStage = {
  name: "Intent Normalization",
  usesLLM: false,
  justification:
    "Deterministic string processing. No creativity needed. Saves ~200-500 tokens.",

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const startTime = Date.now();

    const normalizedTopic = normalizeTopic(context.input.topic);
    const topicCategory = detectCategory(context.input.topic);

    context.normalizedTopic = normalizedTopic;
    context.topicCategory = topicCategory;
    context.metrics.timings.intentNormalization = Date.now() - startTime;

    return context;
  },
};
