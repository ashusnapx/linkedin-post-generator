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

/**
 * Wraps output display with metadata and generated posts.
 */
export function PostsOutputWrapper({ posts, meta }: any) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: posts.length > 0 ? 1 : 0.6, x: 0 }}
      transition={{ duration: 0.4 }}
      aria-label='Generated LinkedIn posts'
      className='order-1 lg:order-2 mb-8 lg:mb-0 lg:col-span-1'
    >
      {meta && (
        <div className='mb-4 rounded-lg px-4 py-2 bg-slate-100/70 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-200 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-4'>
            <span>
              <BookText size={16} color={pastel.blue} className='inline' />{" "}
              <strong>{meta.tokens ?? "—"}</strong> tokens
            </span>
            <span>
              <CheckCircle size={16} color={pastel.mint} className='inline' />{" "}
              <strong>
                {meta.latencyMs
                  ? `${(meta.latencyMs / 1000).toFixed(2)}s`
                  : "—"}
              </strong>
            </span>
            <span>
              <User size={16} color={pastel.gray} className='inline' />{" "}
              <strong>
                {meta.costUSD !== undefined
                  ? `$${meta.costUSD.toFixed(4)}`
                  : "—"}
              </strong>
            </span>
          </div>
          <div className='text-xs text-muted-foreground'>
            {meta.model ? `model: ${meta.model}` : null}
          </div>
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
        <div className='h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl w-full text-center text-muted-foreground p-8'>
          Your posts will appear here after generation.
        </div>
      )}
    </motion.section>
  );
}
