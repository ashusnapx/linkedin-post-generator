import React from "react";

/**
 * Responsive grid wrapper for form field layouts.
 */
export function GridWrapper({
  colsMobile = 1,
  colsSm,
  colsMd,
  colsLg,
  gap = 6,
  children,
}: {
  colsMobile?: number;
  colsSm?: number;
  colsMd?: number;
  colsLg?: number;
  gap?: number;
  children: React.ReactNode;
}) {
  let className = `grid grid-cols-${colsMobile} gap-${gap}`;
  if (colsSm) className += ` sm:grid-cols-${colsSm}`;
  if (colsMd) className += ` md:grid-cols-${colsMd}`;
  if (colsLg) className += ` lg:grid-cols-${colsLg}`;
  return <div className={className}>{children}</div>;
}
