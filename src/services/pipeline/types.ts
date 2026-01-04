// src/services/pipeline/types.ts
/**
 * Pipeline architecture types.
 *
 * Each stage in the pipeline is self-documenting:
 * - name: Human-readable identifier
 * - usesLLM: Whether this stage requires an LLM call (affects cost)
 * - justification: Why this stage exists and why it uses/avoids LLM
 */

export interface PipelineContext {
  // Input (immutable after creation)
  input: {
    topic: string;
    postCount: number;
    tone?: string;
    audience?: string;
    length?: string;
    language?: string;
    readingLevel?: string;
    allowEmojis?: boolean;
    addHashtags?: boolean;
    hashtagLimit?: number;
    addCTA?: boolean;
    ctaStyle?: string;
    includeLinks?: boolean;
    temperature?: number;
    seed?: number;
    examples?: string;
  };

  // Accumulated context (mutable)
  normalizedTopic?: string;
  topicCategory?: string;
  factualContext?: string;
  plans?: Plan[];
  drafts?: Draft[];

  // Metrics
  metrics: {
    totalTokens: number;
    llmCalls: number;
    timings: Record<string, number>;
  };
}

export interface Plan {
  id: number;
  hook: string;
  points: string[];
  cta: string;
  angle: string;
}

export interface Draft {
  id: number;
  content: string;
  hashtags: string[];
  cta: string;
  flags: {
    profanity: boolean;
    riskyClaims: string[];
    passedGuardrails: boolean;
  };
}

export interface PipelineStage {
  name: string;
  usesLLM: boolean;
  justification: string;
  execute(context: PipelineContext): Promise<PipelineContext>;
}
