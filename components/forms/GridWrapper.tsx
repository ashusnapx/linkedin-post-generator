import React from "react";
import { cn } from "@/lib/utils";

/**
 * Responsive grid wrapper for form field layouts.
 * Uses explicit classes to ensure Tailwind scans them.
 */
export function GridWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-6", className)}>{children}</div>
  );
}
