import { useEffect, useRef, useState } from "react"
import { ImageOff } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { imageSrc } from "@/lib/image"

/**
 * A product photo that loads politely.
 *
 * Until it arrives the swatch shows a sheen and the <img> stays invisible:
 * left visible, browsers paint the alt text (the product name) in the empty
 * box, which reads as broken. It fades in once decoded, and a failed load
 * shows a quiet icon rather than the name.
 *
 * Renders positioned overlays, so the parent must be `relative`. The image
 * keeps the caller's classes; give it a `transition-[opacity,...]` class for
 * the fade.
 */
const ProductImage = ({ src, alt, priority = false, className, style, onError, ...props }) => {
  const ref = useRef(null)
  const [state, setState] = useState("loading")

  // A photo already in the browser cache can finish before React attaches
  // onLoad, so check on mount and whenever the source changes.
  useEffect(() => {
    const img = ref.current
    setState(img?.complete && img.naturalWidth > 0 ? "loaded" : "loading")
  }, [src])

  if (state === "error") {
    return (
      <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
        <ImageOff className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </span>
    )
  }

  return (
    <>
      {state === "loading" && <Skeleton className="pointer-events-none absolute inset-0 bg-transparent" />}
      <img
        ref={ref}
        src={imageSrc(src)}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        // React 18 forwards this attribute only in lowercase.
        fetchpriority={priority ? "high" : undefined}
        decoding="async"
        onLoad={() => setState("loaded")}
        onError={(event) => {
          setState("error")
          onError?.(event)
        }}
        className={className}
        // Inline so it wins while loading, then steps aside for the
        // caller's own opacity classes (e.g. the card's hover swap).
        style={state === "loaded" ? style : { ...style, opacity: 0 }}
        {...props}
      />
    </>
  )
}

export { ProductImage }
