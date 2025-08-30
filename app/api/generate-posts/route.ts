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
  return `
    You are a LinkedIn Post Generator.

    Generate ${data.postCount ?? 3} posts about: "${data.topic}".

    - Tone: ${data.tone ?? "professional"}
    - Audience: ${data.audience ?? "general professionals"}
    - Length: ${data.length ?? "200"} words
    - Language: ${data.language ?? "English"}
    - Hashtags: ${data.addHashtags ? "Yes" : "No"}
    - CTA: ${data.addCTA ? `Yes (Style: ${data.ctaStyle ?? "formal"})` : "No"}
    - Emojis: ${data.allowEmojis ? "Yes" : "No"}
    - Links: ${data.includeLinks ? "Yes" : "No"}
    - Hashtag Limit: ${data.hashtagLimit ?? "N/A"}
    - Reading Level: ${data.readingLevel ?? "N/A"}
    - Examples: ${data.examples ?? "none"}

    ⚠️ STRICT OUTPUT RULES:
    - Output each post as **Markdown formatted text**.
    - Separate posts with "\n---\n" (horizontal rule).
    - Do NOT add numbering (1,2,3…).
    - Do NOT add "Post X:" headers.
    - Just raw Markdown posts, including emojis and hashtags if required.
  `;
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
