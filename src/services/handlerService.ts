import { generatePlans } from "./plannerService";
import { generateAllDraftsWithEnrichment } from "./batchDraftingService";
import { fetchFacts } from "./factService";
import { TOKEN_USD_RATE, MODEL_NAME } from "@/src/config/constants";
import { GeneratePostsRequest, GeneratePostsResult } from "@/src/types";
import { logger } from "@/src/lib/logger";

/**
 * Top-level orchestration: fact fetch → plan → batch draft+enrich → metrics.
 *
 * ARCHITECTURE NOTES (for future maintainers):
 *
 * This handler implements a 3-stage pipeline optimized for cost:
 *
 * 1. FACT FETCH (no LLM)
 *    - Web scraping via DuckDuckGo
 *    - Provides grounding context to prevent hallucination
 *    - Could be cached for repeated topics (TODO)
 *
 * 2. PLANNING (1 LLM call)
 *    - Generates N post "plans" (hooks, angles, structure)
 *    - Uses stochastic LLM for creative variance
 *    - Plans are the cheapest part (~10% of tokens)
 *
 * 3. BATCH DRAFTING + ENRICHMENT (1 LLM call)
 *    - Single call generates ALL posts with enrichment included
 *    - Eliminates N+1 problem (was 2N calls, now 1)
 *    - Explicit variance instructions maintain diversity
 *
 * COST BREAKDOWN:
 * - Before: 1 + N + N = 2N+1 LLM calls (~7-11 calls for 3-5 posts)
 * - After:  1 + 1 = 2 LLM calls (constant, regardless of post count)
 * - Estimated savings: ~60-70% token reduction
 */
export async function handleGeneratePosts(
  body: GeneratePostsRequest,
  model: { generateContent: (args: unknown) => Promise<any> }
): Promise<GeneratePostsResult> {
  let totalTokens = 0;
  const startTime = Date.now();
  const timings: Record<string, number> = {};

  logger.info("Starting generation pipeline", {
    topic: body.topic,
    postCount: body.postCount,
  });

  // Stage 1: Fetch factual context (no LLM)
  const t0 = Date.now();
  const factualContext = await fetchFacts(body.topic);
  timings.factFetch = Date.now() - t0;
  logger.info("Fact fetch complete", { duration: timings.factFetch });

  // Stage 2: Planning (1 LLM call)
  const t1 = Date.now();
  const planRes = await generatePlans(model, { ...body, factualContext });
  timings.planning = Date.now() - t1;

  if (planRes.usageMetadata?.totalTokenCount != null) {
    totalTokens += planRes.usageMetadata.totalTokenCount;
  }

  const plans = Array.isArray(planRes.plans) ? planRes.plans : [];
  logger.info("Planning complete", {
    duration: timings.planning,
    planCount: plans.length,
    planTokens: planRes.usageMetadata?.totalTokenCount,
  });

  if (plans.length === 0) {
    throw new Error("Planner returned no plans");
  }

  // Stage 3: Batch Drafting + Enrichment (1 LLM call)
  const t2 = Date.now();
  const { drafts, usageMetadata } = await generateAllDraftsWithEnrichment(
    model,
    plans,
    { ...body, factualContext }
  );
  timings.draftAndEnrich = Date.now() - t2;

  if (usageMetadata?.totalTokenCount != null) {
    totalTokens += usageMetadata.totalTokenCount;
  }

  logger.info("Draft+Enrich complete", {
    duration: timings.draftAndEnrich,
    draftCount: drafts.length,
    draftTokens: usageMetadata?.totalTokenCount,
  });

  // Compute final metrics
  const totalLatency = Date.now() - startTime;
  const costUSD = totalTokens * TOKEN_USD_RATE;

  logger.info("Pipeline complete", {
    totalTokens,
    costUSD: costUSD.toFixed(6),
    totalLatency,
    llmCalls: 2, // plan + batch draft
  });

  return {
    posts: drafts,
    meta: {
      model: MODEL_NAME,
      tokens: totalTokens,
      costUSD,
      cost: null,
      latency: {
        totalMs: totalLatency,
        ...timings,
      },
    },
  };
}
