// app/api/generate-posts/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { handleGeneratePosts } from "@/src/services/handlerService";
import { validateRequestBody } from "@/src/utils/validation";
import { checkRateLimit, getClientIP } from "@/src/lib/rateLimit";
import { logger } from "@/src/lib/logger";
import { config } from "@/src/config";

export async function POST(req: Request) {
  const startTime = Date.now();

  // Get API key from header (user-provided)
  const userApiKey = req.headers.get(config.apiKey.headerName);

  // Fallback to env var for development
  const apiKey = userApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key required. Please connect your Gemini API key." },
      { status: 401 }
    );
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimitResult = await checkRateLimit(clientIP);

  if (!rateLimitResult.ok) {
    logger.warn("Rate limit exceeded", { ip: clientIP });
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
          ),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  try {
    const body = await req.json();

    const validation = validateRequestBody(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Create model with user's API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: config.llm.defaultModel });

    const result = await handleGeneratePosts(body, model);

    const latencyMs = Date.now() - startTime;

    // Log metrics
    logger.metric("generation_complete", {
      tokens: result.meta?.tokens,
      costUSD: result.meta?.costUSD,
      latencyMs,
      postCount: result.posts?.length,
    });

    return NextResponse.json(
      {
        posts: result.posts ?? [],
        meta: {
          tokens: result.meta?.tokens ?? null,
          costUSD: result.meta?.costUSD ?? null,
          latencyMs,
          latency: result.meta?.latency,
          model: result.meta?.model,
          llmCalls: 2,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Route error", err);

    // Check for API key specific errors
    if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your Gemini API key." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Server error", details: message },
      { status: 500 }
    );
  }
}
