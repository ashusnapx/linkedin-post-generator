"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Post } from "./types";

interface PostDetailsDialogProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostDetailsDialog({
  post,
  onClose,
}: PostDetailsDialogProps) {
  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>
        {post && (
          <div className='space-y-4'>
            {/* Content */}
            <ReactMarkdown>{post.content}</ReactMarkdown>

            {/* Hashtags */}
            {post.hashtags?.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {post.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className='px-2 py-1 text-xs rounded-full bg-slate-200 dark:bg-neutral-700'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            {post.cta && (
              <div className='pt-2 text-sm italic text-gray-600 dark:text-gray-300'>
                {post.cta}
              </div>
            )}

            {/* Citations */}
            {post.citations?.length > 0 && (
              <details className='mt-2'>
                <summary className='cursor-pointer text-sm text-blue-600'>
                  References
                </summary>
                <ul className='mt-1 space-y-1 text-xs'>
                  {post.citations.map((c, i) => (
                    <li key={i}>
                      [{i + 1}]{" "}
                      <a
                        href={c.url}
                        target='_blank'
                        rel='noreferrer'
                        className='underline'
                      >
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Flags */}
            {(post.flags?.profanity || post.flags?.riskyClaims?.length) && (
              <div className='flex flex-wrap gap-2 mt-3'>
                {post.flags.profanity && (
                  <span className='px-2 py-1 text-xs rounded-md bg-red-200 text-red-800'>
                    ⚠️ Profanity detected
                  </span>
                )}
                {post.flags.riskyClaims?.map((claim, i) => (
                  <span
                    key={i}
                    className='px-2 py-1 text-xs rounded-md bg-yellow-200 text-yellow-800'
                  >
                    Risky claim: {claim}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
