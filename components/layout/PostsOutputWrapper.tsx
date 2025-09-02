import React from "react";
import { motion } from "framer-motion";
import { BookText, CheckCircle, User } from "lucide-react";
import PostsOutput from "../PostsOutput";

const pastel = {
  lavender: "#c7ceea",
  mint: "#a8e6cf",
  gray: "#94a3b8",
  blue: "#a2d5f2",
};

interface MetaData {
  tokens?: number;
  latencyMs?: number;
  costUSD?: number;
  model?: string;
}

interface PostsOutputWrapperProps {
  posts: any[]; // Replace `any` with specific post type if known
  meta?: MetaData;
}

/**
 * Wraps output display with metadata and generated posts.
 */
export function PostsOutputWrapper({ posts, meta }: PostsOutputWrapperProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: posts.length > 0 ? 1 : 0.6, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-label='Generated LinkedIn posts'
      className='order-1 lg:order-2 mb-8 lg:mb-0 lg:col-span-1'
    >
      {meta && (
        <div
          className='
            mb-4 rounded-lg px-5 py-3 bg-slate-100/80 dark:bg-neutral-800/80
            border border-gray-200 dark:border-neutral-700
            text-sm text-gray-700 dark:text-gray-200 
            flex flex-wrap items-center justify-between gap-4'
          role='region'
          aria-live='polite'
          aria-atomic='true'
        >
          <div className='flex flex-wrap items-center gap-6'>
            <span className='inline-flex items-center gap-1'>
              <BookText size={18} color={pastel.blue} aria-hidden='true' />
              <strong>{meta.tokens ?? "—"}</strong> tokens
            </span>
            <span className='inline-flex items-center gap-1'>
              <CheckCircle size={18} color={pastel.mint} aria-hidden='true' />
              <strong>
                {meta.latencyMs !== undefined
                  ? `${(meta.latencyMs / 1000).toFixed(2)}s`
                  : "—"}
              </strong>
            </span>
            <span className='inline-flex items-center gap-1'>
              <User size={18} color={pastel.gray} aria-hidden='true' />
              <strong>
                {meta.costUSD !== undefined
                  ? `$${meta.costUSD.toFixed(4)}`
                  : "—"}
              </strong>
            </span>
          </div>
          {meta.model && (
            <div className='text-xs text-muted-foreground whitespace-nowrap'>
              model: <span className='font-semibold'>{meta.model}</span>
            </div>
          )}
        </div>
      )}

      {posts.length > 0 ? (
        <PostsOutput
          posts={posts}
          tokens={meta?.tokens}
          latency={meta?.latencyMs}
          cost={meta?.costUSD}
        />
      ) : (
        <div
          className='
            h-full flex items-center justify-center
            border-2 border-dashed border-gray-300 dark:border-neutral-700
            rounded-2xl w-full text-center text-muted-foreground p-8
            font-medium text-gray-500 dark:text-gray-400'
        >
          Your posts will appear here after generation.
        </div>
      )}
    </motion.section>
  );
}
