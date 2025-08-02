"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SessionStatusProps {
  isActive: boolean;
  className?: string;
}

export function SessionStatus({ isActive, className }: SessionStatusProps) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={cn(
        "text-xs font-medium transition-colors",
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        className
      )}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          isActive
            ? "bg-green-500 dark:bg-green-400"
            : "bg-gray-400 dark:bg-gray-500"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
