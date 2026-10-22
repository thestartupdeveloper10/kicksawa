import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

/** Shared entrance curve. Matches --ease-out-quint in index.css. */
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1]
export const EASE_SWIFT = [0.2, 0, 0, 1]

/** Springs used for interactive state. Bounce is always 0 — never springy. */
export const SPRING = { type: "spring", duration: 0.3, bounce: 0 }
export const SPRING_SLOW = { type: "spring", duration: 0.6, bounce: 0 }

/**
 * Fade-and-rise when scrolled into view, once.
 *
 * `distance` is deliberately small. A long travel reads as a page that hasn't
 * finished loading; 16–24px reads as intent.
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
  distance = 18,
  duration = 0.62,
  once = true,
  amount = 0.25,
  as = "div",
  ...props
}) => {
  const reduceMotion = useReducedMotion()
  const Comp = motion[as] ?? motion.div

  if (reduceMotion) {
    const Static = as
    return (
      <Static className={className} {...props}>
        {children}
      </Static>
    )
  }

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, ease: EASE_OUT_QUINT, delay }}
      {...props}
    >
      {children}
    </Comp>
  )
}

/**
 * Staggers direct children instead of animating one container.
 * Splitting content into semantic chunks is what makes an entrance feel
 * composed rather than like a single div sliding in.
 */
export const Stagger = ({
  children,
  className,
  delay = 0,
  step = 0.08,
  distance = 18,
  once = true,
  amount = 0.2,
  as = "div",
  ...props
}) => {
  const reduceMotion = useReducedMotion()
  const Comp = motion[as] ?? motion.div

  if (reduceMotion) {
    const Static = as
    return (
      <Static className={className} {...props}>
        {children}
      </Static>
    )
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: step } },
      }}
      {...props}
    >
      {React.Children.map(children, (child) =>
        child == null || typeof child === "string" ? (
          child
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: distance },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.62, ease: EASE_OUT_QUINT },
              },
            }}
          >
            {child}
          </motion.div>
        )
      )}
    </Comp>
  )
}

/**
 * Display type wiping up from behind its own baseline.
 *
 * Pass an array of lines; each gets its own mask so the lines cascade. This is
 * the one entrance effect reserved for hero headlines — using it anywhere else
 * spends the impact.
 */
export const TextReveal = ({
  lines = [],
  className,
  lineClassName,
  delay = 0,
  step = 0.09,
  duration = 0.85,
  as: Comp = "h1",
}) => {
  const reduceMotion = useReducedMotion()

  return (
    <Comp className={className}>
      {lines.map((line, i) => (
        // The mask. `pb` gives descenders room so they aren't clipped mid-rest.
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          {reduceMotion ? (
            <span className={cn("block", lineClassName)}>{line}</span>
          ) : (
            <motion.span
              className={cn("block", lineClassName)}
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration, ease: EASE_OUT_QUINT, delay: delay + i * step }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </Comp>
  )
}

/**
 * Infinite horizontal rail. The track holds two identical copies of the
 * children and translates -50%, so the loop point is invisible.
 * Hidden from assistive tech: the duplicate would be read twice.
 */
export const Marquee = ({
  children,
  className,
  duration = 40,
  reverse = false,
  pauseOnHover = true,
  ...props
}) => {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn("group relative w-full overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn(
          "flex w-max",
          !reduceMotion && "animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
