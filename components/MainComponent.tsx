"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Circle, Rocket } from "lucide-react";
import { InputFields } from "./forms/InputFields";
import { SelectFields } from "./forms/SelectFields";
import { ToggleFields } from "./forms/ToggleFields";
import { AdvancedSettings } from "./AdvancedSettings";
import { inputFields, selectFields, toggleFields } from "./forms/fieldConfig";
import { StatusHeader } from "./layout/StatusHeader";
import { useFormHandler } from "@/src/hooks/useFormHandler";
import { PostsOutputWrapper } from "./layout/PostsOutputWrapper";
import { cn } from "@/lib/utils";

export default function MainComponent(): React.JSX.Element {
  const { form, submitHandler, posts, meta, stepMessages } = useFormHandler();
  const { control, watch, setValue, formState } = form;
  const { isSubmitting, errors } = formState;

  const addHashtags = watch("addHashtags");
  const ariaStatusRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [statusMessage, setStatusMessage] = useState<React.ReactNode>("");

  // Announce progress + completion politely
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

  // Assertive announcement for first error (prevents missing critical feedback)
  useEffect(() => {
    const keys = Object.keys(errors || {});
    if (keys.length > 0 && assertiveRef.current) {
      const firstKey = keys;
      const err = (errors as Record<string, { message?: string }>)[firstKey];
      const msg = err?.message || `There is an error in ${firstKey}.`;
      assertiveRef.current.textContent = msg;
    } else if (assertiveRef.current) {
      assertiveRef.current.textContent = "";
    }
  }, [errors]);

  function setSeedValue(v?: number) {
    setValue("seed", v);
  }

  return (
    <MotionConfig reducedMotion='user'>
      <main
        role='main'
        className='min-h-screen p-3 sm:p-4 md:p-6'
        aria-label='AI LinkedIn Post Generator main content'
      >
        {/* Decorative background SVGs (hidden from AT) */}
        {/* <svg
          aria-hidden='true'
          className='pointer-events-none fixed -z-10 top-[-10%] right-[-10%] h-64 w-64 sm:h-96 sm:w-96 opacity-40 blur-2xl'
        >
          <defs>
            <radialGradient id='gradA' cx='50%' cy='50%'>
              <stop offset='0%' stopColor='#a29bfe' />
              <stop offset='100%' stopColor='#ff6b9c' />
            </radialGradient>
          </defs>
          <circle cx='50%' cy='50%' r='50%' fill='url(#gradA)' />
        </svg> */}

        {/* Header with polite live region inside */}
        <StatusHeader
          statusMessage={statusMessage}
          ariaStatusRef={ariaStatusRef}
        />

        {/* Offscreen assertive live region for errors */}
        <div ref={assertiveRef} aria-live='assertive' className='sr-only' />

        <div className='flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto'>
          {/* Form Section */}
          <section
            className='order-2 lg:order-1 lg:col-span-2 mb-8 lg:mb-0'
            aria-labelledby='form-title'
          >
            <h2 id='form-title' className='sr-only'>
              Post generation form
            </h2>

            <motion.div
              className={cn(
                "w-full bg-white/80 dark:bg-neutral-800/90 shadow-xl rounded-3xl p-5 sm:p-7 md:p-10",
                "border border-gray-200 dark:border-neutral-800"
              )}
              initial={
                shouldReduceMotion ? { opacity: 0.98 } : { opacity: 0, y: 16 }
              }
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.5 }}
              aria-describedby='form-desc'
            >
              <p id='form-desc' className='sr-only'>
                Enter topic and optional settings, then generate at least three
                LinkedIn posts.
              </p>

              <Form {...form}>
                <form onSubmit={submitHandler} className='space-y-8'>
                  {/* Ensure inner fields set aria-invalid and aria-errormessage on error */}
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
                    className='w-full h-12 sm:h-12 md:h-14 text-base sm:text-base md:text-lg flex items-center justify-center gap-2'
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

          {/* Output Section */}
          <PostsOutputWrapper posts={posts} meta={meta} />
        </div>
      </main>
    </MotionConfig>
  );
}
