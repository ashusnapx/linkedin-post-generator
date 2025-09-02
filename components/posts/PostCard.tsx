"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Post } from "./types";

interface PostCardProps {
  post: Post;
  index: number;
  onSelect: (post: Post) => void;
  onCopy: (content: string) => void;
}

export default function PostCard({
  post,
  index,
  onSelect,
  onCopy,
}: PostCardProps) {
  return (
    <Card
      className='h-full rounded-2xl shadow-md bg-white dark:bg-neutral-900 flex flex-col focus-within:ring-2 focus-within:ring-indigo-500 outline-none'
      tabIndex={-1}
      aria-label={`Post number ${index + 1}`}
    >
      <CardContent className='flex flex-col p-4 flex-grow justify-between'>
        <div>
          <div className='text-xs text-gray-400 mb-2 select-none'>
            Post #{index + 1}
          </div>
          <div
            role='button'
            tabIndex={0}
            onClick={() => onSelect(post)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(post);
              }
            }}
            className='prose prose-sm dark:prose-invert line-clamp-6 cursor-pointer select-text'
            aria-label={`Select post number ${index + 1}`}
          >
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
        <div className='flex justify-end mt-3'>
          <Button
            size='sm'
            variant='outline'
            aria-label={`Copy content of post number ${index + 1}`}
            onClick={() => onCopy(post.content)}
          >
            <Copy className='w-4 h-4 mr-1' aria-hidden='true' />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
