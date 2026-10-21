import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * The house button.
 *
 * Shape defaults to a full pill — the single most recognisable element of the
 * reference aesthetic. `shape="square"` exists for size grids and filter chips
 * where a pill would fight the grid.
 *
 * Notes on the details:
 *  - Transitions name their properties explicitly. `transition-all` would also
 *    animate layout properties and cost a frame on every hover.
 *  - `active:scale-[0.96]` is the tactile press. 0.96 is the floor; anything
 *    lower reads as a gimmick.
 *  - Every size is at least 40px tall so the hit area is never below target.
 */
const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold leading-none",
    "transition-[background-color,border-color,color,box-shadow,opacity,transform]",
    "duration-fast ease-swift",
    "active:scale-[0.96]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /* Primary action. Inverts with the theme: black on white, white on black. */
        solid:
          "bg-foreground text-background hover:bg-foreground/85",
        /* Secondary action. Hairline that firms up on hover rather than filling. */
        outline:
          "border border-line-strong bg-transparent text-foreground hover:border-foreground",
        /* Tertiary / icon-adjacent. */
        ghost:
          "bg-transparent text-foreground hover:bg-surface",
        /* Fixed light chip — for placing on top of dark photography. */
        inverse:
          "bg-white text-neutral-950 hover:bg-white/85",
        /* Fixed dark chip — for placing on top of light photography. */
        onLight:
          "bg-neutral-950 text-white hover:bg-neutral-950/85",
        /* Reserved for urgency: sale, low stock, last chance. Used sparingly. */
        brand:
          "bg-brand text-brand-foreground hover:bg-brand/90",
        volt:
          "bg-volt text-volt-foreground hover:bg-volt/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        /* Inline text action. No pill, no press scale. */
        link:
          "h-auto p-0 text-foreground underline decoration-line-strong underline-offset-4 hover:decoration-foreground active:scale-100",
      },
      size: {
        sm: "h-10 px-5 text-[0.8125rem]",
        md: "h-12 px-7 text-sm",
        lg: "h-14 px-9 text-base",
        /* Square icon targets. Both clear the 40px minimum. */
        icon: "h-10 w-10 p-0",
        iconLg: "h-12 w-12 p-0",
      },
      shape: {
        pill: "rounded-full",
        square: "rounded-none",
        rounded: "rounded-lg",
      },
      block: {
        true: "w-full",
      },
    },
    compoundVariants: [
      // `link` opts out of the size and shape systems entirely.
      { variant: "link", className: "h-auto px-0 rounded-none" },
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
      shape: "pill",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, shape, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape, block }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
