import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

/**
 * A circular icon target with an optional count bubble.
 *
 * The visible circle is 40px so it meets the minimum hit area on its own —
 * no pseudo-element padding hack needed. Icons inside should be 20px; larger
 * ones crowd the circle and make the hover state look like a mistake.
 */
const IconButton = React.forwardRef(
  ({ className, count, label, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const showCount = typeof count === "number" && count > 0

    return (
      <Comp
        ref={ref}
        aria-label={label}
        className={cn(
          "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          "text-foreground",
          "transition-[background-color,color,transform] duration-fast ease-swift",
          "hover:bg-surface active:scale-[0.96]",
          "disabled:pointer-events-none disabled:opacity-40",
          "[&_svg]:pointer-events-none [&_svg]:h-5 [&_svg]:w-5",
          className
        )}
        {...props}
      >
        {/* Slot merges onto exactly one child. Slottable marks which child that
            is, so the count bubble can sit beside it rather than breaking the
            asChild contract. */}
        <Slottable>{children}</Slottable>
        {showCount && (
          <span
            aria-hidden="true"
            className={cn(
              "tnum absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center",
              "rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-foreground",
              // Punches a hole in the icon behind it so the bubble reads as
              // floating rather than printed onto the glyph.
              "ring-2 ring-background"
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
        {showCount && <span className="sr-only">{count} items</span>}
      </Comp>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
