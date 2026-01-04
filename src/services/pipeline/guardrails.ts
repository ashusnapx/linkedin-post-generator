// src/services/pipeline/guardrails.ts
import { PipelineContext, PipelineStage, Draft } from "./types";

/**
 * Profanity word list (subset for demonstration).
 * In production, use a more comprehensive library like 'bad-words'.
 */
const PROFANITY_LIST = [
  "damn",
  "hell",
  "crap",
  // Add more as needed, or integrate a proper library
];

/**
 * Risky claim patterns that could be problematic on LinkedIn.
 */
const RISKY_PATTERNS = [
  /guaranteed\s+(success|results|income|money)/i,
  /make\s+\$?\d+[k,]?\s*(per|a)\s*(day|week|month)/i,
  /\d+x\s+your\s+(income|revenue|sales)/i,
  /secret\s+(to|of)\s+(success|wealth|riches)/i,
  /get\s+rich\s+(quick|fast|easy)/i,
  /100%\s+proven/i,
  /never\s+fail/i,
  /everyone\s+should/i,
  /if\s+you\s+(don't|dont)\s+do\s+this/i,
];

/**
 * Check if content contains profanity.
 */
function containsProfanity(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return PROFANITY_LIST.some((word) => lowerContent.includes(word));
}

/**
 * Extract risky claims from content.
 */
function extractRiskyClaims(content: string): string[] {
  const claims: string[] = [];

  for (const pattern of RISKY_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      claims.push(match[0]);
    }
  }

  return claims;
}

/**
 * Validate hashtag format and count.
 */
function validateHashtags(
  hashtags: string[],
  limit: number
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (hashtags.length > limit) {
    issues.push(`Too many hashtags: ${hashtags.length} > ${limit}`);
  }

  for (const tag of hashtags) {
    if (!tag.startsWith("#")) {
      issues.push(`Invalid hashtag format: ${tag}`);
    }
    if (tag.length > 30) {
      issues.push(`Hashtag too long: ${tag}`);
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Apply guardrails to a single draft.
 */
function applyGuardrailsToDraft(draft: Draft, hashtagLimit: number): Draft {
  const profanity = containsProfanity(draft.content);
  const riskyClaims = extractRiskyClaims(draft.content);
  const hashtagValidation = validateHashtags(draft.hashtags, hashtagLimit);

  // Update flags
  draft.flags = {
    profanity,
    riskyClaims,
    passedGuardrails:
      !profanity && riskyClaims.length === 0 && hashtagValidation.valid,
  };

  // Trim hashtags to limit if needed
  if (draft.hashtags.length > hashtagLimit) {
    draft.hashtags = draft.hashtags.slice(0, hashtagLimit);
  }

  return draft;
}

/**
 * Guardrails Stage
 *
 * JUSTIFICATION: This stage does NOT use LLM because:
 * 1. Profanity detection is word-list based (deterministic)
 * 2. Risky claim detection uses regex patterns (deterministic)
 * 3. Validation logic is rule-based (no creativity needed)
 *
 * VALUE ADDED:
 * - Catches problematic content before it reaches the user
 * - Enforces platform-appropriate content
 * - Could block/flag posts automatically in future
 */
export const guardrailsStage: PipelineStage = {
  name: "Guardrails",
  usesLLM: false,
  justification:
    "Deterministic rule-based checks. Pattern matching for safety. No LLM creativity needed.",

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const startTime = Date.now();

    if (!context.drafts || context.drafts.length === 0) {
      context.metrics.timings.guardrails = Date.now() - startTime;
      return context;
    }

    const hashtagLimit = context.input.hashtagLimit ?? 5;

    // Apply guardrails to each draft
    context.drafts = context.drafts.map((draft) =>
      applyGuardrailsToDraft(draft, hashtagLimit)
    );

    context.metrics.timings.guardrails = Date.now() - startTime;
    return context;
  },
};

/**
 * Summary statistics for guardrail results.
 */
export function getGuardrailsSummary(drafts: Draft[]): {
  totalPassed: number;
  totalFailed: number;
  issues: string[];
} {
  let totalPassed = 0;
  let totalFailed = 0;
  const issues: string[] = [];

  for (const draft of drafts) {
    if (draft.flags.passedGuardrails) {
      totalPassed++;
    } else {
      totalFailed++;
      if (draft.flags.profanity) {
        issues.push(`Post ${draft.id}: Contains profanity`);
      }
      if (draft.flags.riskyClaims.length > 0) {
        issues.push(
          `Post ${draft.id}: Risky claims: ${draft.flags.riskyClaims.join(
            ", "
          )}`
        );
      }
    }
  }

  return { totalPassed, totalFailed, issues };
}
