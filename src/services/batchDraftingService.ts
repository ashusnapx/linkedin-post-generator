// src/services/batchDraftingService.ts
import { GenerativeModel } from "@google/generative-ai";
import { safeJSONParse } from "@/src/utils/json";
import { DEFAULTS } from "@/src/config/constants";
import { Plan, Draft } from "@/src/types";

interface BatchDraftOptions {
  tone?: string;
  audience?: string;
  length?: string;
  language?: string;
  readingLevel?: string;
  allowEmojis?: boolean;
  addHashtags?: boolean;
  hashtagLimit?: number;
  addCTA?: boolean;
  ctaStyle?: string;
  includeLinks?: boolean;
  temperature?: number;
  seed?: number;
  factualContext?: string;
}

interface BatchDraftResult {
  posts: Array<{
    id: number;
    content: string;
    hashtags: string[];
    cta: string;
    flags: { profanity: boolean; riskyClaims: string[] };
  }>;
}

/**
 * Generate ALL drafts in a SINGLE LLM call with enrichment included.
 *
 * This eliminates the N+1 problem by:
 * 1. Sending all plans in one request
 * 2. Including hashtag/CTA/guardrails generation in the same call
 * 3. Requesting explicit variance between posts
 *
 * Token savings: ~60-70% compared to sequential per-plan calls
 */
export async function generateAllDraftsWithEnrichment(
  model: GenerativeModel,
  plans: Plan[],
  opts: BatchDraftOptions
): Promise<{ drafts: Draft[]; usageMetadata?: unknown }> {
  const hashtagLimit = opts.hashtagLimit ?? DEFAULTS.hashtagLimit;
  const ctaStyle = opts.ctaStyle ?? "Neutral";

  const prompt = `
You are a LinkedIn content expert. Generate ${
    plans.length
  } complete LinkedIn posts from these plans.

CRITICAL REQUIREMENTS:
1. Each post MUST be DISTINCTLY DIFFERENT in style, angle, and opening
2. Do NOT repeat phrases, structures, or hooks across posts
3. Maximize engagement variety - mix storytelling, data, questions, bold statements

PLANS:
${JSON.stringify(plans, null, 2)}

FACTUAL CONTEXT (incorporate where relevant, do NOT hallucinate beyond this):
${opts.factualContext || "No external facts provided."}

POST CONSTRAINTS:
- Tone: ${opts.tone ?? "Professional"}
- Audience: ${opts.audience ?? "General LinkedIn users"}
- Target Length: ${
    opts.length ?? "medium"
  } (short=100-150 words, medium=150-250 words, long=250-400 words)
- Language: ${opts.language ?? DEFAULTS.language}
- Reading Level: ${opts.readingLevel ?? DEFAULTS.readingLevel}
- Use Emojis: ${opts.allowEmojis ? "Yes, sparingly for emphasis" : "No emojis"}
- Include Links: ${opts.includeLinks ? "Yes, where relevant" : "No links"}

ENRICHMENT (include in each post):
- Hashtags: ${
    opts.addHashtags
      ? `Yes, exactly ${hashtagLimit} relevant hashtags`
      : "No hashtags"
  }
- CTA: ${opts.addCTA ? `Yes, ${ctaStyle} style call-to-action` : "No CTA"}
- Safety Flags: Check for profanity and risky claims

OUTPUT FORMAT (JSON only, no markdown fences):
{
  "posts": [
    {
      "id": 1,
      "content": "The full post content including formatting, line breaks, emojis if allowed...",
      "hashtags": ["#tag1", "#tag2"],
      "cta": "What's your experience with this?",
      "flags": { "profanity": false, "riskyClaims": [] }
    }
  ]
}
`;

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? DEFAULTS.temperature,
      candidateCount: 1,
      ...(opts.seed ? { seed: opts.seed } : {}),
    },
  });

  const usage = res?.response?.usageMetadata;
  const text: string = res.response.text?.() ?? "";
  const parsed = safeJSONParse(text) as BatchDraftResult | null;

  if (!parsed || !Array.isArray(parsed.posts)) {
    console.error("Batch drafting failed. Raw response:", text.slice(0, 500));
    throw new Error(`Batch drafting failed. Could not parse response.`);
  }

  // Normalize drafts
  const drafts: Draft[] = parsed.posts.map((p, idx) => ({
    id: typeof p.id === "number" ? p.id : idx + 1,
    content: p.content ?? "",
    hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
    cta: typeof p.cta === "string" ? p.cta : "",
    flags: p.flags ?? { profanity: false, riskyClaims: [] },
  }));

  return { drafts, usageMetadata: usage };
}
