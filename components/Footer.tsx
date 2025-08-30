"use client";

import React from "react";
import { Github, Linkedin, Twitter, XIcon } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Demo", href: "#demo" },
    { label: "GitHub", href: "https://github.com/ashutosh" },
  ];

  const socials = [
    { icon: <Github size={18} />, href: "https://github.com/ashusnapx" },
    { icon: <Linkedin size={18} />, href: "https://linkedin.com/in/ashusnapx" },
    { icon: <Twitter size={18} />, href: "https://twitter.com/ashusnapx" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className='border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md'
    >
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Brand Section */}
          <div>
            <h2 className='text-xl font-bold tracking-tight'>
              <span className='bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent'>
                PostGen
              </span>
            </h2>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Generate LinkedIn-ready posts with AI. <br />
              Polished. Personalized. Instant.
            </p>
          </div>

          {/* Nav Links */}
          <div className='flex flex-col space-y-2'>
            <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Quick Links
            </h3>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className='text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors'
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Socials */}
          <div>
            <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Connect
            </h3>
            <div className='flex space-x-4 mt-2'>
              {socials.map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors'
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
          <span>
            © {new Date().getFullYear()} PostGen. All rights reserved.
          </span>
          <span className='mt-2 sm:mt-0'>Built with ❤️ by Ashutosh</span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
