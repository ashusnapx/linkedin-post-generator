// hooks/useFormHandler.ts
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema, FormValues } from "../lib/schema";
import { toast } from "sonner";

/**
 * Meta info returned or computed after generation.
 */
export type GenerationMeta = {
  tokens?: number;
  latencyMs?: number;
  costUSD?: number;
  model?: string;
};

export function useFormHandler() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      topic: "",
      tone: "Startup Founder",
      audience: "",
      length: "medium",
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
    },
  });

  const { handleSubmit } = form;

  const [posts, setPosts] = React.useState<{ id: number; content: string }[]>(
    []
  );

  const [meta, setMeta] = React.useState<GenerationMeta | null>(null);

  /**
   * Helper: compute a fallback cost estimate using a public env var
   * NEXT_PUBLIC_COST_PER_1K_TOKENS (USD per 1k tokens).
   * Default used if env var is missing: 0.03 USD / 1k tokens (adjust as needed).
   */
  function computeCostFromTokens(tokens?: number) {
    if (tokens === undefined) return undefined;
    const defaultPer1k = 0.03; // placeholder; replace via env var
    const per1k = parseFloat(
      (process.env.NEXT_PUBLIC_COST_PER_1K_TOKENS ?? defaultPer1k).toString()
    );
    const cost = (tokens / 1000) * per1k;
    // round to 6 decimals for display
    return Math.round(cost * 1_000_000) / 1_000_000;
  }

  async function onSubmit(values: FormValues) {
    try {
      toast.loading("Generating posts…", { id: "gen" });

      // measure latency client-side
      const t0 = performance.now();

      const res = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const t1 = performance.now();
      const latencyMs = Math.round(t1 - t0);

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to generate posts");

      // success
      toast.success("Posts generated successfully 🚀", { id: "gen" });

      // posts array expected at json.posts
      setPosts(json.posts || []);

      // prefer meta from server: json.meta or top-level fields json.tokens, json.costUSD
      const serverMeta = json.meta ?? {};
      const tokens =
        serverMeta.tokens ?? json.tokens ?? serverMeta.token_usage ?? undefined;
      const costUSD = serverMeta.costUSD ?? json.costUSD ?? undefined;
      const model = serverMeta.model ?? json.model ?? undefined;

      // compute fallback cost if tokens exist but costUSD missing
      const computedCost =
        costUSD !== undefined ? costUSD : computeCostFromTokens(tokens);

      setMeta({
        tokens,
        latencyMs,
        costUSD: computedCost,
        model,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      toast.error(message, { id: "gen" });
    }
  }

  const submitHandler = handleSubmit(onSubmit);

  return {
    form: form as UseFormReturn<FormValues>,
    submitHandler,
    posts,
    setPosts,
    meta, // NEW — meta with tokens / latency / cost
    setMeta,
  };
}
