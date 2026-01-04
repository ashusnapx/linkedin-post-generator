"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Post } from "./types";
import { toast } from "sonner";

interface PostDetailsDialogProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostDetailsDialog({
  post,
  onClose,
}: PostDetailsDialogProps) {
  const handleCopy = async () => {
    if (post) {
      try {
        await navigator.clipboard.writeText(post.content);
        toast.success("Copied successfully ✅"); // ✅ success toast
      } catch {
        toast.error("Failed to copy ❌"); // fallback error toast
      }
    }
  };

  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader className='flex justify-between items-center'>
          <DialogTitle>Post Details</DialogTitle>

          {post && (
            <Button
              size='sm'
              variant='outline'
              onClick={handleCopy}
              aria-label='Copy entire post content'
              className='ml-4 flex items-center gap-2 hover:cursor-pointer'
            >
              <Copy className='w-4 h-4' aria-hidden='true' />
              Copy
            </Button>
          )}
        </DialogHeader>

        {post && (
          <div className='space-y-6 prose dark:prose-invert'>
            {/* Content */}
            <ReactMarkdown>{post.content}</ReactMarkdown>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {post.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className='px-3 py-1 text-xs rounded-full bg-slate-200 dark:bg-neutral-700 select-text'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            {post.cta && (
              <div className='pt-2 text-sm italic text-gray-600 dark:text-gray-300 select-text'>
                {post.cta}
              </div>
            )}

            {/* Citations */}
            {post.citations && post.citations.length > 0 && (
              <details className='mt-4'>
                <summary className='cursor-pointer text-sm text-blue-600 dark:text-blue-400'>
                  References
                </summary>
                <ul className='mt-2 space-y-1 text-xs list-inside list-decimal'>
                  {post.citations.map((citation, i) => (
                    <li key={i}>
                      [{i + 1}]{" "}
                      <a
                        href={citation.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline hover:text-blue-800 dark:hover:text-blue-300'
                      >
                        {citation.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Flags */}
            {(post.flags?.profanity || post.flags?.riskyClaims?.length) && (
              <div className='flex flex-wrap gap-2 mt-4'>
                {post.flags.profanity && (
                  <span className='px-3 py-1 text-xs rounded-md bg-red-200 text-red-800 select-none'>
                    ⚠️ Profanity detected
                  </span>
                )}
                {post.flags.riskyClaims?.map((claim, i) => (
                  <span
                    key={i}
                    className='px-3 py-1 text-xs rounded-md bg-yellow-200 text-yellow-800 select-none'
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
