export type Citation = {
  label: string;
  url: string;
};

export type Flags = {
  profanity?: boolean;
  riskyClaims?: string[];
};

export type Post = {
  id: number;
  content: string;
  hashtags?: string[];
  cta?: string;
  citations?: Citation[];
  flags?: Flags;
};

export type GenerationMeta = {
  tokens?: number;
  latencyMs?: number;
  costUSD?: number;
  model?: string;
};
