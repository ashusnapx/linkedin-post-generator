import React from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  Variants,
} from "framer-motion";

/* Accessible motion defaults: respect OS setting */
const baseTransition = { ease: [0.16, 1, 0.3, 1] as never, duration: 0.5 };

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (prefersReduced: boolean) => ({
    opacity: 1,
    y: prefersReduced ? 0 : 0,
    transition: { ...baseTransition, duration: 0.6, staggerChildren: 0.2 },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (prefersReduced: boolean) => ({
    opacity: 1,
    y: prefersReduced ? 0 : 0,
    transition: baseTransition,
  }),
};

export function StatusHeader({
  statusMessage,
  ariaStatusRef,
}: {
  statusMessage: React.ReactNode;
  ariaStatusRef: React.RefObject<HTMLDivElement>;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion='user'>
      <header
        role='banner'
        className='relative overflow-hidden max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center rounded-2xl max-h-78 md:max-h-66
               bg-white/70 dark:bg-white/5 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10
               transition-colors duration-300 mb-10'
        aria-label='AI LinkedIn Post Generator header'
      >
        {/* Animated backdrop gradient */}
        <svg
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 w-full h-full opacity-60 blur-2xl'
          viewBox='0 0 200 200'
          preserveAspectRatio='none'
        >
          <defs>
            <radialGradient id='g1' cx='30%' cy='50%'>
              <motion.stop
                offset='40%'
                stopColor='#a29bfe'
                animate={{
                  stopColor: ["#a29bfe", "#6c5ce7", "#81ecec", "#a29bfe"],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              />
              <motion.stop
                offset='100%'
                stopColor='#ff6b9c'
                animate={{
                  stopColor: ["#ff6b9c", "#fd79a8", "#ffeaa7", "#ff6b9c"],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </radialGradient>
          </defs>
          <rect width='100%' height='100%' fill='url(#g1)' />
        </svg>

        <motion.div
          className='relative flex flex-col items-center gap-4 sm:gap-5'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          custom={!!prefersReducedMotion}
        >
          {/* Heading row */}
          <motion.div variants={itemVariants} custom={!!prefersReducedMotion}>
            <div className='inline-flex items-center gap-3'>
              <h1
                className='font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight
                       text-gray-900 dark:text-gray-100 leading-relaxed'
              >
                PostGen : AI LinkedIn Post Generator
              </h1>
            </div>
          </motion.div>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            custom={!!prefersReducedMotion}
            className='max-w-prose text-sm sm:text-base md:text-lg font-medium
                   text-gray-600 dark:text-gray-300 leading-relaxed px-2'
          >
            Create engaging, personalized LinkedIn posts with AI—plan, style,
            and publish faster while keeping quality high.
          </motion.p>

          {/* Status live region */}
          <motion.div
            role='status'
            aria-live='polite'
            aria-atomic='true'
            ref={ariaStatusRef}
            variants={itemVariants}
            custom={!!prefersReducedMotion}
            className='mt-4 min-h-[44px] max-w-xl font-semibold
                   text-purple-600 dark:text-pink-400 text-sm sm:text-base'
          >
            {statusMessage}
          </motion.div>
        </motion.div>
      </header>
    </MotionConfig>
  );
}
