// src/utils/ctaTemplates.ts
/**
 * Deterministic CTA templates by style.
 * Used to reduce token usage by providing structured options.
 */
export const CTA_TEMPLATES: Record<string, string[]> = {
  Question: [
    "What do you think?",
    "Have you experienced this?",
    "What's your take?",
    "Does this resonate with you?",
    "What would you add to this list?",
  ],
  Directive: [
    "Try this today.",
    "Share this with someone who needs it.",
    "Save this for later.",
    "Tag someone who should read this.",
    "Follow me for more insights like this.",
  ],
  "Soft Ask": [
    "I'd love to hear your thoughts below.",
    "Feel free to share your experience.",
    "Let me know if this was helpful.",
    "Drop a comment if you agree (or disagree).",
    "Would appreciate your perspective on this.",
  ],
  "No CTA": [],
};

/**
 * Get a random CTA template for a given style.
 * Returns empty string for "No CTA" style.
 */
export function getRandomCTA(style: string): string {
  const templates = CTA_TEMPLATES[style] ?? CTA_TEMPLATES.Question;
  if (templates.length === 0) return "";
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate topic-relevant hashtags deterministically.
 * Combines topic-derived tags with common engagement tags.
 */
export function generateDeterministicHashtags(
  topic: string,
  limit: number = 5
): string[] {
  // Extract key words from topic (simple tokenization)
  const words = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const topicTags = words.slice(0, 2).map((w) => `#${w}`);

  // Common engagement tags
  const common = [
    "#linkedin",
    "#careergrowth",
    "#productivity",
    "#leadership",
    "#innovation",
    "#mindset",
    "#success",
  ];

  // Combine, dedupe, and limit
  const combined = [...new Set([...topicTags, ...common])];
  return combined.slice(0, limit);
}
