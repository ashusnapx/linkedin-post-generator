// src/types/index.ts
export interface GeneratePostsRequest {
  topic: string;
  tone?: string;
  audience?: string;
  length?: string;
  postCount: number;
  addHashtags?: boolean;
  addCTA?: boolean;
  language?: string;
  allowEmojis?: boolean;
  includeLinks?: boolean;
  temperature?: number;
  hashtagLimit?: number;
  ctaStyle?: string;
  readingLevel?: string;
  seed?: number;
  examples?: string;
}

export interface Plan {
  id: number;
  hook?: string;
  points?: string[];
  cta?: string;
  example_angle?: string;
  [k: string]: unknown;
}

export interface Draft {
  id: number;
  content: string;
  hashtags?: string[];
  cta?: string;
  flags?: { profanity?: boolean; riskyClaims?: string[] };
}

export interface GeneratePostsResult {
  posts: Draft[];
  meta: {
    cost: null;
    model: string;
    tokens: number;
    costUSD: number;
    latencyMs?: number;
    latency?: {
      totalMs: number;
      factFetch?: number;
      planning?: number;
      draftAndEnrich?: number;
      [key: string]: number | undefined;
    };
  };
}
