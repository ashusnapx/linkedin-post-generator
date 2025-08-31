// app/api/generate-posts/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Init Gemini Client (fail-fast if missing key)
if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error("❌ Missing NEXT_PUBLIC_GEMINI_API_KEY in environment.");
}
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// ✅ Types for safety
interface GeneratePostRequest {
  topic: string;
  tone?: string;
  audience?: string;
  length?: number | string;
  postCount?: number;
  addHashtags?: boolean;
  addCTA?: boolean;
  language?: string;
  allowEmojis?: boolean;
  includeLinks?: boolean;
  temperature?: number;
  hashtagLimit?: number;
  ctaStyle?: string;
  readingLevel?: string;
  examples?: string;
}

// ✅ Utility: Safe JSON parsing with fallback
async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

// ✅ Utility: Build dynamic prompt
function buildPrompt(data: GeneratePostRequest): string {
  const basePrompt = `
You are an expert LinkedIn Content Strategist with deep expertise in social media psychology, engagement optimization, and professional communication. Your role is to craft compelling LinkedIn posts that drive meaningful engagement and deliver measurable business value.

CONTENT PARAMETERS:
- Topic: "${data.topic}"
- Number of Posts: ${data.postCount ?? 3}
- Target Tone: ${data.tone ?? "professional"}
- Primary Audience: ${data.audience ?? "general professionals"}
- Target Length: ${data.length ?? "200"} words per post
- Language: ${data.language ?? "English"}
- Include Hashtags: ${data.addHashtags ? "Yes" : "No"}
- Call-to-Action Required: ${
    data.addCTA ? `Yes (Style: ${data.ctaStyle ?? "formal"})` : "No"
  }
- Emoji Usage: ${data.allowEmojis ? "Permitted and encouraged" : "Prohibited"}
- External Links: ${
    data.includeLinks
      ? "Include relevant links when valuable"
      : "No external links"
  }
${data.hashtagLimit ? `- Hashtag Limit: ${data.hashtagLimit} maximum` : ""}
${data.readingLevel ? `- Reading Level: ${data.readingLevel}` : ""}
${data.examples ? `- Reference Examples: ${data.examples}` : ""}

QUALITY FRAMEWORK - Each post must demonstrate:

1. HOOK MASTERY: Open with a compelling hook that stops scrolling within the first 7 words. Use proven psychological triggers such as curiosity gaps, contrarian statements, personal vulnerability, or surprising statistics.

2. VALUE DELIVERY: Provide actionable insights, counterintuitive wisdom, or practical frameworks that readers can immediately apply. Avoid generic advice and surface-level observations.

3. STORYTELLING EXCELLENCE: Structure content using proven narrative frameworks (problem-solution, before-after-bridge, hero's journey) to create emotional resonance and memorability.

4. ENGAGEMENT OPTIMIZATION: Craft content that naturally encourages comments, shares, and meaningful discussions. Include conversation starters and opinion-seeking elements.

5. PROFESSIONAL CREDIBILITY: Maintain authority and expertise while remaining approachable and authentic. Balance confidence with humility.

CONTENT STRUCTURE REQUIREMENTS:

Opening Hook (15-25 words): Create immediate intrigue or present a bold statement
Core Content (70-80% of word count): Deliver substantive value through insights, frameworks, or stories
Social Proof Element: Include relevant experience, data, or credible references when applicable
Engagement Driver: End with thought-provoking questions or calls for shared experiences
Strategic Closing: Reinforce key message and create lasting impression

ADVANCED OPTIMIZATION TECHNIQUES:

- Use the "scroll-stopper" principle: first line must be conversation-worthy
- Apply the "aha moment" framework: reveal something unexpected or counterintuitive
- Implement pattern interrupts: break conventional wisdom or challenge common assumptions
- Create "shareability quotient": include memorable one-liners or frameworks worth sharing
- Design for multiple engagement types: likes, comments, shares, and saves

TONE AND VOICE CALIBRATION:
Adapt writing style to match the specified tone while maintaining authenticity. Professional should feel authoritative yet approachable, casual should feel conversational yet valuable, inspirational should feel motivating yet grounded.

HASHTAG STRATEGY (when enabled):
Select hashtags based on three tiers: broad reach (#leadership), niche relevance (#startuplife), and branded/community tags. Prioritize hashtags with active, engaged communities over pure follower count.

CALL-TO-ACTION OPTIMIZATION (when enabled):
Design CTAs that feel natural and valuable rather than pushy. Focus on mutual benefit and community building rather than direct selling.

FORMAT REQUIREMENTS:
- Output raw Markdown formatted posts
- Separate multiple posts with "---"
- No post numbering or headers
- Include all requested elements (hashtags, CTAs, emojis) seamlessly within content
- Ensure each post is complete and ready for immediate publishing

QUALITY ASSURANCE CHECKLIST:
Before finalizing, verify each post delivers genuine value, maintains professional standards, aligns with audience expectations, and incorporates all specified parameters effectively.

Generate content that exemplifies best-in-class LinkedIn marketing while remaining authentic and valuable to the target audience.`;

  return basePrompt;
}

// ✅ Utility: Parse raw Gemini output → posts[]
function parsePosts(rawText: string): { id: number; content: string }[] {
  if (!rawText) return [];

  // ✅ First: split on "---" (Markdown HR)
  let splitPosts = rawText
    .split(/\n-{3,}\n/g) // matches --- hr
    .map((p) => p.trim())
    .filter(Boolean);

  // ✅ Fallback: double newlines
  if (splitPosts.length < 2) {
    splitPosts = rawText
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return splitPosts.map((content, i) => ({ id: i + 1, content }));
}


export async function POST(req: Request) {
  try {
    const body = await safeJson<GeneratePostRequest>(req);

    // ✅ Validate payload
    if (!body || !body.topic) {
      return NextResponse.json(
        { error: "Missing required field: topic" },
        { status: 400 }
      );
    }

    // ✅ Build prompt
    const prompt = buildPrompt(body);

    // ✅ Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);

    let rawText = "";

    // Try text() first
    if (typeof result?.response?.text === "function") {
      rawText = result.response.text().trim();
    }

    // Fallback: candidates.parts
    if (!rawText && Array.isArray(result?.response?.candidates)) {
      const parts = result.response.candidates[0]?.content?.parts || [];
      rawText = parts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => p.text || "")
        .join("\n")
        .trim();
    }

    // Last fallback: dump JSON
    if (!rawText) {
      rawText = JSON.stringify(result.response, null, 2);
    }

    // ✅ Parse into posts
    const posts = parsePosts(rawText);

    // ✅ Final response
    return NextResponse.json({ posts });
  } catch (err: unknown) {
    console.error("❌ Error generating posts:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
