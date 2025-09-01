"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormHandler } from "../hooks/useFormHandler";
import { SelectField } from "./SelectField";
import { ToggleItem } from "./ToggleItem";
import { AdvancedSettings } from "./AdvancedSettings";
import PostsOutput from "./PostsOutput";
import { PERSONAS, LENGTHS, POST_COUNTS, LANGUAGES } from "../lib/constants";
import { cn } from "../lib/utils";
import { InfoIcon } from "./InfoIcon";

// Lucide Icons
import {
  Sparkles,
  User,
  BookText,
  Languages,
  SlidersHorizontal,
  Smile,
  Link2,
  Hash,
  Megaphone,
  Rocket,
  CheckCircle,
  Circle,
} from "lucide-react";

const pastel = {
  lavender: "#c7ceea",
  mint: "#a8e6cf",
  gray: "#94a3b8",
  blue: "#a2d5f2",
};

// 🔒 Guard: normalize posts into safe string[]
function normalizePosts(posts: any): string[] {
  if (!posts) return [];
  if (Array.isArray(posts)) {
    return posts.filter((p) => typeof p === "string");
  }
  if (typeof posts === "object" && posts.output) {
    if (Array.isArray(posts.output)) {
      return posts.output.filter((p) => typeof p === "string");
    }
    return [String(posts.output)];
  }
  if (typeof posts === "string") return [posts];
  return [];
}

function GridWrapper({
  colsMobile = 1,
  colsSm,
  colsMd,
  colsLg,
  gap = 6,
  children,
}: {
  colsMobile?: number;
  colsSm?: number;
  colsMd?: number;
  colsLg?: number;
  gap?: number;
  children: React.ReactNode;
}) {
  let className = `grid grid-cols-${colsMobile} gap-${gap}`;
  if (colsSm) className += ` sm:grid-cols-${colsSm}`;
  if (colsMd) className += ` md:grid-cols-${colsMd}`;
  if (colsLg) className += ` lg:grid-cols-${colsLg}`;
  return <div className={className}>{children}</div>;
}

