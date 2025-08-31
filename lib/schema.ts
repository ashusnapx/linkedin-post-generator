// lib/schema.ts
import { z } from "zod";
import {
  PERSONAS,
  LENGTHS,
  POST_COUNTS,
  LANGUAGES,
  CTA_STYLES,
  READING_LEVELS,
} from "./constants";

export const schema = z.object({
  topic: z.string().min(3, "Topic is required"),
  tone: z.enum(PERSONAS),
  audience: z.string().optional(),
  length: z.enum(LENGTHS),
  postCount: z.enum(POST_COUNTS),
  addHashtags: z.boolean(),
  addCTA: z.boolean(),
  language: z.enum(LANGUAGES),
  allowEmojis: z.boolean(),
  includeLinks: z.boolean(),
  temperature: z.number().min(0).max(1),
  hashtagLimit: z.number().min(0).max(10),
  ctaStyle: z.enum(CTA_STYLES),
  readingLevel: z.enum(READING_LEVELS),
  seed: z.number().int().min(0).max(999999).optional(),
  examples: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;
