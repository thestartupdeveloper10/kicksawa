import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

import FilterPanel from './FilterPanel';
import ProductGrid from './ProductGrid';
import { Container } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { EASE_SWIFT } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import {
  EMPTY_FILTERS,
  SORTS,
  countActiveFilters,
  deriveFacets,
  filterLabel,
  filterProducts,
  sortProducts,
} from '@/lib/products';

const PAGE_SIZE = 12;

/**
 * Scroll-linked values for the collection header: the big title drifts down
 * at about half the scroll speed and fades (parallax), while a compact title
 * fades into the sticky toolbar as the big one leaves. Transforms and opacity
 * only, so it never triggers layout; motion is dropped for reduced-motion users.
 */
const useHeaderParallax = (heroRef) => {
  const reduceMotion = useReducedMotion();
  const heightRef = useRef(1);
  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;
    const measure = () => {
      heightRef.current = Math.max(1, el.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [heroRef]);

  // 0 at the top of the page, 1 once the hero has scrolled out from under the bar.
  const progress = (y) => Math.min(1, Math.max(0, y / heightRef.current));
  const reveal = (y) => Math.min(1, Math.max(0, (progress(y) - 0.6) / 0.4));

  const heroY = useTransform(scrollY, (y) => (reduceMotion ? 0 : y * 0.45));
  const heroOpacity = useTransform(scrollY, (y) => 1 - progress(y));
  const compactOpacity = useTransform(scrollY, reveal);
  const compactY = useTransform(scrollY, (y) => (reduceMotion ? 0 : 6 * (1 - reveal(y))));

  return { heroY, heroOpacity, compactOpacity, compactY };
};

/* -------------------------------------------------------------------------- */
/*  Sort menu                                                                  */
/* -------------------------------------------------------------------------- */

const SortMenu = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORTS.find((s) => s.id === value) ?? SORTS[0];

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors duration-fast ease-swift hover:bg-surface"
      >
        <span className="hidden sm:inline text-muted-foreground">Sort By</span>
        <span>{current.label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-[220ms] ease-swift', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: EASE_SWIFT }}
            className="absolute right-0 top-full z-40 mt-2 w-56 origin-top-right overflow-hidden rounded-lg bg-popover py-1.5 shadow-pop"
          >
            {SORTS.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm transition-colors duration-fast ease-swift hover:bg-surface',
                    option.id === value && 'font-semibold'
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Active filter chips                                                        */
/* -------------------------------------------------------------------------- */

const FilterChips = ({ filters, onToggle, onClear }) => {
  const chips = Object.entries(filters).flatMap(([type, values]) =>
    (values || []).map((value) => ({ type, value }))
  );
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-6">
      {chips.map(({ type, value }) => (
        <button
          key={`${type}:${value}`}
          type="button"
          onClick={() => onToggle(type, value)}
          className="group inline-flex h-9 items-center gap-2 rounded-full border border-line-strong pl-3.5 pr-2.5 text-sm capitalize transition-[background-color,border-color] duration-fast ease-swift hover:border-foreground hover:bg-surface"
        >
          {type === 'colors' ? (
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full ring-1 ring-foreground/15"
                style={{ backgroundColor: value }}
              />
              Colour
            </span>
          ) : (
            filterLabel(type, value)
          )}
          <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" strokeWidth={2.5} />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-sm font-medium underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-foreground"
      >
        Clear All
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  CollectionView                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The shared listing shell used by every grid on the site.
 *
 * Owns filtering, sorting and paging so the pages only have to fetch. The
 * previous pages each reimplemented all three and had drifted apart.
 */
const CollectionView = ({
  eyebrow,
  title,
  products = [],
  loading = false,
  error = null,
  search = '',
  showFacets = ['brands', 'categories', 'prices', 'colors'],
  initialFilters,
  onFiltersChange,
  emptyMessage = 'No products match these filters.',
}) => {
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, ...initialFilters }));
  const [sort, setSort] = useState('featured');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [railOpen, setRailOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const facets = useMemo(() => deriveFacets(products), [products]);

  const results = useMemo(
    () => sortProducts(filterProducts(products, filters, search), sort),
    [products, filters, search, sort]
  );

  // Any change to what is being shown resets the page window, otherwise a
  // narrowed result set can leave the user staring at an empty tail.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters, sort, search, products]);

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  // Lock the page behind the mobile filter sheet.
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);

  const toggleFilter = useCallback((type, value) => {
    setFilters((prev) => {
      const list = prev[type] || [];
      return {
        ...prev,
        [type]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({ ...EMPTY_FILTERS }), []);

  const activeCount = countActiveFilters(filters);
  const hasRail = showFacets.length > 0;

  const heroRef = useRef(null);
  const { heroY, heroOpacity, compactOpacity, compactY } = useHeaderParallax(heroRef);

  const panel = (
    <FilterPanel facets={facets} active={filters} onToggle={toggleFilter} show={showFacets} />
  );

  return (
    <>
      {/* Title block. Scrolls normally, but its content drifts at about half
          speed and fades, so the grid appears to slide up over it. The
          overflow clip keeps the drifting text inside its own band. */}
      <div ref={heroRef} className="overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <Container className="pb-6 pt-8 sm:pb-8 sm:pt-12">
            {eyebrow && (
              <p className="mb-3 text-eyebrow font-bold uppercase text-muted-foreground">{eyebrow}</p>
            )}
            <h1 className="font-display text-display-lg font-black uppercase leading-[0.95] tracking-tightest font-expanded">
              {title}{' '}
              {!loading && (
                <span className="tnum text-muted-foreground">({results.length})</span>
              )}
            </h1>
          </Container>
        </motion.div>
      </div>

      {/* Collection bar. Sticks under the navbar so sort and filters stay
          reachable however far the grid runs; once the big title has gone,
          a compact one fades in here so you still know where you are. */}
      <div className="sticky top-header z-30 bg-background/90 backdrop-blur-md">
        <Container className="flex items-center justify-between gap-4 py-3">
          <motion.p
            aria-hidden="true"
            style={{ opacity: compactOpacity, y: compactY }}
            className="min-w-0 truncate text-[0.8125rem] font-bold uppercase sm:text-[0.9375rem] sm:font-wide"
          >
            {title}
            {!loading && <span className="tnum text-muted-foreground"> · {results.length}</span>}
          </motion.p>

          <div className="flex items-center gap-1 sm:gap-2">
            {hasRail && (
              <>
                {/* Desktop collapses the rail; mobile opens it as a sheet. */}
                <button
                  type="button"
                  onClick={() => setRailOpen((v) => !v)}
                  className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors duration-fast ease-swift hover:bg-surface lg:flex"
                >
                  {railOpen ? 'Hide Filters' : 'Show Filters'}
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-full border border-line-strong px-3.5 text-sm font-medium transition-colors duration-fast ease-swift hover:bg-surface lg:hidden"
                >
                  Filters
                  {activeCount > 0 && (
                    <span className="tnum flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background">
                      {activeCount}
                    </span>
                  )}
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
                </button>
              </>
            )}

            <SortMenu value={sort} onChange={setSort} />
          </div>
        </Container>
        <div className="h-px bg-line" />
      </div>

      <Container className="pb-24 pt-8">
        <FilterChips filters={filters} onToggle={toggleFilter} onClear={clearFilters} />

        <div className="flex gap-10">
          {hasRail && (
            <aside
              className={cn(
                'hidden shrink-0 lg:block',
                railOpen ? 'w-60 xl:w-64' : 'w-0 overflow-hidden'
              )}
              aria-hidden={!railOpen}
            >
              <div className="sticky top-[calc(var(--header-h)+5.5rem)] max-h-[calc(100svh-var(--header-h)-7rem)] overflow-y-auto pr-2">
                {panel}
              </div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {error ? (
              <p className="py-20 text-center text-muted-foreground">{error}</p>
            ) : !loading && results.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-display-sm font-extrabold uppercase font-wide">
                  Nothing Here
                </p>
                <p className="mt-2 text-muted-foreground">{emptyMessage}</p>
                {activeCount > 0 && (
                  <Button variant="outline" className="mt-6" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <ProductGrid products={results.slice(0, visible)} loading={loading} />

                {!loading && visible < results.length && (
                  <div className="mt-14 flex flex-col items-center gap-3">
                    <p className="tnum text-sm text-muted-foreground">
                      Showing {Math.min(visible, results.length)} of {results.length}
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_SWIFT }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%', transition: { duration: 0.22, ease: EASE_SWIFT } }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[88svh] flex-col rounded-t-2xl bg-background lg:hidden"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-display text-display-sm font-extrabold uppercase font-wide">
                  Filters
                </h2>
                <IconButton label="Close filters" onClick={() => setSheetOpen(false)}>
                  <X strokeWidth={1.75} />
                </IconButton>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5">{panel}</div>

              <div className="flex shrink-0 gap-3 border-t border-line p-5">
                <Button variant="outline" block onClick={clearFilters} disabled={activeCount === 0}>
                  Clear
                </Button>
                <Button block onClick={() => setSheetOpen(false)}>
                  Show {results.length} Results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CollectionView;