function InputFields({ fields, control }: any) {
  return (
    <GridWrapper colsMobile={1} colsSm={2} gap={4}>
      {fields.map(({ name, label, icon, placeholder, required, tooltip }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-medium flex items-center gap-2'>
                {icon}
                <span>{label}</span>
                {required && <span className='text-red-400'>*</span>}
                {tooltip && <InfoIcon text={tooltip} />}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={placeholder}
                  required={required}
                  {...field}
                  className='bg-slate-100 dark:bg-neutral-800 border-none'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </GridWrapper>
  );
}

function SelectFields({ fields, control }: any) {
  return (
    <GridWrapper colsMobile={2} colsMd={4} gap={4}>
      {fields.map(({ name, label, icon, items, tooltip }) => (
        <SelectField
          key={name}
          control={control}
          name={name}
          label={
            <span className='flex items-center gap-2'>
              {icon}
              <span>{label}</span>
              {tooltip && <InfoIcon text={tooltip} />}
            </span>
          }
          items={items}
        />
      ))}
    </GridWrapper>
  );
}

function ToggleFields({ fields, control }: any) {
  return (
    <GridWrapper colsMobile={2} colsSm={4} gap={4}>
      {fields.map(({ name, label, desc, icon, tooltip }) => (
        <ToggleItem
          key={name}
          control={control}
          name={name}
          label={
            <span className='flex items-center gap-2'>
              {icon}
              <span>{label}</span>
              {tooltip && <InfoIcon text={tooltip} />}
            </span>
          }
          desc={desc}
        />
      ))}
    </GridWrapper>
  );
}

export default function MainComponent(): React.JSX.Element {
  const { form, submitHandler, posts, meta, stepMessages } = useFormHandler();
  const { control, watch, setValue, formState } = form;
  const { isSubmitting, errors } = formState;

  const addHashtags = watch("addHashtags");
  const ariaStatusRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [statusMessage, setStatusMessage] = useState<React.ReactNode>("");

  const safePosts = normalizePosts(posts);

  useEffect(() => {
    if (isSubmitting) {
      if (stepMessages?.length > 0) {
        setStatusMessage(
          <div className='space-y-1 max-h-24 overflow-y-auto'>
            {stepMessages.map((msg, i) => (
              <p
                key={i}
                className='text-sm text-gray-700 dark:text-gray-300'
                aria-live='polite'
              >
                {msg}
              </p>
            ))}
          </div>
        );
      } else {
        setStatusMessage("Generating posts, please wait…");
      }
    } else if (posts?.length > 0) {
      setStatusMessage("Generation complete. Posts ready.");
    } else if (Object.keys(errors || {}).length > 0) {
      setStatusMessage("Correct errors in form and try again.");
    } else {
      setStatusMessage("");
    }
  }, [isSubmitting, posts, errors, stepMessages]);

  function setSeedValue(v?: number) {
    setValue("seed", v);
  }

  // Configs
  const inputFields = [
    {
      name: "topic",
      label: "Topic",
      icon: <BookText size={20} color={pastel.lavender} />,
      placeholder: "e.g. Cold-start strategies for marketplaces",
      required: true,
      tooltip: "Main subject or idea of your post.",
    },
    {
      name: "audience",
      label: "Audience",
      icon: <User size={20} color={pastel.gray} />,
      placeholder: "e.g. Founders, PMs, Job seekers",
      tooltip: "Target readers or viewers for your post.",
    },
  ];

  const selectFields = [
    {
      name: "tone",
      label: "Tone",
      icon: <SlidersHorizontal size={20} color={pastel.mint} />,
      items: PERSONAS,
      tooltip: "Style and feeling of your post's language.",
    },
    {
      name: "length",
      label: "Post Length",
      icon: <BookText size={20} color={pastel.lavender} />,
      items: LENGTHS,
      tooltip: "How long the generated posts should be.",
    },
    {
      name: "postCount",
      label: "Posts",
      icon: <CheckCircle size={20} color={pastel.blue} />,
      items: POST_COUNTS,
      tooltip: "Number of posts to create with each generation.",
    },
    {
      name: "language",
      label: "Language",
      icon: <Languages size={20} color={pastel.gray} />,
      items: LANGUAGES,
      tooltip: "Language used in generated posts.",
    },
  ];

  const toggleFields = [
    {
      name: "allowEmojis",
      label: "Use Emojis",
      icon: <Smile size={18} color={pastel.mint} />,
      desc: "Sprinkle relevant emojis.",
      tooltip: "Toggle adding emojis to posts.",
    },
    {
      name: "includeLinks",
      label: "Include Links",
      icon: <Link2 size={18} color={pastel.blue} />,
      desc: "Append helpful links.",
      tooltip: "Toggle appending external links.",
    },
    {
      name: "addHashtags",
      label: "Add Hashtags",
      icon: <Hash size={18} color={pastel.lavender} />,
      desc: "Auto-extract topic tags.",
      tooltip: "Toggle adding hashtags automatically.",
    },
    {
      name: "addCTA",
      label: "Add CTA",
      icon: <Megaphone size={18} color={pastel.gray} />,
      desc: "Prompt readers to engage.",
      tooltip: "Toggle adding a call-to-action.",
    },
  ];

  return (
    <MotionConfig reducedMotion='user'>
      <main className='min-h-screen p-2 sm:p-4 md:p-6'>
        <header className='max-w-4xl mx-auto mb-6 sm:mb-8 text-center'>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className='text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-2'
          >
            <Sparkles
              size={36}
              color={pastel.lavender}
              className='drop-shadow-sm'
            />
            AI LinkedIn Post Generator
          </motion.h1>
          <motion.div
            aria-live='polite'
            ref={ariaStatusRef}
            className='mt-3 min-h-[3rem] max-w-2xl mx-auto text-center'
          >
            {statusMessage}
          </motion.div>
        </header>

        <div className='flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto'>
          {/* Form */}
          <section className='order-2 lg:order-1 lg:col-span-2 mb-8 lg:mb-0'>
            <motion.div
              className={cn(
                "w-full bg-white/80 dark:bg-neutral-800/90 shadow-xl rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 dark:border-neutral-800"
              )}
              initial={
                shouldReduceMotion ? { opacity: 0.95 } : { opacity: 0, y: 20 }
              }
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.5 }}
              aria-label='Post generation form'
            >
              <Form {...form}>
                <form
                  onSubmit={submitHandler}
                  className='space-y-8'
                  aria-describedby='form-desc'
                >
                  <InputFields fields={inputFields} control={control} />
                  <SelectFields fields={selectFields} control={control} />
                  <ToggleFields fields={toggleFields} control={control} />
                  <AdvancedSettings
                    control={control}
                    addHashtags={addHashtags}
                    setSeedValue={setSeedValue}
                  />
                  <Button
                    type='submit'
                    variant='default'
                    size='lg'
                    className='w-full flex items-center justify-center gap-2'
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Circle
                          size={20}
                          className='animate-spin text-blue-500 dark:text-blue-400'
                        />
                        Generating…
                      </>
                    ) : (
                      <>
                        Generate Posts
                        <Rocket
                          size={20}
                          className='text-green-500 dark:text-green-400'
                        />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </section>

          {/* Output */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: safePosts.length > 0 ? 1 : 0.6, x: 0 }}
            transition={{ duration: 0.4 }}
            aria-label='Generated LinkedIn posts'
            className='order-1 lg:order-2 mb-8 lg:mb-0 lg:col-span-1'
          >
            {meta && (
              <div className='mb-4 rounded-lg px-4 py-2 bg-slate-100/70 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-200 flex items-center justify-between gap-3'>
                <div className='flex items-center gap-4'>
                  <span>
                    <BookText
                      size={16}
                      color={pastel.blue}
                      className='inline'
                    />{" "}
                    <strong>{meta.tokens ?? "—"}</strong> tokens
                  </span>
                  <span>
                    <CheckCircle
                      size={16}
                      color={pastel.mint}
                      className='inline'
                    />{" "}
                    <strong>
                      {meta.latencyMs
                        ? `${(meta.latencyMs / 1000).toFixed(2)}s`
                        : "—"}
                    </strong>
                  </span>
                  <span>
                    <User size={16} color={pastel.gray} className='inline' />{" "}
                    <strong>
                      {meta.costUSD !== undefined
                        ? `$${meta.costUSD.toFixed(4)}`
                        : "—"}
                    </strong>
                  </span>
                </div>
                <div className='text-xs text-muted-foreground'>
                  {meta.model ? `model: ${meta.model}` : null}
                </div>
              </div>
            )}
            {safePosts.length > 0 ? (
              <PostsOutput
                posts={posts} // ✅ normalized
                tokens={meta?.tokens}
                latency={meta?.latencyMs}
                cost={meta?.costUSD}
              />
            ) : (
              <div className='h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl w-full text-center text-muted-foreground p-8'>
                Your posts will appear here after generation.
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </MotionConfig>
  );
}
