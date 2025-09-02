export interface Citation {
  label: string;
  url: string;
}

export interface Flags {
  profanity?: boolean;
  riskyClaims?: string[];
}

export interface Post {
  id: number;
  content: string;
  hashtags?: string[];
  cta?: string;
  citations?: Citation[];
  flags?: Flags;
}

export interface PostsOutputProps {
  posts: Post[];
  tokens?: number;
  latency?: number;
  cost?: number;
}
