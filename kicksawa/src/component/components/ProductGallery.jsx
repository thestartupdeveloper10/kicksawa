import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Product imagery.
 *
 * Desktop gets a thumbnail rail beside a large still; mobile gets a native
 * scroll-snap carousel, because a thumbnail rail on a phone is a row of targets
 * nobody can hit. Both share one index so the dots and rail stay in step.
 *
 * Panels are light in both themes and the shots are multiplied onto them — the
 * catalogue's photography carries baked-in white and grey backgrounds, and this
 * collapses them into the panel instead of showing a box.
 */
const ProductGallery = ({ images = [], title }) => {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef(null);

  const shots = images.filter(Boolean);

  // Track which slide the mobile carousel has settled on.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setActive((prev) => (prev === index ? prev : index));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (shots.length === 0) {
    return <div className="aspect-square w-full bg-surface" aria-hidden="true" />;
  }

  return (
    <div>
      {/* Mobile: full-bleed snap carousel */}
      <div className="lg:hidden">
        <div
          ref={scrollerRef}
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto sm:-mx-6"
        >
          {shots.map((src, index) => (
            <div key={src} className="w-full shrink-0 snap-center px-5 sm:px-6">
              <div className="aspect-square overflow-hidden bg-[#f4f4f4]">
                <img
                  src={src}
                  alt={`${title} — view ${index + 1}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-contain p-4 mix-blend-multiply"
                />
              </div>
            </div>
          ))}
        </div>

        {shots.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {shots.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={`View image ${index + 1}`}
                aria-current={index === active}
                onClick={() => {
                  const el = scrollerRef.current;
                  el?.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
                }}
                // 40px target around a 6px dot.
                className="flex h-10 w-6 items-center justify-center"
              >
                <span
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-[250ms] ease-swift',
                    index === active ? 'w-5 bg-foreground' : 'w-1.5 bg-line-strong'
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnail rail + large still */}
      <div className="hidden gap-4 lg:flex">
        {shots.length > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3">
            {shots.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  'aspect-square overflow-hidden bg-[#f4f4f4] transition-[box-shadow] duration-fast ease-swift',
                  index === active
                    ? 'shadow-[inset_0_0_0_2px_hsl(var(--foreground))]'
                    : 'hover:shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.3)]'
                )}
              >
                <img
                  src={src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-contain p-1.5 mix-blend-multiply"
                />
              </button>
            ))}
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-hidden bg-[#f4f4f4]">
          <img
            src={shots[active]}
            alt={`${title} — view ${active + 1}`}
            fetchpriority="high"
            decoding="async"
            className="aspect-square w-full object-contain p-8 mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
