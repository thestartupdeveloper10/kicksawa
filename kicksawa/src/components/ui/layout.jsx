import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Horizontal rhythm for the whole site.
 *
 * `wide` is the shop default (product grids breathe better edge-to-edge).
 * `default` is for editorial and forms. `bleed` removes the gutter entirely
 * for full-width photography while keeping the vertical rhythm.
 */
const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-[1600px]",
  bleed: "max-w-none",
}

export const Container = React.forwardRef(
  ({ className, width = "wide", as: Comp = "div", ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(
        "mx-auto w-full",
        WIDTHS[width],
        width !== "bleed" && "px-5 sm:px-6 lg:px-10",
        className
      )}
      {...props}
    />
  )
)
Container.displayName = "Container"

/** Vertical rhythm. One place to change how far apart sections sit. */
const PADDING = {
  none: "",
  sm: "py-10 sm:py-14",
  md: "py-14 sm:py-20",
  lg: "py-20 sm:py-28",
  xl: "py-24 sm:py-36",
}

export const Section = React.forwardRef(
  ({ className, padding = "md", as: Comp = "section", ...props }, ref) => (
    <Comp ref={ref} className={cn(PADDING[padding], className)} {...props} />
  )
)
Section.displayName = "Section"

/**
 * The section header: an optional eyebrow, a display-weight title, and an
 * optional action pushed to the far right. Left-aligned by default — centred
 * headings are the fastest way to make a storefront look generic.
 */
export const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  // Pages where this heading *is* the page title pass as="h1"; every page
  // needs exactly one top-level heading.
  as: Heading = "h2",
  className,
  ...props
}) => (
  <div
    className={cn(
      "mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-8",
      align === "center" && "flex-col items-center text-center",
      className
    )}
    {...props}
  >
    <div className={cn("min-w-0", align === "center" && "max-w-2xl")}>
      {eyebrow && (
        <p className="mb-2 text-eyebrow font-bold uppercase text-muted-foreground">
          {eyebrow}
        </p>
      )}
      {title && (
        <Heading className="font-display text-display-md font-extrabold uppercase font-wide">
          {title}
        </Heading>
      )}
      {description && (
        <p className="mt-2 max-w-prose text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
)

/** A full-width hairline that respects the theme. */
export const Rule = ({ className, ...props }) => (
  <hr className={cn("border-0 border-t border-line", className)} {...props} />
)
