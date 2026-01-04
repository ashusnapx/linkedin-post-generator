import { safeJSONParse } from "@/src/utils/json";
import { Plan } from "@/src/types";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_READING_LEVEL,
  DEFAULT_HASHTAG_LIMIT,
  DEFAULT_CTA_STYLE,
  DEFAULT_TEMPERATURE,
} from "@/src/config/constants";

interface PlansResponse {
  plans: Array<{
    id: number;
    hook: string;
    points: string[];
    cta: string;
    example_angle: string;
  }>;
}

/**
 * Generate 'plans' JSON using the model.
 * Returns: { plans: Plan[], usageMetadata?: any }
 */
export async function generatePlans(
  model: { generateContent: (args: unknown) => Promise<any> },
  opts: {
    topic: string;
    postCount: number;
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
    examples?: string;
    temperature?: number;
    seed?: number;
    factualContext?: string;
  }
): Promise<{ plans: Plan[]; usageMetadata?: any }> {
  const {
    topic,
    postCount,
    tone,
    audience,
    length,
    language,
    readingLevel,
    allowEmojis,
    addHashtags,
    hashtagLimit,
    addCTA,
    ctaStyle,
    includeLinks,
    examples,
    temperature,
    seed,
    factualContext,
  } = opts;

  const prompt = `
You are a LinkedIn content strategist.

Facts you must use (do not hallucinate outside this context):
${factualContext || "No reliable external facts found."}

Task: Generate ${postCount} structured LinkedIn post plans.
Topic: "${topic}"

Constraints:
- Tone: ${tone ?? "Default"}
- Audience: ${audience ?? "General"}
- Target Length: ${length ?? "medium"}
- Language: ${language ?? DEFAULT_LANGUAGE}
- Reading Level: ${readingLevel ?? DEFAULT_READING_LEVEL}
- Use Emojis: ${allowEmojis ? "Yes" : "No"}
- Add Hashtags: ${addHashtags ? "Yes" : "No"} (limit: ${
    hashtagLimit ?? DEFAULT_HASHTAG_LIMIT
  })
- Add CTA: ${addCTA ? "Yes" : "No"} (style: ${ctaStyle ?? DEFAULT_CTA_STYLE})
- Include Links: ${includeLinks ? "Yes" : "No"}

Examples to consider: ${examples ?? "None"}

Return JSON only:
{
  "plans": [
    { "id": 1, "hook": "...", "points": ["..."], "cta": "...", "example_angle": "..." }
  ]
}`;

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: temperature ?? DEFAULT_TEMPERATURE,
      candidateCount: 1,
      ...(seed ? { seed } : {}),
    },
  });

  const usage = res?.response?.usageMetadata;
  const text: string = res.response.text?.() ?? "";
  const parsed = safeJSONParse(text) as PlansResponse | null;

  if (!parsed || !Array.isArray(parsed.plans)) {
    throw new Error(`Planner failed. Raw response: ${text}`);
  }

  const plans = parsed.plans.map(
    (p, idx): Plan => ({
      id: typeof p.id === "number" ? p.id : idx + 1,
      hook: p.hook ?? "",
      points: Array.isArray(p.points) ? p.points : [],
      cta: p.cta ?? "",
      example_angle: p.example_angle ?? "",
      ...p,
    })
  );

  return { plans, usageMetadata: usage };
}
