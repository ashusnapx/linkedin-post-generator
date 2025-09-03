"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import Link from "next/link";

type NavItem = { label: string; href: string };

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "GitHub", href: "https://github.com/ashusnapx" },
];

const Navbar = (): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close on Esc and click outside when open; restore focus to toggle
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
        href='#main'
        className='sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z- focus:px-3 focus:py-2 focus:rounded-md focus:bg-indigo-600 focus:text-white'
      >
        Skip to main content
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
        className='fixed top-0 left-0 w-full z-50 border-b border-gray-200 dark:border-gray-800
                   bg-white/70 dark:bg-gray-900/70 backdrop-blur-md'
        role='navigation'
        aria-label='Primary'
      >
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link
              href='/'
              className='text-3xl font-bold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded'
            >
              <span className='bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent'>
                PostGen
                <sup className='bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent'>
                  ©
                </sup>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className='hidden md:flex items-center gap-6'>
              <ul className='flex items-center gap-6' aria-label='Primary'>
                {navItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className='text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded px-1 py-1'
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
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
                className='p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900'
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
          className='md:hidden bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 px-4 pb-4'
          role='region'
          aria-label='Mobile menu'
        >
          <ul className='flex flex-col gap-2 mt-3'>
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className='block rounded px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-300 dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.nav>
    </MotionConfig>
  );
};

export default Navbar;
