import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generatePosts } from "@/src/services/postService";
import { Post, GenerationMeta } from "@/src/utils/types";
import { toast } from "sonner";
import { FormValues, schema } from "@/lib/schema";

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
 */
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

      const { posts: newPosts, meta: newMeta } = await generatePosts(values);

      setPosts(newPosts);
      setMeta(newMeta);

      toast.success("Posts generated successfully 🚀", { id: "gen" });
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
