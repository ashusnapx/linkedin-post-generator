// components/PostsOutput.tsx
"use client";
import ReactMarkdown from "react-markdown";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";

type Post = {
  id: number;
  content: string;
};

export default function PostsOutput({ posts }: { posts: Post[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (content: string, id: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div className='' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* ✅ single mode rakha hai, collapsible bhi true */}
      <Accordion type='single' collapsible className='w-full space-y-4'>
        {posts.map((post) => (
          <AccordionItem
            key={post.id}
            value={`post-${post.id}`}
            className='rounded-2xl border shadow-md bg-white dark:bg-neutral-900'
          >
            <AccordionTrigger className='px-4 py-3 font-semibold text-left'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500' />
                <span>
                  AI Generated Post {post.id}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className='px-6 pb-6'>
              <ReactMarkdown>{post.content}</ReactMarkdown>

              <div className='flex gap-3 mt-5'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => copyToClipboard(post.content, post.id)}
                  className='cursor-pointer'
                >
                  <Copy className='w-4 h-4 mr-2' />
                  {copiedId === post.id ? "Copied!" : "Copy"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
