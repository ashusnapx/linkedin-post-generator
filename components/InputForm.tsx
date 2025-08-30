"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideInfo } from "lucide-react";

// -----------------------------
// Constants
// -----------------------------
const PERSONAS = [
  "Startup Founder",
  "Career Coach",
  "Techie",
  "Analyst",
] as const;
const LENGTHS = ["short", "medium", "long"] as const;
const POST_COUNTS = ["3", "4", "5"] as const;
const LANGUAGES = ["English", "Hindi", "Hinglish"] as const;
const CTA_STYLES = ["Question", "Directive", "Soft Ask", "No CTA"] as const;
const READING_LEVELS = [
  "Grade 6",
  "Grade 8",
  "Grade 10",
  "Professional",
] as const;

// -----------------------------
// Schema
// -----------------------------
const schema = z.object({
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

type FormValues = z.infer<typeof schema>;

// Helper
const one = (arr: number[]) => (Array.isArray(arr) ? arr[0] : 0.6);

export default function InputForm(): React.JSX.Element {
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

  const { handleSubmit, control, formState, watch, setValue } = form;
  const { isSubmitting } = formState;
  const addHashtags = watch("addHashtags");

  const onSubmit = async (values: FormValues) => {
    try {
      toast.loading("Generating posts…", { id: "gen" });
      await new Promise((res) => setTimeout(res, 1500));
      toast.success("Posts generated successfully 🚀", { id: "gen" });
      console.log("✅ Submitted:", values);
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    }
  };

  // Tooltip wrapper
  const Info = ({ text }: { text: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <LucideInfo className='inline w-4 h-4 ml-1 text-muted-foreground cursor-pointer' />
        </TooltipTrigger>
        <TooltipContent>
          <p className='text-sm'>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Reusable Select
  const renderSelect = <T extends string>({
    name,
    label,
    items,
    tooltip,
  }: {
    name: keyof FormValues;
    label: string;
    items: readonly T[];
    tooltip?: string;
  }) => (
    <FormField
      control={control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {tooltip && <Info text={tooltip} />}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value as string}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <motion.section
      className='w-full max-w-4xl mx-auto bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-6 md:p-10 border'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className='space-y-3 text-center'>
        <h1 className='text-3xl md:text-5xl font-bold'>
          AI LinkedIn Post Generator
        </h1>
        <p className='text-sm md:text-base text-muted-foreground max-w-xl mx-auto'>
          Convert any topic into multiple LinkedIn-ready drafts with
          fine-grained control.
        </p>
      </div>

      <div className='h-8' />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-10'>
          {/* Topic + Audience */}
          <div className='flex flex-col md:flex-row gap-4'>
            <FormField
              control={control}
              name='topic'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>
                    Topic * <Info text='Core subject of your post.' />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. Cold-start strategies for marketplaces'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='audience'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>
                    Audience <Info text='Define who you want to reach.' />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. Founders, PMs, Job seekers'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Core Selectors */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
            {renderSelect({
              name: "tone",
              label: "Tone",
              items: PERSONAS,
              tooltip: "Pick a persona to set style.",
            })}
            {renderSelect({
              name: "length",
              label: "Post Length",
              items: LENGTHS,
              tooltip: "Controls detail level.",
            })}
            {renderSelect({
              name: "postCount",
              label: "Posts",
              items: POST_COUNTS,
              tooltip: "How many drafts to create.",
            })}
            {renderSelect({
              name: "language",
              label: "Language",
              items: LANGUAGES,
              tooltip: "Choose your writing language.",
            })}
          </div>

          {/* Toggles */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                name: "allowEmojis",
                label: "Use Emojis",
                desc: "Sprinkle relevant emojis.",
                tip: "Makes content more lively.",
              },
              {
                name: "includeLinks",
                label: "Include Links",
                desc: "Append helpful links.",
                tip: "Boosts credibility.",
              },
              {
                name: "addHashtags",
                label: "Add Hashtags",
                desc: "Auto-extract topic tags.",
                tip: "Improves discoverability.",
              },
              {
                name: "addCTA",
                label: "Add CTA",
                desc: "Prompt readers to engage.",
                tip: "Encourages comments & shares.",
              },
            ].map((opt) => (
              <FormField
                key={opt.name}
                control={control}
                name={opt.name as any}
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-xl border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel>
                        {opt.label} <Info text={opt.tip} />
                      </FormLabel>
                      <FormDescription>{opt.desc}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>

          {/* Advanced Settings */}
          <Accordion type='single' collapsible>
            <AccordionItem value='advanced'>
              <AccordionTrigger className='cursor-pointer'>
                ⚙️ Advanced Settings
              </AccordionTrigger>
              <AccordionContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Temperature */}
                  <FormField
                    control={control}
                    name='temperature'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Creativity{" "}
                          <Info text='Higher = more creative, lower = more consistent.' />
                        </FormLabel>
                        <FormControl>
                          <div className='px-2 py-3 rounded-xl border'>
                            <Slider
                              value={[field.value]}
                              min={0}
                              max={1}
                              step={0.05}
                              onValueChange={(v) => field.onChange(one(v))}
                            />
                            <p className='mt-2 text-xs text-muted-foreground'>
                              Current:{" "}
                              <span className='font-medium'>
                                {field.value.toFixed(2)}
                              </span>
                            </p>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Hashtag Limit */}
                  <FormField
                    control={control}
                    name='hashtagLimit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Hashtag Limit{" "}
                          <Info text='Max number of hashtags allowed.' />
                        </FormLabel>
                        <FormControl>
                          <div
                            className={`px-2 py-3 rounded-xl border ${
                              !addHashtags
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }`}
                          >
                            <Slider
                              value={[field.value]}
                              min={0}
                              max={10}
                              step={1}
                              onValueChange={(v) => field.onChange(one(v))}
                            />
                            <p className='mt-2 text-xs text-muted-foreground'>
                              Max hashtags:{" "}
                              <span className='font-medium'>{field.value}</span>
                            </p>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {renderSelect({
                    name: "ctaStyle",
                    label: "CTA Style",
                    items: CTA_STYLES,
                    tooltip: "Shape of your call-to-action.",
                  })}
                  {renderSelect({
                    name: "readingLevel",
                    label: "Reading Level",
                    items: READING_LEVELS,
                    tooltip: "Controls vocabulary complexity.",
                  })}

                  {/* Seed */}
                  <FormField
                    control={control}
                    name='seed'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Seed (optional){" "}
                          <Info text='Same seed → reproducible outputs.' />
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='e.g. 42'
                            value={field.value ?? ""}
                            onChange={(e) =>
                              setValue(
                                "seed",
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Examples */}
                  <FormField
                    control={control}
                    name='examples'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>
                          Examples{" "}
                          <Info text='Paste sample posts to mimic style.' />
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder='Paste sample posts to mimic tone/structure...'
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit */}
          <Button
            type='submit'
            className='w-full text-lg font-semibold'
            disabled={isSubmitting}
          >
            {isSubmitting ? "Generating…" : "Generate Posts 🚀"}
          </Button>
        </form>
      </Form>
    </motion.section>
  );
}
