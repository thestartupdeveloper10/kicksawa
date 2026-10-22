/*
 * Product photos in the shop's Firebase bucket load through the API's image
 * cache (/api/img), which serves them fast and cacheable; see
 * backend/controllers/img.js. Mirrors kicksawa/src/lib/image.js.
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const BUCKET_PREFIX = 'https://firebasestorage.googleapis.com/v0/b/kicksawa.appspot.com/o/';

export const imageSrc = (src) =>
  typeof src === 'string' && src.startsWith(BUCKET_PREFIX)
    ? `${API_BASE}/img?src=${encodeURIComponent(src)}`
    : src;

/** Firebase serves uploads with no caching unless told otherwise. */
export const UPLOAD_METADATA = { cacheControl: 'public, max-age=31536000, immutable' };
