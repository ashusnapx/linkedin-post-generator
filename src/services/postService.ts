/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/postService.ts
import { Post, GenerationMeta } from "@/src/utils/types";
import { computeCostFromTokens } from "@/src/utils/cost";
import { config } from "@/src/config";

/**
 * Call backend to generate posts.
 * Accepts optional API key to pass to the server.
 */
export async function generatePosts(
  values: Record<string, unknown>,
  apiKey?: string | null
): Promise<{
  posts: Post[];
  meta: GenerationMeta;
}> {
  const start = Date.now();

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add API key if provided
  if (apiKey) {
    headers[config.apiKey.headerName] = apiKey;
  }

  const res = await fetch("/api/generate-posts", {
    method: "POST",
    headers,
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
  const postsData = json.posts ?? json ?? [];
  const normalizedPosts: Post[] = Array.isArray(postsData)
    ? postsData.map((p: any, idx: number) => ({
        id: typeof p === "string" ? idx + 1 : p.id ?? idx + 1,
        content: typeof p === "string" ? p : p.content ?? "",
        hashtags: p?.hashtags ?? [],
        cta: p?.cta ?? "",
        citations: p?.citations ?? [],
        flags: p?.flags ?? {},
      }))
    : [];

  // Normalize tokens
  let tokens: number = 0;
  if (json.meta?.tokens != null) tokens = json.meta.tokens;
  else if (json.tokens != null) tokens = json.tokens;
  else if (json.meta?.token_usage?.total != null)
    tokens = json.meta.token_usage.total;

  const serverMeta = json.meta ?? {};
  const costUSD =
    serverMeta.costUSD ?? json.costUSD ?? computeCostFromTokens(tokens);
  const model = serverMeta.model ?? json.model ?? "unknown";

  const meta: GenerationMeta = {
    tokens,
    latencyMs,
    costUSD,
    model,
  };

  return { posts: normalizedPosts, meta };
}
