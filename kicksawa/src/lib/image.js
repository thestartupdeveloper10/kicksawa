/*
 * Product photos are stored in Firebase Storage, which is slow to start
 * sending (2-5 s) and tells browsers not to cache. The API keeps a copy and
 * serves it with a year-long cache, so photos from the shop's bucket are
 * loaded through it. Anything else (Unsplash, local files) loads directly.
 */
const BUCKET_PREFIX = 'https://firebasestorage.googleapis.com/v0/b/kicksawa.appspot.com/o/';

export const imageSrc = (src) =>
  typeof src === 'string' && src.startsWith(BUCKET_PREFIX)
    ? `/api/img?src=${encodeURIComponent(src)}`
    : src;

/** Start downloading images ahead of need, when the browser is idle. */
export const prefetchImages = (sources) => {
  const run = () =>
    sources.filter(Boolean).forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = imageSrc(src);
    });
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2000 });
  else setTimeout(run, 200);
};
