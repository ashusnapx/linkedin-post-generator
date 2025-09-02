// app/api/generate-posts/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function safeJSONParse(raw: string) {
  try {
    let cleaned = raw.trim();
    cleaned = cleaned
      .replace(/^```json/i, "")
      .replace(/```$/i, "")
      .trim();
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ JSON parse failed:", raw);
    return null;
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let totalTokens = 0;
  let costUSD = 0;

  try {
    const body = await req.json();

    const {
      topic,
      tone,
      audience,
      length,
      postCount,
      addHashtags,
      addCTA,
      language,
      allowEmojis,
      includeLinks,
      temperature,
      hashtagLimit,
      ctaStyle,
      readingLevel,
      seed,
      examples,
    } = body;

    if (!topic || !postCount) {
      return NextResponse.json(
        { error: "Missing required fields: topic or postCount" },
        { status: 400 }
      );
    }

    const modelName = "gemini-2.5-flash-lite";
    const model = genAI.getGenerativeModel({ model: modelName });

    /**
     * STEP 1: PLANNING
     */
    const planPrompt = `
You are a LinkedIn content strategist.

Task: Generate ${postCount} structured LinkedIn post plans.
Topic: "${topic}"

Constraints:
- Tone: ${tone || "Default"}
- Audience: ${audience || "General"}
- Target Length: ${length || "medium"}
- Language: ${language || "English"}
- Reading Level: ${readingLevel || "Professional"}
- Use Emojis: ${allowEmojis ? "Yes" : "No"}
- Add Hashtags: ${addHashtags ? "Yes" : "No"} (limit: ${hashtagLimit || 5})
- Add CTA: ${addCTA ? "Yes" : "No"} (style: ${ctaStyle || "Neutral"})
- Include Links: ${includeLinks ? "Yes" : "No"}

Examples to consider: ${examples || "None"}

Return JSON only:
{
  "plans": [
    { "id": 1, "hook": "...", "points": ["..."], "cta": "...", "example_angle": "..." }
  ]
}`;
    const planResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: planPrompt }] }],
      generationConfig: {
        temperature: temperature || 0.6,
        candidateCount: 1,
        ...(seed && { seed }),
      },
    });
    totalTokens += planResult.response.usageMetadata?.totalTokens ?? 0;

    const planText = planResult.response.text();
    const planData = safeJSONParse(planText);

    if (!planData?.plans) {
      return NextResponse.json(
        { error: "Planner failed. Response: " + planText },
        { status: 500 }
      );
    }

    /**
     * STEP 2: DRAFTING
     */
    const posts: any[] = [];
    for (const plan of planData.plans) {
      const draftPrompt = `
Take this plan and draft a complete LinkedIn post.

Plan:
${JSON.stringify(plan)}

Constraints:
- Tone: ${tone || "Default"}
- Audience: ${audience || "General"}
- Target Length: ${length || "medium"}
- Language: ${language || "English"}
- Reading Level: ${readingLevel || "Professional"}
- Use Emojis: ${allowEmojis ? "Yes" : "No"}
- Add Hashtags: ${addHashtags ? "Yes" : "No"} (limit: ${hashtagLimit || 5})
- Add CTA: ${addCTA ? "Yes" : "No"} (style: ${ctaStyle || "Neutral"})
- Include Links: ${includeLinks ? "Yes" : "No"}

Return JSON only:
{ "id": ${plan.id}, "content": "..." }
`;
      const draftResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: draftPrompt }] }],
        generationConfig: {
          temperature: temperature || 0.6,
          candidateCount: 1,
          ...(seed && { seed }),
        },
      });
      totalTokens += draftResult.response.usageMetadata?.totalTokens ?? 0;

      const draftText = draftResult.response.text();
      const draftData = safeJSONParse(draftText);

      if (draftData?.content) {
        posts.push(draftData);
      }
    }

    /**
     * STEP 3: ENRICHING
     */
    for (let i = 0; i < posts.length; i++) {
      const enrichPrompt = `
Enrich this LinkedIn post with metadata.

Post:
${posts[i].content}

Constraints:
- Add Hashtags: ${addHashtags ? "Yes" : "No"} (limit: ${hashtagLimit || 5})
- Add CTA: ${addCTA ? "Yes" : "No"} (style: ${ctaStyle || "Neutral"})
- Language: ${language || "English"}

Return JSON only:
{
  "index": ${i + 1},
  "hashtags": ["#example1", "#example2"],
  "cta": "string",
  "flags": { "profanity": false, "riskyClaims": [] }
}`;
      const enrichResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: enrichPrompt }] }],
        generationConfig: {
          temperature: temperature || 0.6,
          candidateCount: 1,
          ...(seed && { seed }),
        },
      });
      totalTokens += enrichResult.response.usageMetadata?.totalTokens ?? 0;

      const enrichText = enrichResult.response.text();
      const enrichData = safeJSONParse(enrichText);

      if (enrichData) {
        posts[i].hashtags = enrichData.hashtags || [];
        posts[i].cta = enrichData.cta || "";
        posts[i].flags = enrichData.flags || {};
      }
    }

    /**
     * STEP 4: METRICS
     */
    const latencyMs = Date.now() - startTime;
    costUSD = totalTokens * 0.000002;

    return NextResponse.json({
      posts,
      meta: {
        model: modelName,
        tokens: totalTokens,
        latencyMs,
        costUSD,
      },
    });
  } catch (err: any) {
    console.error("❌ API Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
