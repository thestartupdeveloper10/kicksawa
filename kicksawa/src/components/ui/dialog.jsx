import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/icon-button"
import { EASE_SWIFT } from "@/components/ui/motion"

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Modal dialog.
 *
 * The page previously used a bare fixed div: no Escape handling, no focus
 * trap, no scroll lock and no labelling, so keyboard users could tab straight
 * out of it into the page behind.
 */
export const Dialog = ({ open, onClose, title, description, children, className }) => {
  const panelRef = useRef(null)
  const restoreTo = useRef(null)

  // Escape to close, and keep Tab inside the panel while it is open.
  useEffect(() => {
    if (!open) return undefined

    restoreTo.current = document.activeElement

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        onClose?.()
        return
      }
      if (event.key !== "Tab") return

      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Move focus in on the next frame, once the panel has mounted.
    const raf = requestAnimationFrame(() => {
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE)
      ;(nodes?.[0] ?? panelRef.current)?.focus?.()
    })

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      cancelAnimationFrame(raf)
      // Return focus to whatever opened the dialog.
      restoreTo.current?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_SWIFT }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            // A sheet on phones, a centred panel from tablet up.
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.995, transition: { duration: 0.16, ease: EASE_SWIFT } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative flex max-h-[92svh] w-full flex-col overflow-hidden bg-background shadow-pop",
              "rounded-t-2xl sm:max-w-lg sm:rounded-2xl",
              className
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div className="min-w-0">
                <h2 className="font-display text-display-sm font-extrabold uppercase font-wide">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <IconButton label="Close" onClick={onClose} className="-mr-2 shrink-0">
                <X strokeWidth={1.75} />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
