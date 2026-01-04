import { GenerativeModel } from "@google/generative-ai";
import { safeJSONParse } from "@/src/utils/json";
import { Draft } from "@/src/types";
import {
  DEFAULT_CTA_STYLE,
  DEFAULT_HASHTAG_LIMIT,
  DEFAULT_LANGUAGE,
  DEFAULT_TEMPERATURE,
} from "../config/constants";

/**
 * Add hashtags, CTA and flags to a draft.
 * Returns an object containing hashtags, cta, flags, plus usageMetadata.
 */
export async function enrichDraft(
  model: GenerativeModel,
  draft: Draft,
  opts: {
    addHashtags?: boolean;
    hashtagLimit?: number;
    addCTA?: boolean;
    ctaStyle?: string;
    language?: string;
    temperature?: number;
    seed?: number;
  }
): Promise<{
  hashtags: string[];
  cta: string;
  flags: { profanity: boolean; riskyClaims: string[] };
  usageMetadata?: unknown;
} | null> {
  const prompt = `
Enrich this LinkedIn post with metadata.

Post:
${draft.content}

Constraints:
- Add Hashtags: ${opts.addHashtags ? "Yes" : "No"} (limit: ${
    opts.hashtagLimit ?? DEFAULT_HASHTAG_LIMIT
  })
- Add CTA: ${opts.addCTA ? "Yes" : "No"} (style: ${
    opts.ctaStyle ?? DEFAULT_CTA_STYLE
  })
- Language: ${opts.language ?? DEFAULT_LANGUAGE}

Return JSON only:
{
  "index": ${draft.id},
  "hashtags": ["#example1", "#example2"],
  "cta": "string",
  "flags": { "profanity": false, "riskyClaims": [] }
}
`;

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
      candidateCount: 1,
      ...(opts.seed && { seed: opts.seed }),
    },
  });

  const usage = res?.response?.usageMetadata;
  const text = res.response.text?.() ?? "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = safeJSONParse(text) as any;
  if (!parsed) return null;

  return {
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    cta: typeof parsed.cta === "string" ? parsed.cta : "",
    flags: parsed.flags ?? {},
    usageMetadata: usage,
  };
}
