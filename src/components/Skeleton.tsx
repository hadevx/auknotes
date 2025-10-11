import React from "react";
import clsx from "clsx";

/**
 * Advanced Skeleton loader with shimmer animation
 *
 * Usage examples:
 *  <Skeleton className="w-32 h-6" />            // text line
 *  <Skeleton className="w-10 h-10 rounded-full" /> // avatar
 *  <Skeleton className="w-full h-48 rounded-lg" /> // image placeholder
 */
export default function Skeleton({ className = "", rounded = "md" }) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-gray-200 dark:bg-gray-800",
        `rounded-${rounded}`,
        className
      )}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}
