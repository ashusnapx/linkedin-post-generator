// src/utils/validation.ts
import { GeneratePostsRequest } from "@/src/types";

/**
 * Lightweight validation function for incoming request body.
 * Returns { ok: true } or { ok: false, error: string }
 * Coerces postCount to a number if it's passed as a string.
 */
export function validateRequestBody(
  body: unknown
): { ok: true } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const b = body as GeneratePostsRequest & { postCount?: unknown };
  const { topic } = b;
  let { postCount } = b;

  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return { ok: false, error: "Missing or invalid field: topic" };
  }

  // Coerce string → number if needed
  if (typeof postCount === "string") {
    const parsed = parseInt(postCount, 10);
    if (Number.isFinite(parsed)) {
      (b as any).postCount = parsed; // update body in place for downstream
      postCount = parsed;
    }
  }

  if (
    typeof postCount !== "number" ||
    !Number.isFinite(postCount) ||
    postCount <= 0
  ) {
    return {
      ok: false,
      error: "Missing or invalid field: postCount (positive number required)",
    };
  }

  return { ok: true };
}
