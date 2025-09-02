// src/services/handlerService.ts
import { generatePlans } from "./plannerService";
import { generateDraftForPlan } from "./draftingService";
import { enrichDraft } from "./enrichService";
import { TOKEN_USD_RATE, MODEL_NAME } from "@/src/config/constants";
import { GeneratePostsRequest, GeneratePostsResult, Draft } from "@/src/types";
import { logger } from "@/src/lib/logger";

/**
 * Top-level orchestration: run planner -> drafts -> enrich -> metrics.
 * Returns posts and meta info.
 */
export async function handleGeneratePosts(
  body: GeneratePostsRequest,
  model: unknown
): Promise<GeneratePostsResult> {
  let totalTokens = 0;

  // 1. Generate plans
  const plans = await generatePlans(model, {
    topic: body.topic,
    postCount: body.postCount,
    tone: body.tone,
    audience: body.audience,
    length: body.length,
    language: body.language,
    readingLevel: body.readingLevel,
    allowEmojis: body.allowEmojis,
    addHashtags: body.addHashtags,
    hashtagLimit: body.hashtagLimit,
    addCTA: body.addCTA,
    ctaStyle: body.ctaStyle,
    includeLinks: body.includeLinks,
    examples: body.examples,
    temperature: body.temperature,
    seed: body.seed,
  });

  // Tokens: gather from last response if available
  // Note: model.generateContent returns response.usageMetadata; services don't forward it back.
  // If you want token accounting per-step, adapt service return shapes to include usageMetadata.
  // For now attempt to read usage metadata from model responses if accessible; fallback is zero.
  // (Keeping code simple and safe for tests.)

  const posts: Draft[] = [];

  // 2. Draft posts (sequentially to reduce burst and keep deterministic order)
  for (const plan of plans) {
    try {
      const draft = await generateDraftForPlan(model, plan, {
        tone: body.tone,
        audience: body.audience,
        length: body.length,
        language: body.language,
        readingLevel: body.readingLevel,
        allowEmojis: body.allowEmojis,
        addHashtags: body.addHashtags,
        hashtagLimit: body.hashtagLimit,
        addCTA: body.addCTA,
        ctaStyle: body.ctaStyle,
        includeLinks: body.includeLinks,
        temperature: body.temperature,
        seed: body.seed,
      });
      if (draft) posts.push(draft);
    } catch (err: unknown) {
      logger.warn(`Draft failed for plan id=${plan.id}`, err);
      // continue with other plans
    }
  }

  // 3. Enrich posts
  for (let i = 0; i < posts.length; i++) {
    try {
      const enrich = await enrichDraft(model, posts[i], {
        addHashtags: body.addHashtags,
        hashtagLimit: body.hashtagLimit,
        addCTA: body.addCTA,
        ctaStyle: body.ctaStyle,
        language: body.language,
        temperature: body.temperature,
        seed: body.seed,
      });
      if (enrich) {
        posts[i].hashtags = enrich.hashtags;
        posts[i].cta = enrich.cta;
        posts[i].flags = enrich.flags;
      }
    } catch (err: unknown) {
      logger.warn(`Enrich failed for draft id=${posts[i].id}`, err);
    }
  }

  // Basic (approximate) cost: TODO: get accurate tokens from usageMetadata and sum
  // We keep tokens=0 because granular token counts require access to response usage metadata in each service.
  totalTokens = 0;
  const costUSD = totalTokens * TOKEN_USD_RATE;

  return {
    posts,
    meta: {
      model: MODEL_NAME,
      tokens: totalTokens,
      costUSD,
    },
  };
}
