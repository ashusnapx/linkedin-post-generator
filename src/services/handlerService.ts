// src/services/handlerService.ts
import { generatePlans } from "./plannerService";
import { generateDraftForPlan } from "./draftingService";
import { enrichDraft } from "./enrichService";
import { TOKEN_USD_RATE, MODEL_NAME } from "@/src/config/constants";
import { GeneratePostsRequest, GeneratePostsResult, Draft } from "@/src/types";
import { logger } from "@/src/lib/logger";
import { fetchFacts } from "./factService";

/**
 * Top-level orchestration: run planner -> drafts -> enrich -> metrics.
 * Returns posts and meta info.
 */
export async function handleGeneratePosts(
  body: GeneratePostsRequest,
  model: {
    generateContent: (args: unknown) => Promise<any>;
  }
): Promise<GeneratePostsResult> {
  let totalTokens = 0;

  const factualContext = await fetchFacts(body.topic);

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
    factualContext,
  });

  const posts: Draft[] = [];

  // 2. Draft posts
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

  // Cost calculation
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

