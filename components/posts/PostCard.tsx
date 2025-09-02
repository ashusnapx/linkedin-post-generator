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
    <Card className='h-full rounded-2xl shadow-md bg-white dark:bg-neutral-900 flex flex-col'>
      <CardContent className='flex flex-col p-4 flex-grow justify-between'>
        <div>
          <div className='text-xs text-gray-400 mb-2'>Post #{index + 1}</div>
          <div
            className='prose prose-sm dark:prose-invert line-clamp-6 cursor-pointer'
            onClick={() => onSelect(post)}
          >
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
        <div className='flex justify-end mt-3'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onCopy(post.content)}
          >
            <Copy className='w-4 h-4 mr-1' /> Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
