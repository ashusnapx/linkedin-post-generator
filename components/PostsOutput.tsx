"use client";

import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Post, PostsOutputProps } from "./posts/types";
import PostCard from "./posts/PostCard";
import PostDetailsDialog from "./posts/PostDetailsDialog";


export default function PostsOutput({ posts }: PostsOutputProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className='w-full max-w-4xl mx-auto'>
      <Carousel className='w-full'>
        <CarouselContent>
          {posts.map((post, index) => (
            <CarouselItem
              key={post.id}
              className='md:basis-1/2 lg:basis-1/3 p-2'
            >
              <PostCard
                post={post}
                index={index}
                onSelect={setSelectedPost}
                onCopy={handleCopy}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <PostDetailsDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
