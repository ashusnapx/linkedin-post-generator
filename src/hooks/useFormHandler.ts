// src/hooks/useFormHandler.ts
"use client";
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generatePosts } from "@/src/services/postService";
import { Post, GenerationMeta } from "@/src/utils/types";
import { toast } from "sonner";
import { FormValues, schema } from "@/lib/schema";
import { useApiKey } from "@/src/context/ApiKeyContext";

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
 * Custom hook wrapping form + post generation flow.
 * Now includes API key integration.
 */
export function useFormHandler() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const { apiKey, isKeySet } = useApiKey();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [meta, setMeta] = React.useState<GenerationMeta | null>(null);
  const [stepMessages, setStepMessages] = React.useState<string[]>([]);

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      // Check for API key
      if (!isKeySet) {
        toast.error("Please connect your API key first", { id: "gen" });
        return;
      }

      try {
        setStepMessages(["Initializing generation pipeline..."]);
        toast.loading("Generating posts…", { id: "gen" });

        setStepMessages((prev) => [...prev, "Fetching factual context..."]);

        const { posts: newPosts, meta: newMeta } = await generatePosts(
          values,
          apiKey
        );

        setPosts(newPosts);
        setMeta(newMeta);
        setStepMessages([]);

        toast.success("Posts generated successfully 🚀", { id: "gen" });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.";
        toast.error(message, { id: "gen" });
        setStepMessages([]);
      }
    },
    [apiKey, isKeySet]
  );

  return {
    form: form as UseFormReturn<FormValues>,
    submitHandler: form.handleSubmit(onSubmit),
    posts,
    setPosts,
    meta,
    setMeta,
    stepMessages,
    isKeySet,
  };
}
