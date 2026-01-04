"use client";
// components/ApiKeyModal.tsx
/**
 * API KEY ONBOARDING MODAL
 *
 * Beautiful, trust-building modal that guides users to:
 * 1. Understand why they need an API key
 * 2. Get their key from Google AI Studio
 * 3. Paste and validate the key
 *
 * Design: Calm, clear, no friction
 */

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  ExternalLink,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKey } from "@/src/context/ApiKeyContext";
import { config } from "@/src/config";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { setApiKey, validateKey, isValidating } = useApiKey();
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyInput.trim()) {
      setError("Please enter your API key");
      return;
    }

    const valid = await validateKey(keyInput.trim());
    if (valid) {
      setIsValid(true);
      setApiKey(keyInput.trim());
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } else {
      setError("Invalid API key. Please check your key and try again.");
    }
  };

  const benefits = [
    { icon: Sparkles, text: "Unlimited generations", color: "text-purple-400" },
    { icon: Shield, text: "Your key, your control", color: "text-green-400" },
    { icon: Zap, text: "Free forever", color: "text-yellow-400" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className='absolute inset-0 bg-black/80 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className='relative z-10 w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden'
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className='p-6 pb-0'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg'>
                  <Key className='w-5 h-5 text-white' />
                </div>
                <h2 className='text-xl font-semibold text-white'>
                  Connect Your API Key
                </h2>
              </div>
              <p className='text-neutral-400 text-sm leading-relaxed'>
                PostGen uses your own Gemini API key to keep the service{" "}
                <span className='text-green-400 font-medium'>100% free</span>.
                Your key is stored only in your browser session.
              </p>
            </div>

            {/* Benefits */}
            <div className='px-6 py-4'>
              <div className='flex gap-4'>
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    className='flex-1 flex flex-col items-center gap-2 p-3 bg-neutral-800/50 rounded-lg'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    <span className='text-xs text-neutral-300 text-center'>
                      {benefit.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='p-6 pt-2 space-y-4'>
              {/* Step 1: Get Key */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-neutral-300'>
                  Step 1: Get your free API key
                </label>
                <a
                  href={config.apiKey.getKeyUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors group'
                >
                  <img
                    src='https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg'
                    alt='Gemini'
                    className='w-5 h-5'
                  />
                  <span className='text-sm text-neutral-200 group-hover:text-white'>
                    Google AI Studio
                  </span>
                  <ExternalLink className='w-4 h-4 text-neutral-500 ml-auto' />
                </a>
              </div>

              {/* Step 2: Paste Key */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-neutral-300'>
                  Step 2: Paste your API key
                </label>
                <div className='relative'>
                  <Input
                    type='password'
                    value={keyInput}
                    onChange={(e) => {
                      setKeyInput(e.target.value);
                      setError(null);
                      setIsValid(false);
                    }}
                    placeholder='Paste your API key here...'
                    className='bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 pr-10'
                    disabled={isValidating || isValid}
                  />
                  {isValid && (
                    <motion.div
                      className='absolute right-3 top-1/2 -translate-y-1/2'
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className='w-5 h-5 text-green-400' />
                    </motion.div>
                  )}
                </div>
                {error && (
                  <motion.p
                    className='text-sm text-red-400 flex items-center gap-1'
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className='w-4 h-4' />
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Submit */}
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium'
                disabled={isValidating || isValid || !keyInput.trim()}
              >
                {isValidating ? (
                  "Validating..."
                ) : isValid ? (
                  <>
                    <Check className='w-4 h-4 mr-2' />
                    Connected!
                  </>
                ) : (
                  "Connect API Key"
                )}
              </Button>

              {/* Security note */}
              <p className='text-xs text-neutral-500 text-center'>
                🔒 Your key is stored only in this browser session and never
                sent to our servers.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
