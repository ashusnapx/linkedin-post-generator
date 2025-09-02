import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.3,
      ease: "easeOut",
      duration: 0.6,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } },
};

export function StatusHeader({
  statusMessage,
  ariaStatusRef,
}: {
  statusMessage: React.ReactNode;
  ariaStatusRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <header
      role='banner'
      className='max-w-5xl mx-auto px-6 text-center select-none rounded-xl 
                 bg-gray-50 dark:bg-transparent transition-colors duration-300'
    >
      <motion.div
        className='flex flex-col items-center gap-4'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Heading */}
        <motion.div variants={itemVariants}>
          <div
            className='inline-flex items-center gap-3'
            aria-label='Sparkles icon decorating AI LinkedIn Post Generator heading'
          >
            <Sparkles
              size={48}
              className='drop-shadow-lg text-purple-400 dark:text-pink-400'
              aria-hidden='true'
              focusable='false'
              style={{
                filter:
                  "drop-shadow(0 0 4px rgba(162,155,254,0.5)) drop-shadow(0 0 8px rgba(255,107,156,0.3))",
              }}
            />
            <h1
              tabIndex={-1}
              className='font-extrabold text-4xl md:text-5xl lg:text-6xl 
                         text-gray-900 dark:text-gray-100 leading-tight'
            >
              AI LinkedIn Post Generator
            </h1>
          </div>
        </motion.div>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className='max-w-xl text-base md:text-lg font-medium 
                     text-gray-600 dark:text-gray-300 leading-relaxed'
          aria-label='Brief description of the AI LinkedIn post generator tool'
        >
          Create engaging, personalized LinkedIn posts effortlessly with
          AI-powered creativity — amplify your professional presence and save
          time.
        </motion.p>

        {/* Status Message */}
        <motion.div
          role='status'
          aria-live='polite'
          aria-atomic='true'
          ref={ariaStatusRef}
          variants={itemVariants}
          className='mt-6 min-h-[44px] max-w-lg font-semibold text-purple-500 dark:text-pink-400'
        >
          {statusMessage}
        </motion.div>
      </motion.div>
    </header>
  );
}
