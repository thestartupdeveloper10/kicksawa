import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Uppercase micro-labels: "Just In", "Sale", "Sold Out".
 * These carry a lot of the editorial voice, so they are letter-spaced caps
 * rather than rounded pills with sentence case.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap text-eyebrow font-bold uppercase",
  {
    variants: {
      variant: {
        /* Free-standing label with no chip — the default editorial treatment. */
        bare: "text-brand",
        neutral: "text-muted-foreground",
        solid: "rounded-full bg-foreground px-2.5 py-1 text-background",
        brand: "rounded-full bg-brand px-2.5 py-1 text-brand-foreground",
        volt: "rounded-full bg-volt px-2.5 py-1 text-volt-foreground",
        outline: "rounded-full border border-line-strong px-2.5 py-1 text-foreground",
        success: "rounded-full bg-success px-2.5 py-1 text-success-foreground",
      },
    },
    defaultVariants: { variant: "bare" },
  }
)

const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
)

export { Badge, badgeVariants }
