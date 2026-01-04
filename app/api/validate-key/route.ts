// app/api/validate-key/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/src/config";

/**
 * Validate a Gemini API key by making a minimal test request.
 * Returns 200 if valid, 401 if invalid.
 */
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get(config.apiKey.headerName);

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key provided" },
        { status: 400 }
      );
    }

    // Basic format validation
    if (apiKey.length < config.apiKey.minLength) {
      return NextResponse.json({ error: "API key too short" }, { status: 401 });
    }

    // Test the key with a minimal request
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: config.llm.defaultModel });

    // Make a minimal generation request to validate
    await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
      generationConfig: {
        maxOutputTokens: 1,
      },
    });

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check if it's an API key error
    if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Other errors (rate limit, etc.) - key might still be valid
    return NextResponse.json(
      {
        valid: true,
        warning: "Could not fully validate, but format is correct",
      },
      { status: 200 }
    );
  }
}
