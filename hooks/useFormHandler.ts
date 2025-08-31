// hooks/useFormHandler.ts
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema, FormValues } from "../lib/schema";
import { toast } from "sonner";

/**
 * Hook that encapsulates form setup + submit logic.
 *
 * Exposes:
 *  - react-hook-form methods
 *  - submit handler bound to API
 *  - posts state (generated output)
 */
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

  /**
   * Submitter wired to /api/generate-posts
   * kept outside of JSX per requirement (no inline functions).
   */
  async function onSubmit(values: FormValues) {
    try {
      toast.loading("Generating posts…", { id: "gen" });
      // debug
      // console.log("📤 Sending values:", values);

      const res = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to generate posts");

      toast.success("Posts generated successfully 🚀", { id: "gen" });

      setPosts(json.posts || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      // console.error("❌ Client error:", err);
      toast.error(message, { id: "gen" });
    }
  }

  const submitHandler = handleSubmit(onSubmit);

  return {
    form: form as UseFormReturn<FormValues>,
    submitHandler,
    posts,
    setPosts,
  };
}
