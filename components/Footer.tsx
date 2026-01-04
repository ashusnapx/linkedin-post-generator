"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { HEALTH_COLORS, HEALTH_TEXT, FOOTER_BORDER, FOOTER_BG, GRADIENT_TEXT, FOOTER_TEXT, NAV_ITEMS, SOCIAL_LINKS } from "@/src/config/constants";

type Health = "loading" | "ok" | "error";

const Footer = (): React.JSX.Element => {
  const [health, setHealth] = useState<Health>("loading");
  const shouldReduceMotion = useReducedMotion();
  const year = new Date().getFullYear();

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!mounted) return;
        setHealth(res.ok ? "ok" : "error");
      } catch {
        if (!mounted) return;
        setHealth("error");
      }
    };
    checkHealth();
    return () => {
      mounted = false;
    };
  }, []);

  const healthConfig = useMemo(
    () => ({ color: HEALTH_COLORS[health], text: HEALTH_TEXT[health] }),
    [health]
  );

  return (
    <MotionConfig reducedMotion='user'>
      <motion.footer
        role='contentinfo'
        initial={shouldReduceMotion ? { opacity: 0.98 } : { opacity: 0, y: 20 }}
        whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.6,
          ease: "easeOut",
        }}
        className={`${FOOTER_BORDER} ${FOOTER_BG}`}
        aria-label='Site footer'
      >
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Brand */}
            <section aria-labelledby='footer-brand'>
              <h2
                id='footer-brand'
                className='text-xl font-bold tracking-tight'
              >
                <span className={GRADIENT_TEXT}>
                  PostGen
                  <sup className={GRADIENT_TEXT}>©</sup>
                </span>
              </h2>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                {FOOTER_TEXT.description}
              </p>
            </section>

            {/* Nav */}
            <nav aria-labelledby='footer-quick-links'>
              <h2
                id='footer-quick-links'
                className='text-sm font-semibold text-gray-700 dark:text-gray-300'
              >
                Quick Links
              </h2>
              <ul className='mt-2 space-y-2'>
                {NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className='text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded px-1 py-1'
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Socials + Health */}
            <section aria-labelledby='footer-connect'>
              <h2
                id='footer-connect'
                className='text-sm font-semibold text-gray-700 dark:text-gray-300'
              >
                Connect
              </h2>
              <ul className='flex gap-3 mt-2' aria-label='Social links'>
                {SOCIAL_LINKS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.name}>
                      <a
                        href={s.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`${s.name} (opens in new tab)`}
                        className='inline-flex items-center justify-center p-2 rounded-lg bg-gray-200/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900'
                      >
                        <Icon size={18} aria-hidden='true' />
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div
                className='mt-4 text-sm flex items-center gap-2'
                aria-live='polite'
              >
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${healthConfig.color}`}
                  aria-hidden='true'
                />
                <span>{healthConfig.text}</span>
              </div>
            </section>
          </div>

          {/* Footer bottom */}
          <div className='border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
            <span>
              © {year} PostGen. {FOOTER_TEXT.copyright}
            </span>
            <span className='mt-2 sm:mt-0'>{FOOTER_TEXT.builtBy}</span>
          </div>
        </div>
      </motion.footer>
    </MotionConfig>
  );
};

export default Footer;
