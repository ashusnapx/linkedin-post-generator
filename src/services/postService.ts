import { Post, GenerationMeta } from "@/src/utils/types";
import { computeCostFromTokens } from "@/src/utils/cost";

/**
 * Call backend to generate posts.
 * Handles response parsing, normalization, and meta computation.
 */
export async function generatePosts(values: Record<string, unknown>): Promise<{
  posts: Post[];
  meta: GenerationMeta;
}> {
  const start = Date.now();

  const res = await fetch("/api/generate-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(values),
  });

  const latencyMs = Date.now() - start;

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response (not JSON)");
  }

  if (!res.ok) throw new Error(json.error || "Failed to generate posts");

  // Normalize posts
  const postsData = json.posts || json || [];
  const normalizedPosts: Post[] = Array.isArray(postsData)
    ? postsData.map((p: any, idx: number) =>
        typeof p === "string"
          ? { id: idx + 1, content: p }
          : {
              id: p.id ?? idx + 1,
              content: p.content ?? "",
              hashtags: p.hashtags,
              cta: p.cta,
              citations: p.citations,
              flags: p.flags,
            }
      )
    : [];

  // Normalize tokens
  let tokens = json.meta?.tokens ?? json.tokens ?? json.meta?.token_usage;
  if (tokens && typeof tokens === "object") {
    tokens = tokens.total ?? 0;
  }

  const serverMeta = json.meta ?? {};
  const costUSD = serverMeta.costUSD ?? json.costUSD;
  const model = serverMeta.model ?? json.model;

  const meta: GenerationMeta = {
    tokens,
    latencyMs,
    costUSD: costUSD ?? computeCostFromTokens(tokens),
    model,
  };

  return { posts: normalizedPosts, meta };
}
