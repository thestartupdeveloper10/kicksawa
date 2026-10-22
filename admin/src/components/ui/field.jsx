import { forwardRef, useId } from "react"

import { cn } from "@/lib/utils"

/** Shared control styling so every form on the site matches. */
export const controlClass = (invalid) =>
  cn(
    "w-full rounded-lg border bg-background px-3.5 text-sm outline-none",
    "transition-[border-color,background-color] duration-fast ease-swift",
    "placeholder:text-muted-foreground",
    "focus:border-foreground",
    "disabled:cursor-not-allowed disabled:opacity-60",
    invalid ? "border-destructive" : "border-line-strong"
  )

/**
 * Label + control + one message slot.
 *
 * The error replaces the hint rather than stacking under it, so the field never
 * grows a second line and shifts the rest of the form while someone is typing.
 */
export const Field = ({ label, hint, error, children, className }) => {
  const id = useId()
  const describedBy = error || hint ? `${id}-msg` : undefined

  return (
    <div className={className}>
      {/* Requiredness is carried by the control via aria-required, not by
          appending text to the label — that would change the field's
          accessible name to "Password (required)". */}
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {(error || hint) && (
        <p
          id={describedBy}
          className={cn("mt-1.5 text-sm", error ? "text-destructive" : "text-muted-foreground")}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}

export const Input = forwardRef(({ className, invalid, describedBy, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    className={cn(controlClass(invalid), "h-12", className)}
    {...props}
  />
))
Input.displayName = "Input"

export const Textarea = forwardRef(({ className, invalid, describedBy, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    className={cn(controlClass(invalid), "resize-none py-3", className)}
    {...props}
  />
))
Textarea.displayName = "Textarea"

/** Full-width banner for form-level success/failure. */
export const FormMessage = ({ tone = "error", children, className }) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    aria-live="polite"
    className={cn(
      "rounded-lg px-4 py-3 text-sm",
      tone === "error" && "bg-destructive/10 text-destructive",
      tone === "success" && "bg-success/10 text-success",
      tone === "info" && "bg-surface text-muted-foreground",
      className
    )}
  >
    {children}
  </div>
)
