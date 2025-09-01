"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Citation {
  label: string;
  url: string;
}

interface Flags {
  profanity?: boolean;
  riskyClaims?: string[];
}

interface Post {
  id: number;
  content: string;
  hashtags?: string[];
  cta?: string;
  citations?: Citation[];
  flags?: Flags;
}

interface PostsOutputProps {
  posts: Post[];
  tokens?: number;
  latency?: number;
  cost?: number;
}

export default function PostsOutput({
  posts,
  tokens,
  latency,
  cost,
}: PostsOutputProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className='w-full max-w-4xl mx-auto'>
      {/* Meta info header */}
      <div className='flex flex-wrap gap-3 mb-4 text-sm text-gray-600 dark:text-gray-300'>
        {tokens !== undefined && <span>🧩 Tokens: {tokens}</span>}
        {latency !== undefined && <span>⚡ Latency: {latency}ms</span>}
        {cost !== undefined && <span>💰 Cost: ${cost.toFixed(4)}</span>}
      </div>

      {/* Carousel with posts */}
      <Carousel className='w-full'>
        <CarouselContent>
          {posts.map((post, index) => (
            <CarouselItem
              key={post.id}
              className='md:basis-1/2 lg:basis-1/3 p-2'
            >
              <Card className='h-full rounded-2xl shadow-md bg-white dark:bg-neutral-900 flex flex-col'>
                <CardContent className='flex flex-col p-4 flex-grow justify-between'>
                  <div>
                    <div className='text-xs text-gray-400 mb-2'>
                      Post #{index + 1}
                    </div>
                    <div
                      className='prose prose-sm dark:prose-invert line-clamp-6 cursor-pointer'
                      onClick={() => setSelectedPost(post)}
                    >
                      <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                  </div>
                  <div className='flex justify-end mt-3'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleCopy(post.content)}
                    >
                      <Copy className='w-4 h-4 mr-1' /> Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Modal for expanded post view */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className='space-y-4'>
              {/* Post content */}
              <ReactMarkdown>{selectedPost.content}</ReactMarkdown>

              {/* Hashtags */}
              {selectedPost.hashtags?.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {selectedPost.hashtags.map((tag, i) => (
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
              {selectedPost.cta && (
                <div className='pt-2 text-sm italic text-gray-600 dark:text-gray-300'>
                  {selectedPost.cta}
                </div>
              )}

              {/* Citations */}
              {selectedPost.citations?.length > 0 && (
                <details className='mt-2'>
                  <summary className='cursor-pointer text-sm text-blue-600'>
                    References
                  </summary>
                  <ul className='mt-1 space-y-1 text-xs'>
                    {selectedPost.citations.map((c, i) => (
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
              {(selectedPost.flags?.profanity ||
                selectedPost.flags?.riskyClaims?.length) && (
                <div className='flex flex-wrap gap-2 mt-3'>
                  {selectedPost.flags.profanity && (
                    <span className='px-2 py-1 text-xs rounded-md bg-red-200 text-red-800'>
                      ⚠️ Profanity detected
                    </span>
                  )}
                  {selectedPost.flags.riskyClaims?.map((claim, i) => (
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
    </div>
  );
}
