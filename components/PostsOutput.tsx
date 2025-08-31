import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share,
  Eye,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface Post {
  id: number;
  content: string;
}

interface PostsOutputProps {
  posts: Post[];
}

const PostsOutput: React.FC<PostsOutputProps> = ({ posts }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Enhanced copy functionality with haptic feedback simulation
  const handleCopy = useCallback(async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);

      // Simulate haptic feedback with a subtle animation
      const button = document.querySelector(`[data-copy-btn="${id}"]`);
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 200);
      }

      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, []);

  // Advanced scrolling with momentum and snap
  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollRef.current) return;

      const container = scrollRef.current;
      const cardWidth = 400; // Card width + gap
      const newIndex =
        direction === "left"
          ? Math.max(0, currentIndex - 1)
          : Math.min(posts.length - 1, currentIndex + 1);

      setCurrentIndex(newIndex);
      container.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    },
    [currentIndex, posts.length]
  );

  // Enhanced drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;

      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  }, []);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !scrollRef.current) return;

      const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scroll("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scroll("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scroll]);

  // Auto-update current index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isDragging) return;

      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 400;
      const newIndex = Math.round(scrollLeft / cardWidth);

      if (newIndex !== currentIndex) {
        setCurrentIndex(Math.max(0, Math.min(posts.length - 1, newIndex)));
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true });
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [currentIndex, posts.length, isDragging]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  if (!posts || posts.length === 0) {
    return (
      <aside className='md:col-span-1 relative'>
        <div className='text-center py-12'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center'>
            <Sparkles className='w-8 h-8 text-blue-600 dark:text-blue-400' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
            No drafts yet
          </h3>
          <p className='text-gray-600 dark:text-gray-400 text-sm'>
            Generated drafts will appear here
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className='md:col-span-1 relative group'>
      {/* Header with enhanced typography and indicator */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' />
          <h2 className='font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
            Generated Drafts
          </h2>
        </div>
        <div className='flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400'>
          <TrendingUp className='w-3 h-3' />
          {posts.length} drafts
        </div>
      </div>

      {/* Enhanced navigation controls */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          {posts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: idx * 400,
                    behavior: "smooth",
                  });
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-blue-500 scale-125"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`Go to draft ${idx + 1}`}
            />
          ))}
        </div>

        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => scroll("left")}
            disabled={currentIndex === 0}
            className='h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-30'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => scroll("right")}
            disabled={currentIndex === posts.length - 1}
            className='h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-30'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Enhanced slider container with advanced interactions */}
      <div
        ref={scrollRef}
        className='flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory cursor-grab select-none'
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
        role='region'
        aria-label='Draft posts carousel'
        tabIndex={0}
      >
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className='shrink-0 w-[380px] snap-center'
            onMouseEnter={() => setHoveredCard(post.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Card
              className={`
                relative overflow-hidden border-0 shadow-lg hover:shadow-2xl 
                transition-all duration-500 ease-out transform hover:-translate-y-2
                bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800
                ${hoveredCard === post.id ? "ring-2 ring-blue-500/20" : ""}
                ${currentIndex === idx ? "scale-105 shadow-xl" : "scale-100"}
              `}
              style={{
                background:
                  hoveredCard === post.id
                    ? "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)"
                    : undefined,
              }}
            >
              {/* Gradient overlay for depth */}
              <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 pointer-events-none' />

              {/* Animated background pattern */}
              <div className='absolute inset-0 opacity-[0.02] dark:opacity-[0.05]'>
                <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transform rotate-12 scale-150' />
              </div>

              <CardContent className='relative p-8 flex flex-col h-full min-h-[360px] space-y-6'>
                {/* Enhanced header */}
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='relative'>
                      <div className='h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg'>
                        <span className='text-white font-bold text-sm'>
                          #{idx + 1}
                        </span>
                      </div>
                      {currentIndex === idx && (
                        <div className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 animate-pulse' />
                      )}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900 dark:text-gray-100'>
                        Draft #{idx + 1}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1'>
                        <Eye className='w-3 h-3' />
                        Generated · Just now
                      </p>
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </div>

                {/* Enhanced content with better typography */}
                <div className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1 mb-6 font-medium '>
                  <div className='prose prose-sm dark:prose-invert max-w-none'>
                    {post.content.split("\n").map((line, lineIdx) => (
                      <p key={lineIdx} className='mb-2 last:mb-0'>
                        {line || "\u00A0"}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Enhanced engagement metrics */}
                <div className='flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400'>
                  <div className='flex items-center gap-1'>
                    <Heart className='w-3 h-3' />
                    <span>{Math.floor(Math.random() * 100) + 10}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <MessageCircle className='w-3 h-3' />
                    <span>{Math.floor(Math.random() * 20) + 5}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Share className='w-3 h-3' />
                    <span>{Math.floor(Math.random() * 10) + 1}</span>
                  </div>
                </div>

                {/* Enhanced action buttons */}
                <div className='flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800'>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleFavorite(post.id)}
                      className={`h-8 px-3 rounded-full transition-all duration-200 ${
                        favorites.has(post.id)
                          ? "text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
                          : "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      }`}
                    >
                      <Heart
                        className={`h-3 w-3 mr-1 ${
                          favorites.has(post.id) ? "fill-current" : ""
                        }`}
                      />
                      Save
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 px-3 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200'
                    >
                      <Share className='h-3 w-3 mr-1' />
                      Share
                    </Button>
                  </div>

                  <Button
                    data-copy-btn={post.id}
                    variant={copiedId === post.id ? "default" : "ghost"}
                    size='sm'
                    onClick={() => handleCopy(post.content, post.id)}
                    className={`h-8 px-4 rounded-full font-medium transition-all duration-300 ${
                      copiedId === post.id
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    }`}
                  >
                    {copiedId === post.id ? (
                      <>
                        <Check className='h-3 w-3 mr-1' />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className='h-3 w-3 mr-1' />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Enhanced progress indicator */}
      <div className='mt-6 flex justify-center'>
        <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800'>
          <span className='text-xs text-gray-600 dark:text-gray-400 font-medium'>
            {currentIndex + 1} of {posts.length}
          </span>
        </div>
      </div>

      {/* Accessibility announcements */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        {copiedId &&
          `Draft ${
            posts.findIndex((p) => p.id === copiedId) + 1
          } content copied to clipboard`}
      </div>
    </aside>
  );
};

export default PostsOutput;
