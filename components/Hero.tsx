"use client";
// components/Hero.tsx
/**
 * HERO SECTION
 *
 * The first thing users see. Must communicate:
 * 1. What this is (AI LinkedIn Post Generator)
 * 2. Why it's valuable (Free, uses your API key)
 * 3. What to do next (Connect API key or start generating)
 *
 * Design: Calm power, not flashy chaos
 */

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Key, ArrowDown, Zap, Shield, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { config } from "@/src/config";
import { useApiKey } from "@/src/context/ApiKeyContext";
import { ApiKeyModal } from "@/components/ApiKeyModal";

export function Hero() {
  const { isKeySet } = useApiKey();
  const [showKeyModal, setShowKeyModal] = React.useState(false);

  const features = [
    { icon: Infinity, text: "Unlimited generations" },
    { icon: Shield, text: "Your key, your control" },
    { icon: Zap, text: "Free forever" },
  ];

  return (
    <section className='relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16'>
      {/* Background gradient */}
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl' />
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl' />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='mb-6'
      >
        <span className='inline-flex items-center gap-2 px-4 py-2 bg-neutral-800/80 border border-neutral-700 rounded-full text-sm text-neutral-300'>
          <Sparkles className='w-4 h-4 text-yellow-400' />
          100% Free • Uses Your API Key
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl'
      >
        <span className='text-white'>Generate </span>
        <span className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
          LinkedIn Posts
        </span>
        <br />
        <span className='text-white'>That Actually Perform</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed'
      >
        {config.ui.brand.description}
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='flex flex-wrap justify-center gap-6 mt-8'
      >
        {features.map((feature, i) => (
          <div
            key={i}
            className='flex items-center gap-2 text-sm text-neutral-400'
          >
            <feature.icon className='w-4 h-4 text-green-400' />
            <span>{feature.text}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='mt-10 flex flex-col sm:flex-row gap-4'
      >
        {isKeySet ? (
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg'
            onClick={() => {
              document
                .getElementById("generator")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Start Generating
            <ArrowDown className='w-5 h-5 ml-2' />
          </Button>
        ) : (
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg'
            onClick={() => setShowKeyModal(true)}
          >
            <Key className='w-5 h-5 mr-2' />
            Connect Your API Key
          </Button>
        )}
      </motion.div>

      {/* Trust indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className='mt-8 text-xs text-neutral-600'
      >
        🔒 Your API key is stored only in your browser session
      </motion.p>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </section>
  );
}
