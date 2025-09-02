import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema, FormValues } from "../lib/schema";
import { toast } from "sonner";

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

const DEFAULT_VALUES: FormValues = {
  topic: "",
  tone: "Startup Founder",
  audience: "",
  length: "short",
  postCount: "3",
  addHashtags: true,
  addCTA: true,
  language: "English",
  allowEmojis: true,
  includeLinks: false,
  temperature: 0.6,
  hashtagLimit: 5,
  ctaStyle: "Question",
  readingLevel: "Professional",
  seed: undefined,
  examples: "",
};

/**
 * Compute cost estimate from token usage.
 * Fallback rate: 0.03 USD / 1k tokens unless overridden by env.
 */
function computeCostFromTokens(tokens?: number) {
  if (tokens === undefined) return undefined;
  const defaultPer1k = 0.03;
  const envRate = Number(process.env.NEXT_PUBLIC_COST_PER_1K_TOKENS);
  const per1k = !isNaN(envRate) && envRate > 0 ? envRate : defaultPer1k;
  const cost = (tokens / 1000) * per1k;
  return Math.round(cost * 1_000_000) / 1_000_000; // round to 6 decimals
}

export function useFormHandler() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const [posts, setPosts] = React.useState<Post[]>([]);
  const [meta, setMeta] = React.useState<GenerationMeta | null>(null);

  const onSubmit = React.useCallback(async (values: FormValues) => {
    try {
      toast.loading("Generating posts…", { id: "gen" });

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

      toast.success("Posts generated successfully 🚀", { id: "gen" });

      // ✅ Handle structured posts from backend response
      const postsData = json.posts || json || [];
      const normalizedPosts = Array.isArray(postsData)
        ? postsData.map((p: any, idx: number) => {
            // Handle both structured and simple string formats
            if (typeof p === "string") {
              return {
                id: idx + 1,
                content: p,
              };
            }

            // Handle structured post objects
            return {
              id: p.id ?? idx + 1,
              content: p.content ?? "",
              hashtags: p.hashtags,
              cta: p.cta,
              citations: p.citations,
              flags: p.flags,
            };
          })
        : [];

      setPosts(normalizedPosts);

      const serverMeta = json.meta ?? {};
      let tokens = serverMeta.tokens ?? json.tokens ?? serverMeta.token_usage;

      // ✅ normalize tokens if it's {input, output, total}
      if (tokens && typeof tokens === "object") {
        tokens = tokens.total ?? 0;
      }

      const costUSD = serverMeta.costUSD ?? json.costUSD;
      const model = serverMeta.model ?? json.model;

      const newMeta: GenerationMeta = {
        tokens,
        latencyMs,
        costUSD: costUSD ?? computeCostFromTokens(tokens),
        model,
      };

      console.log("Computed generation meta:", newMeta);
      setMeta(newMeta);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      toast.error(message, { id: "gen" });
    }
  }, []);

  return {
    form: form as UseFormReturn<FormValues>,
    submitHandler: form.handleSubmit(onSubmit),
    posts,
    setPosts,
    meta,
    setMeta,
  };
}
