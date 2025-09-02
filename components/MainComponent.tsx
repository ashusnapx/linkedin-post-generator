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
  const shouldReduceMotion = useReducedMotion();
  const [statusMessage, setStatusMessage] = useState<React.ReactNode>("");

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

  return (
    <MotionConfig reducedMotion='user'>
      <main className='min-h-screen p-2 sm:p-4 md:p-6'>
        <StatusHeader
          statusMessage={statusMessage}
          ariaStatusRef={ariaStatusRef}
        />

        <div className='flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto'>
          {/* Form Section */}
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

          {/* Output Section */}
          <PostsOutputWrapper posts={posts} meta={meta} />
        </div>
      </main>
    </MotionConfig>
  );
}
