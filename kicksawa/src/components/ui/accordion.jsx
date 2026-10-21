import { useId, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Minimal disclosure. A single-purpose accordion does not justify pulling in
 * another Radix package.
 *
 * The +/- swap cross-fades with scale and rotation rather than swapping nodes,
 * so the control has an exit as well as an enter.
 */
export const AccordionItem = ({ title, children, defaultOpen = false, className }) => {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div className={cn("border-b border-line", className)}>
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-[0.9375rem] font-semibold"
        >
          {title}
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            <Plus
              className={cn(
                "absolute h-[18px] w-[18px] transition-[opacity,transform] duration-[280ms] ease-swift",
                open ? "rotate-90 scale-[0.25] opacity-0" : "rotate-0 scale-100 opacity-100"
              )}
              strokeWidth={2}
            />
            <Minus
              className={cn(
                "absolute h-[18px] w-[18px] transition-[opacity,transform] duration-[280ms] ease-swift",
                open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-[0.25] opacity-0"
              )}
              strokeWidth={2}
            />
          </span>
        </button>
      </h3>

      {/* Kept in the DOM and hidden, so in-page search still finds the copy. */}
      <div id={id} hidden={!open} className="pb-6 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
