import { GenerativeModel } from "@google/generative-ai";
import { safeJSONParse } from "@/src/utils/json";
import { DEFAULTS } from "@/src/config/constants";
import { Plan, Draft } from "@/src/types";

interface DraftOptions {
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

/**
 * From a single plan, generate the draft post content JSON.
 * Returns: { draft: Draft | null, usageMetadata?: any }
 */
export async function generateDraftForPlan(
  model: GenerativeModel,
  plan: Plan,
  opts: DraftOptions
): Promise<{ draft: Draft | null; usageMetadata?: unknown }> {
  const prompt = `
Take this plan and draft a complete LinkedIn post.

Plan:
${JSON.stringify(plan)}

Facts (must be respected):
${opts.factualContext || "No additional facts provided"}

Constraints:
- Tone: ${opts.tone ?? "Default"}
- Audience: ${opts.audience ?? "General"}
- Target Length: ${opts.length ?? "medium"}
- Language: ${opts.language ?? DEFAULTS.language}
- Reading Level: ${opts.readingLevel ?? DEFAULTS.readingLevel}
- Use Emojis: ${opts.allowEmojis ? "Yes" : "No"}
- Add Hashtags: ${opts.addHashtags ? "Yes" : "No"} (limit: ${
    opts.hashtagLimit ?? DEFAULTS.hashtagLimit
  })
- Add CTA: ${opts.addCTA ? "Yes" : "No"} (style: ${opts.ctaStyle ?? "Neutral"})
- Include Links: ${opts.includeLinks ? "Yes" : "No"}

Return JSON only:
{ "id": ${plan.id}, "content": "..." }
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
  const parsed = safeJSONParse(text) as any;

  if (!parsed || typeof parsed.content !== "string") {
    return { draft: null, usageMetadata: usage };
  }

  const draft: Draft = {
    id: parsed.id ?? plan.id,
    content: parsed.content,
  };

  return { draft, usageMetadata: usage };
}
