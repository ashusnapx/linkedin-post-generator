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
  const startTime = Date.now();
  console.log("Starting handleGeneratePosts for", body.topic);

  const factualContext = await fetchFacts(body.topic);
  console.log("Fetched factual context");

  const timings: Record<string, number> = {};

  // 1. Planning
  console.log("Planning...");
  const t1 = Date.now();
  const planRes = await generatePlans(model, {
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
  timings.plans = Date.now() - t1;
  console.log(`Planning done in ${timings.plans}ms`);

  if (planRes.usageMetadata?.totalTokenCount != null) {
    totalTokens += planRes.usageMetadata.totalTokenCount;
    console.log("Plan tokens:", planRes.usageMetadata.totalTokenCount);
  }

  const plans = Array.isArray(planRes.plans) ? planRes.plans : [];
  const posts: Draft[] = [];

  // 2. Drafting
  console.log("Drafting...");
  const t2 = Date.now();
  for (const plan of plans) {
    try {
      console.log(`Drafting plan id=${plan.id}`);
      const { draft, usageMetadata } = await generateDraftForPlan(model, plan, {
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
        factualContext: factualContext,
      });

      if (usageMetadata?.totalTokenCount != null) {
        totalTokens += usageMetadata.totalTokenCount;
        console.log(
          `Draft tokens for plan ${plan.id}:`,
          usageMetadata.totalTokenCount
        );
      }

      if (draft) {
        posts.push(draft);
        console.log(`Draft done id=${plan.id}`);
      } else {
        console.warn(`Draft returned null for plan id=${plan.id}`);
      }
    } catch (err: unknown) {
      logger.warn(`Draft failed for plan=${plan.id}`, err);
    }
  }
  timings.drafts = Date.now() - t2;
  console.log(`Drafting phase took ${timings.drafts}ms`);

  // 3. Enrichment
  console.log("Enrichment...");
  const t3 = Date.now();
  for (const post of posts) {
    try {
      console.log(`Enriching draft id=${post.id}`);
      const enrichRes = await enrichDraft(model, post, {
        addHashtags: body.addHashtags,
        hashtagLimit: body.hashtagLimit,
        addCTA: body.addCTA,
        ctaStyle: body.ctaStyle,
        language: body.language,
        temperature: body.temperature,
        seed: body.seed,
      });

      if (enrichRes?.usageMetadata?.totalTokenCount != null) {
        totalTokens += enrichRes.usageMetadata.totalTokenCount;
        console.log(
          `Enrich tokens for post ${post.id}:`,
          enrichRes.usageMetadata.totalTokenCount
        );
      }

      if (enrichRes) {
        post.hashtags = enrichRes.hashtags;
        post.cta = enrichRes.cta;
        post.flags = enrichRes.flags;
        console.log(`Enriched draft id=${post.id}`);
      }
    } catch (err: unknown) {
      logger.warn(`Enrich failed for draft=${post.id}`, err);
    }
  }
  timings.enrich = Date.now() - t3;
  console.log(`Enrichment phase took ${timings.enrich}ms`);

  const totalLatency = Date.now() - startTime;
  const costUSD = totalTokens * TOKEN_USD_RATE;

  console.log("Total tokens:", totalTokens);
  console.log("Cost USD:", costUSD.toFixed(4));
  console.log("Total latency ms:", totalLatency);

  return {
    posts,
    meta: {
      model: MODEL_NAME,
      tokens: totalTokens,
      costUSD,
      latency: {
        totalMs: totalLatency,
        ...timings,
      },
    },
  };
}
