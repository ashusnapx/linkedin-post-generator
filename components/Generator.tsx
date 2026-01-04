"use client";
// components/Generator.tsx
/**
 * GENERATOR SECTION
 *
 * The core product experience. Clean, focused, no distractions.
 *
 * Layout:
 * - Left: Form inputs (progressive disclosure)
 * - Right: Generated posts output
 *
 * Design: Functional clarity, not feature overload
 */

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Circle, Rocket, Key } from "lucide-react";
import { InputFields } from "@/components/forms/InputFields";
import { SelectFields } from "@/components/forms/SelectFields";
import { ToggleFields } from "@/components/forms/ToggleFields";
import { AdvancedSettings } from "@/components/AdvancedSettings";
import {
  inputFields,
  selectFields,
  toggleFields,
} from "@/components/forms/fieldConfig";
import { PostsOutputWrapper } from "@/components/layout/PostsOutputWrapper";
import { useFormHandler } from "@/src/hooks/useFormHandler";
import { useApiKey } from "@/src/context/ApiKeyContext";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { cn } from "@/lib/utils";

export function Generator() {
  const { form, submitHandler, posts, meta, isKeySet } = useFormHandler();
  const {} = useApiKey();
  const { control, watch, setValue, formState } = form;
  const { isSubmitting } = formState;

  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const addHashtags = watch("addHashtags");

  function setSeedValue(v?: number) {
    setValue("seed", v);
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (!isKeySet) {
      e.preventDefault();
      setShowKeyModal(true);
      return;
    }
    submitHandler(e);
  };

  return (
    <section id='generator' className='py-16'>
      <div className='max-w-7xl mx-auto'>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
            Create Your Post
          </h2>
          <p className='text-neutral-400 max-w-xl mx-auto'>
            Enter a topic, customize your settings, and generate multiple
            LinkedIn-ready posts in seconds.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className='grid lg:grid-cols-5 gap-8'>
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className='lg:col-span-2'
          >
            <div
              className={cn(
                "bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6",
                "shadow-xl shadow-black/20"
              )}
            >
              <Form {...form}>
                <form onSubmit={handleSubmit} className='space-y-6'>
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
                    className={cn(
                      "w-full h-14 text-lg font-bold tracking-wide transition-all duration-300",
                      "bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-[length:200%_auto] animate-gradient",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
                      "rounded-xl border border-white/10",
                      "flex items-center justify-center gap-3"
                    )}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {!isKeySet ? (
                      <>
                        <Key className='w-5 h-5' />
                        Connect API Key to Generate
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Circle className='w-5 h-5 animate-spin' />
                        Generating…
                      </>
                    ) : (
                      <>
                        Generate Posts
                        <Rocket className='w-5 h-5' />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>

          {/* Right: Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className='lg:col-span-3'
          >
            <PostsOutputWrapper posts={posts} meta={meta} />
          </motion.div>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </section>
  );
}
