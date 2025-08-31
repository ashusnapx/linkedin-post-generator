// components/MainComponent.tsx
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

export default function MainComponent(): React.JSX.Element {
  const { form, submitHandler, posts } = useFormHandler();
  const { control, watch, setValue, formState } = form;
  const { isSubmitting, errors } = formState;

  const addHashtags = watch("addHashtags");
  const ariaStatusRef = useRef<HTMLParagraphElement>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isSubmitting) setStatusMessage("Generating posts, please wait…");
    else if (posts.length > 0)
      setStatusMessage("Generation complete. Posts ready.");
    else if (Object.keys(errors || {}).length > 0)
      setStatusMessage("Correct errors in form and try again.");
    else setStatusMessage("");
  }, [isSubmitting, posts, errors]);

  function setSeedValue(v?: number) {
    setValue("seed", v);
  }

  return (
    <MotionConfig reducedMotion='user'>
      <main
        className='min-h-screen p-4 md:p-5'
        aria-label='Main content. AI LinkedIn Post Generator'
      >
        {/* Header */}
        <header className='max-w-4xl mx-auto mb-10 text-center'>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='text-4xl md:text-6xl font-extrabold tracking-tight'
          >
            AI LinkedIn Post Generator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto'
            id='form-desc'
          >
            Instantly craft LinkedIn drafts with precise control.
            <span className="italic ">
              <br />
              Polished, fast, and built for creators who care about quality.
            </span>
          </motion.p>
        </header>

        {/* Content grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto'>
          {/* Left column: form */}
          <section className='lg:col-span-2'>
            <p
              ref={ariaStatusRef}
              aria-live='polite'
              className='sr-only'
              tabIndex={-1}
            >
              {statusMessage}
            </p>

            <motion.div
              className={cn(
                "w-full bg-white dark:bg-neutral-900 shadow-xl rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-neutral-800"
              )}
              initial={
                shouldReduceMotion ? { opacity: 0.9 } : { opacity: 0, y: 30 }
              }
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={{ duration: shouldReduceMotion ? 0.25 : 0.6 }}
              aria-label='Post generation form'
            >
              <Form {...form}>
                <form
                  onSubmit={submitHandler}
                  className='space-y-12'
                  aria-describedby='form-desc'
                >
                  {/* Topic + Audience */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={control}
                      name='topic'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-base font-medium'>
                            Topic <span className='text-red-500'>*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g. Cold-start strategies for marketplaces'
                              required
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
                        <FormItem>
                          <FormLabel className='text-base font-medium'>
                            Audience
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
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                    <SelectField
                      control={control}
                      name='tone'
                      label='Tone'
                      items={PERSONAS}
                    />
                    <SelectField
                      control={control}
                      name='length'
                      label='Post Length'
                      items={LENGTHS}
                    />
                    <SelectField
                      control={control}
                      name='postCount'
                      label='Posts'
                      items={POST_COUNTS}
                    />
                    <SelectField
                      control={control}
                      name='language'
                      label='Language'
                      items={LANGUAGES}
                    />
                  </div>

                  {/* Toggles */}
                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
                    <ToggleItem
                      control={control}
                      name='allowEmojis'
                      label='Use Emojis'
                      desc='Sprinkle relevant emojis.'
                    />
                    <ToggleItem
                      control={control}
                      name='includeLinks'
                      label='Include Links'
                      desc='Append helpful links.'
                    />
                    <ToggleItem
                      control={control}
                      name='addHashtags'
                      label='Add Hashtags'
                      desc='Auto-extract topic tags.'
                    />
                    <ToggleItem
                      control={control}
                      name='addCTA'
                      label='Add CTA'
                      desc='Prompt readers to engage.'
                    />
                  </div>

                  {/* Advanced Settings */}
                  <AdvancedSettings
                    control={control}
                    addHashtags={addHashtags}
                    setSeedValue={setSeedValue}
                  />

                  {/* Submit */}
                  <Button
                    type='submit'
                    className='w-full text-lg font-semibold py-6 rounded-xl'
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Generating…"
                    ) : (
                      <>
                        Generate Posts
                        <span aria-hidden='true' role='img' className='ml-2'>
                          🚀
                        </span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </section>

          {/* Right column: results */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: posts.length > 0 ? 1 : 0.5, x: 0 }}
            transition={{ duration: 0.4 }}
            aria-label='Generated LinkedIn posts'
            className='lg:col-span-1'
          >
            {posts.length > 0 ? (
              <PostsOutput posts={posts} />
            ) : (
              <div className='h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl  w-full text-center text-muted-foreground'>
                Your posts will appear here after generation.
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </MotionConfig>
  );
}
