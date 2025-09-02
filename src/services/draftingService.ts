// src/services/draftingService.ts
import { safeJSONParse } from "@/src/utils/json";
import { DEFAULTS } from "@/src/config/constants";
import { Plan, Draft } from "@/src/types";

/**
 * From a single plan, generate the draft post content JSON.
 */
export async function generateDraftForPlan(
  model: unknown,
  plan: Plan,
  opts: {
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
  }
): Promise<Draft | null> {
  const prompt = `
Take this plan and draft a complete LinkedIn post.

Plan:
${JSON.stringify(plan)}

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
      ...(opts.seed && { seed: opts.seed }),
    },
  });

  const text = res.response.text?.() ?? "";
  const parsed = safeJSONParse(text);
  if (!parsed || !parsed.content) {
    // return null to indicate drafting failed for this plan
    return null;
  }
  return {
    id: parsed.id ?? plan.id,
    content: parsed.content,
  } as Draft;
}
