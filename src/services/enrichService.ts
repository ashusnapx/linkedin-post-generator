import { safeJSONParse } from "@/src/utils/json";
import { DEFAULTS } from "@/src/config/constants";
import { Draft } from "@/src/types";

/**
 * Add hashtags, CTA and flags to a draft.
 * Returns an object containing hashtags, cta, flags, plus usageMetadata.
 */
export async function enrichDraft(
  model: any,
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
  flags: any;
  usageMetadata?: any;
} | null> {
  const prompt = `
Enrich this LinkedIn post with metadata.

Post:
${draft.content}

Constraints:
- Add Hashtags: ${opts.addHashtags ? "Yes" : "No"} (limit: ${
    opts.hashtagLimit ?? DEFAULTS.hashtagLimit
  })
- Add CTA: ${opts.addCTA ? "Yes" : "No"} (style: ${opts.ctaStyle ?? "Neutral"})
- Language: ${opts.language ?? DEFAULTS.language}

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
      temperature: opts.temperature ?? DEFAULTS.temperature,
      candidateCount: 1,
      ...(opts.seed && { seed: opts.seed }),
    },
  });

  const usage = res?.response?.usageMetadata;
  const text = res.response.text?.() ?? "";
  const parsed = safeJSONParse(text);
  if (!parsed) {
    return null;
  }
  return {
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    cta: typeof parsed.cta === "string" ? parsed.cta : "",
    flags: parsed.flags ?? {},
    usageMetadata: usage,
  };
}
