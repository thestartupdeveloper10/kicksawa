import { cn } from "@/lib/utils"

/**
 * Loading placeholder. A travelling sheen rather than a pulsing opacity —
 * pulse reads as "broken", a sweep reads as "working".
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden bg-surface-2",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-foreground/[0.06] after:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
