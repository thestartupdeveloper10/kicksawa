import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Horizontal scroll-snap rail with paging arrows.
 *
 * This is the shop's primary way of showing a collection: it keeps the page
 * short, lets a row run past the right edge (which signals "there is more"),
 * and stays a plain scroll container so touch and trackpad work natively.
 *
 * The arrows are a progressive enhancement layered on top of real overflow
 * scrolling — they disable at the ends rather than disappearing, so the
 * control row doesn't reflow mid-interaction.
 */
export const Rail = React.forwardRef(
  (
    {
      children,
      className,
      trackClassName,
      /* Gutter so the first/last card aligns with the page grid while still
         being able to scroll flush to the viewport edge. */
      gutter = true,
      label,
      controls,
      onEdgeChange,
      ...props
    },
    forwardedRef
  ) => {
    const innerRef = React.useRef(null)
    const scroller = forwardedRef ?? innerRef

    const [edges, setEdges] = React.useState({
      atStart: true,
      atEnd: true,
      scrollable: false,
    })

    const measure = React.useCallback(() => {
      const el = scroller.current
      if (!el) return
      const max = el.scrollWidth - el.clientWidth
      const next = {
        // 2px tolerance: sub-pixel layout means scrollLeft rarely hits 0 or max exactly.
        atStart: el.scrollLeft <= 2,
        atEnd: el.scrollLeft >= max - 2,
        scrollable: max > 4,
      }
      setEdges((prev) =>
        prev.atStart === next.atStart &&
        prev.atEnd === next.atEnd &&
        prev.scrollable === next.scrollable
          ? prev
          : next
      )
    }, [scroller])

    React.useEffect(() => {
      const el = scroller.current
      if (!el) return

      measure()
      el.addEventListener("scroll", measure, { passive: true })

      // Content can arrive after mount (async product fetch), so watch the
      // track itself rather than only listening for window resizes.
      const observer = new ResizeObserver(measure)
      observer.observe(el)
      if (el.firstElementChild) observer.observe(el.firstElementChild)

      return () => {
        el.removeEventListener("scroll", measure)
        observer.disconnect()
      }
    }, [measure, scroller])

    React.useEffect(() => {
      onEdgeChange?.(edges)
    }, [edges, onEdgeChange])

    const page = React.useCallback(
      (direction) => {
        const el = scroller.current
        if (!el) return
        el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" })
      },
      [scroller]
    )

    const arrows = (
      <RailArrows
        atStart={edges.atStart}
        atEnd={edges.atEnd}
        scrollable={edges.scrollable}
        onPrev={() => page(-1)}
        onNext={() => page(1)}
      />
    )

    return (
      <div className={cn("relative", className)} {...props}>
        {controls?.(arrows, edges) ?? null}
        <div
          ref={scroller}
          role="group"
          aria-label={label}
          tabIndex={0}
          className={cn(
            "no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain",
            // Scroll past the container gutter so cards can sit flush to the
            // viewport edge on mobile, the way a native carousel does.
            gutter && "-mx-5 scroll-px-5 px-5 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-10 lg:scroll-px-10 lg:px-10",
            "focus-visible:outline-offset-4",
            trackClassName
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
Rail.displayName = "Rail"

/** A single snap target. Width is the caller's call — collections vary. */
export const RailItem = ({ className, ...props }) => (
  <div className={cn("shrink-0 snap-start", className)} {...props} />
)

export const RailArrows = ({ atStart, atEnd, scrollable, onPrev, onNext, className }) => {
  if (!scrollable) return null

  const base = cn(
    "inline-flex h-11 w-11 items-center justify-center rounded-full",
    "border border-line-strong bg-background text-foreground",
    "transition-[background-color,border-color,opacity,transform] duration-fast ease-swift",
    "hover:bg-surface active:scale-[0.96]",
    "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-background"
  )

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button type="button" aria-label="Previous" disabled={atStart} onClick={onPrev} className={base}>
        {/* Chevrons are optically heavy on one side; nudge toward the point. */}
        <ChevronLeft className="h-5 w-5 -translate-x-px" strokeWidth={2} />
      </button>
      <button type="button" aria-label="Next" disabled={atEnd} onClick={onNext} className={base}>
        <ChevronRight className="h-5 w-5 translate-x-px" strokeWidth={2} />
      </button>
    </div>
  )
}
