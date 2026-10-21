/**
 * Shared catalogue logic.
 *
 * ProductsPage and BrandProductsPage each carried their own copy of filter
 * state, price parsing and pagination, and the two had drifted: one offered a
 * "6501+" bucket and the other a "0-1000" bucket, and since the live catalogue
 * runs 1,999–6,499 both matched nothing. Buckets now span the real range.
 */

export const CURRENCY = 'Ksh';

export const formatPrice = (value) =>
  `${CURRENCY} ${Number(value || 0).toLocaleString('en-KE')}`;

/** Half-open [min, max). Ordered low to high; ids are URL-safe. */
export const PRICE_BUCKETS = [
  { id: 'under-3000', label: 'Under Ksh 3,000', min: 0, max: 3000 },
  { id: '3000-4000', label: 'Ksh 3,000 – 4,000', min: 3000, max: 4000 },
  { id: '4000-5000', label: 'Ksh 4,000 – 5,000', min: 4000, max: 5000 },
  { id: '5000-6000', label: 'Ksh 5,000 – 6,000', min: 5000, max: 6000 },
  { id: 'over-6000', label: 'Ksh 6,000 & Above', min: 6000, max: Infinity },
];

export const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low – High' },
  { id: 'price-desc', label: 'Price: High – Low' },
];

export const EMPTY_FILTERS = {
  brands: [],
  categories: [],
  prices: [],
  colors: [],
};

/**
 * Colour values come from free text entry, so the catalogue contains empty
 * strings and values with leading spaces. Anything that is not a usable CSS
 * hex colour is dropped rather than rendered as a broken swatch.
 */
export const normalizeColor = (value) => {
  const trimmed = String(value ?? '').trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed) ? trimmed.toLowerCase() : null;
};

const matchesPrice = (price, bucketIds) => {
  if (bucketIds.length === 0) return true;
  return bucketIds.some((id) => {
    const bucket = PRICE_BUCKETS.find((b) => b.id === id);
    return bucket && price >= bucket.min && price < bucket.max;
  });
};

/** Facets are AND-ed across types and OR-ed within a type — the convention
 *  every storefront filter uses, and what the old pages did implicitly. */
export const filterProducts = (products, filters = {}, search = '') => {
  const { brands = [], categories = [], prices = [], colors = [] } = filters;
  const term = search.trim().toLowerCase();

  return products.filter((product) => {
    if (brands.length && !brands.includes(product.brand)) return false;

    if (categories.length) {
      const owned = product.categories || [];
      if (!categories.some((c) => owned.includes(c))) return false;
    }

    if (!matchesPrice(product.price, prices)) return false;

    if (colors.length) {
      const owned = (product.color || []).map(normalizeColor).filter(Boolean);
      if (!colors.some((c) => owned.includes(c))) return false;
    }

    if (term) {
      const haystack = `${product.title} ${product.brand} ${(product.categories || []).join(' ')}`;
      if (!haystack.toLowerCase().includes(term)) return false;
    }

    return true;
  });
};

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

export const sortProducts = (products, sortId) => {
  const list = [...products];
  switch (sortId) {
    case 'newest':
      return list.sort(byNewest);
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    default:
      // "Featured" keeps the order the API returned, which is the curated one.
      return list;
  }
};

const tally = (values) => {
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
};

/**
 * Builds the option lists from the products actually on the page, so a filter
 * can never offer a choice that returns nothing.
 */
export const deriveFacets = (products) => ({
  brands: tally(products.map((p) => p.brand).filter(Boolean)),
  categories: tally(products.flatMap((p) => p.categories || []).filter(Boolean)),
  colors: tally(products.flatMap((p) => (p.color || []).map(normalizeColor)).filter(Boolean)),
  prices: PRICE_BUCKETS.map((bucket) => ({
    value: bucket.id,
    label: bucket.label,
    count: products.filter((p) => p.price >= bucket.min && p.price < bucket.max).length,
  })).filter((bucket) => bucket.count > 0),
});

export const countActiveFilters = (filters) =>
  Object.values(filters).reduce((total, list) => total + (list?.length || 0), 0);

/** Human label for a chip, given the facet type and raw value. */
export const filterLabel = (type, value) => {
  if (type !== 'prices') return value;
  return PRICE_BUCKETS.find((b) => b.id === value)?.label ?? value;
};
