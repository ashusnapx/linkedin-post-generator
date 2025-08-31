// components/PostsOutput.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { GenerationMeta } from "../hooks/useFormHandler";

interface Post {
  id: number;
  content: string;
}

interface PostsOutputProps {
  posts: Post[];
  meta?: GenerationMeta;
}

const PostsOutput: React.FC<PostsOutputProps> = ({ posts, meta }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"single" | "cards">("cards"); // default to cards

  const handleCopy = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!posts || posts.length === 0) {
    return (
      <aside className='md:col-span-1 relative p-6 text-center text-gray-500 dark:text-gray-300'>
        <p className='text-lg mb-1'>No drafts yet</p>
        <p className='text-sm'>Generated LinkedIn drafts will appear here.</p>
      </aside>
    );
  }

  // compact header with toggle
  const header = (
    <div className='mb-4 flex items-center justify-between gap-3'>
      <h2 className='font-bold text-lg'>Generated Drafts</h2>

      <div className='flex items-center gap-2'>
        <div className='text-sm text-muted-foreground mr-2'>
          {posts.length} drafts • {meta?.tokens ?? "—"} tokens
        </div>

        <div className='flex items-center gap-1 rounded-md bg-gray-50 dark:bg-neutral-800 p-1'>
          <button
            type='button'
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === "cards"
                ? "bg-white dark:bg-neutral-900 shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Cards
          </button>
          <button
            type='button'
            onClick={() => setViewMode("single")}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === "single"
                ? "bg-white dark:bg-neutral-900 shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Single
          </button>
        </div>
      </div>
    </div>
  );

  if (viewMode === "cards") {
    return (
      <aside className='md:col-span-1'>
        {header}

        <div className='space-y-4'>
          {posts.map((post, idx) => (
            <Card
              key={post.id}
              className='w-full border-0 shadow-md bg-white dark:bg-neutral-900 rounded-lg'
            >
              <CardContent className='p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <div className='flex items-center gap-3'>
                      <div className='h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold'>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className='font-semibold text-sm text-gray-900 dark:text-gray-100'>
                          Draft #{idx + 1}
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          Generated • just now
                        </div>
                      </div>
                    </div>
                    <div className='mt-3 leading-relaxed text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line'>
                      {post.content}
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-2'>
                    <div className='flex flex-col gap-2'>
                      <Button
                        variant={copiedId === post.id ? "default" : "ghost"}
                        size='sm'
                        onClick={() => handleCopy(post.content, post.id)}
                      >
                        {copiedId === post.id ? (
                          <>
                            <Check className='w-4 h-4 mr-1' />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className='w-4 h-4 mr-1' />
                            Copy
                          </>
                        )}
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => toggleFavorite(post.id)}
                        className={favorites.has(post.id) ? "text-red-500" : ""}
                      >
                        <Heart className='w-4 h-4 mr-1' />
                        Save
                      </Button>
                    </div>

                    <div className='text-xs text-muted-foreground'>
                      {/* Optional per-card meta if you want to show per-draft tokens/cost — placeholder */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='mt-4 text-sm text-gray-500 dark:text-gray-400'>
          {meta ? (
            <>
              <span>🧾 {meta.tokens ?? "—"} tokens</span>
              <span className='mx-2'>•</span>
              <span>
                ⏱{" "}
                {meta.latencyMs
                  ? `${(meta.latencyMs / 1000).toFixed(2)}s`
                  : "—"}
              </span>
              <span className='mx-2'>•</span>
              <span>
                💲{" "}
                {meta.costUSD !== undefined
                  ? `$${meta.costUSD.toFixed(4)}`
                  : "—"}
              </span>
            </>
          ) : (
            <span className='text-muted-foreground'>No meta available</span>
          )}
        </div>
      </aside>
    );
  }

  // single view
  return (
    <aside className='md:col-span-1'>
      {header}

      <Card className='mb-4 w-full border-0 shadow-md bg-white dark:bg-neutral-900 rounded-lg'>
        <CardContent className='p-4'>
          <div>
            <h3 className='font-semibold mb-2 text-gray-800 dark:text-gray-100'>
              Draft #{currentIndex + 1}
            </h3>
            <div className='leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line text-base'>
              {posts[currentIndex].content}
            </div>
          </div>

          <div className='flex gap-3 justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 mt-4'>
            <div className='flex gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  setCurrentIndex((i) => Math.min(posts.length - 1, i + 1))
                }
                disabled={currentIndex === posts.length - 1}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex gap-2'>
              <Button
                variant={
                  copiedId === posts[currentIndex].id ? "default" : "ghost"
                }
                size='sm'
                onClick={() =>
                  handleCopy(
                    posts[currentIndex].content,
                    posts[currentIndex].id
                  )
                }
              >
                {copiedId === posts[currentIndex].id ? (
                  <>
                    <Check className='w-4 h-4 mr-1' />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className='w-4 h-4 mr-1' />
                    Copy
                  </>
                )}
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => toggleFavorite(posts[currentIndex].id)}
                className={
                  favorites.has(posts[currentIndex].id) ? "text-red-500" : ""
                }
              >
                <Heart className='w-4 h-4 mr-1' /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='text-sm text-gray-500 dark:text-gray-400'>
        {currentIndex + 1} of {posts.length} • {meta?.tokens ?? "—"} tokens •{" "}
        {meta?.latencyMs ? `${(meta.latencyMs / 1000).toFixed(2)}s` : "—"} •{" "}
        {meta?.costUSD !== undefined ? `$${meta.costUSD.toFixed(4)}` : "—"}
      </div>

      <div aria-live='polite' className='sr-only'>
        {copiedId && `Draft ${currentIndex + 1} copied.`}
      </div>
    </aside>
  );
};

export default PostsOutput;
