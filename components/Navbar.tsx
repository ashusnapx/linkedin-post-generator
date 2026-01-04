"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Menu, X, Key, Check, ExternalLink } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/src/context/ApiKeyContext";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { config } from "@/src/config";
import Link from "next/link";

const Navbar = (): React.JSX.Element => {
  const { isKeySet, clearApiKey } = useApiKey();
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close on Esc and click outside when open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        btnRef.current?.focus();
      }
    }
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (
        isOpen &&
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [isOpen]);

  const navId = "primary-navigation";

  return (
    <MotionConfig reducedMotion='user'>
      {/* Skip link */}
      <a
        href='#generator'
        className='sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-indigo-600 focus:text-white'
      >
        Skip to generator
      </a>

      <motion.nav
        initial={
          shouldReduceMotion ? { opacity: 0.98 } : { y: -40, opacity: 0 }
        }
        animate={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.5,
          ease: "easeOut",
        }}
        className='fixed top-0 left-0 w-full z-50 border-b border-neutral-800
                   bg-neutral-950/80 backdrop-blur-xl'
        role='navigation'
        aria-label='Primary'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link
              href='/'
              className='text-2xl font-bold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded'
            >
              <span className='bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
                {config.ui.brand.name}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className='hidden md:flex items-center gap-4'>
              {/* API Key Status */}
              {isKeySet ? (
                <div className='flex items-center gap-2'>
                  <span className='flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400'>
                    <Check className='w-3.5 h-3.5' />
                    API Connected
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearApiKey}
                    className='text-xs text-neutral-500 hover:text-neutral-300'
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowKeyModal(true)}
                  className='border-neutral-700 hover:border-blue-500 text-neutral-300'
                >
                  <Key className='w-4 h-4 mr-2' />
                  Connect API Key
                </Button>
              )}

              <a
                href={config.social.github}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors'
              >
                GitHub
                <ExternalLink className='w-3.5 h-3.5' />
              </a>

              <ModeToggle />
            </div>

            {/* Mobile Hamburger */}
            <div className='md:hidden flex items-center gap-3'>
              <ModeToggle />
              <button
                ref={btnRef}
                type='button'
                aria-controls={navId}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                onClick={() => setIsOpen((v) => !v)}
                className='p-2 rounded-md text-neutral-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          ref={menuRef}
          id={navId}
          initial={false}
          animate={
            isOpen
              ? shouldReduceMotion
                ? { opacity: 1 }
                : { height: "auto", opacity: 1 }
              : shouldReduceMotion
              ? { opacity: 0, transitionEnd: { display: "none" } }
              : { height: 0, opacity: 0 }
          }
          transition={{
            duration: shouldReduceMotion ? 0.15 : 0.3,
            ease: "easeOut",
          }}
          className='md:hidden bg-neutral-950/95 border-t border-neutral-800 px-4 pb-4 overflow-hidden'
          role='region'
          aria-label='Mobile menu'
        >
          <div className='flex flex-col gap-3 mt-4'>
            {/* API Key Status Mobile */}
            {isKeySet ? (
              <div className='flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg'>
                <span className='flex items-center gap-2 text-sm text-green-400'>
                  <Check className='w-4 h-4' />
                  API Connected
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    clearApiKey();
                    setIsOpen(false);
                  }}
                  className='text-xs text-neutral-500'
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant='outline'
                onClick={() => {
                  setShowKeyModal(true);
                  setIsOpen(false);
                }}
                className='w-full border-neutral-700'
              >
                <Key className='w-4 h-4 mr-2' />
                Connect API Key
              </Button>
            )}

            <a
              href={config.social.github}
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-2 p-3 text-sm text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800'
            >
              GitHub
              <ExternalLink className='w-4 h-4' />
            </a>
          </div>
        </motion.div>
      </motion.nav>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </MotionConfig>
  );
};

export default Navbar;
