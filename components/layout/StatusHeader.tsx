import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const pastel = { lavender: "#c7ceea" };

/**
 * Header and status display for the generator page.
 */
export function StatusHeader({
  statusMessage,
  ariaStatusRef,
}: {
  statusMessage: React.ReactNode;
  ariaStatusRef: React.RefObject<HTMLDivElement>;
}) {
  return (
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
  );
}
