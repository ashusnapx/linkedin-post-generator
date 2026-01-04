// app/api/generate-posts/route.ts
import { NextResponse } from "next/server";
import { getModel } from "@/src/lib/genClient";
import { handleGeneratePosts } from "@/src/services/handlerService";
import { validateRequestBody } from "@/src/utils/validation";
import { checkRateLimit, getClientIP } from "@/src/lib/rateLimit";
import { logger } from "@/src/lib/logger";

export async function POST(req: Request) {
  const startTime = Date.now();

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

    const model = getModel(); // throws if missing API key
    const result = await handleGeneratePosts(body, model);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        posts: result.posts ?? [],
        meta: {
          tokens: result.meta?.tokens ?? null,
          costUSD: result.meta?.costUSD ?? null,
          latencyMs,
          latency: result.meta?.latency,
          model: result.meta?.model,
          llmCalls: 2, // Constant: plan + batch draft
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      }
    );
  } catch (err: any) {
    logger.error("Route error", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
