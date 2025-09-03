import { safeJSONParse } from "@/src/utils/json";
import { DEFAULTS } from "@/src/config/constants";
import { Plan } from "@/src/types";

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
 */
export async function generatePlans(
  model: {
    generateContent: (args: unknown) => Promise<any>;
  },
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
): Promise<Plan[]> {
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
- Language: ${language ?? DEFAULTS.language}
- Reading Level: ${readingLevel ?? DEFAULTS.readingLevel}
- Use Emojis: ${allowEmojis ? "Yes" : "No"}
- Add Hashtags: ${addHashtags ? "Yes" : "No"} (limit: ${
    hashtagLimit ?? DEFAULTS.hashtagLimit
  })
- Add CTA: ${addCTA ? "Yes" : "No"} (style: ${ctaStyle ?? "Neutral"})
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
      temperature: temperature ?? DEFAULTS.temperature,
      candidateCount: 1,
      ...(seed ? { seed } : {}),
    },
  });

  const text: string = res.response.text?.() ?? "";
  const parsed = safeJSONParse(text) as PlansResponse | null;

  if (!parsed || !Array.isArray(parsed.plans)) {
    throw new Error(`Planner failed. Raw response: ${text}`);
  }

  return parsed.plans.map(
    (p, idx): Plan => ({
      id: typeof p.id === "number" ? p.id : idx + 1,
      hook: p.hook ?? "",
      points: Array.isArray(p.points) ? p.points : [],
      cta: p.cta ?? "",
      example_angle: p.example_angle ?? "",
      ...p,
    })
  );
}
