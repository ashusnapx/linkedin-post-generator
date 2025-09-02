// app/api/generate-posts/route.ts
import { NextResponse } from "next/server";
import { getModel } from "@/src/lib/genClient";
import { handleGeneratePosts } from "@/src/services/handlerService";
import { validateRequestBody } from "@/src/utils/validation";
import { logger } from "@/src/lib/logger";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();

    const validation = validateRequestBody(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const model = getModel(); // throws if missing API key
    const result = await handleGeneratePosts(body, model);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      posts: result.posts ?? [],
      meta: {
        tokens: result.meta?.tokens ?? null,
        cost: result.meta?.cost ?? null,
        latencyMs,
      },
    });
  } catch (err: any) {
    logger.error("Route error", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
