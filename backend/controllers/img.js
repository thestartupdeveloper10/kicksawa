const imgRouter = require('express').Router();
const logger = require('../utils/logger');

/*
 * Product photos live in Firebase Storage, whose download links take 2-5 s to
 * start responding and send `cache-control: private, max-age=0`, so browsers
 * re-download every photo on every visit. This route fetches each photo from
 * Firebase once, keeps it in memory, and serves it with a year-long cache.
 *
 * It only ever fetches from this shop's own bucket: a route that fetched any
 * URL it was given would let anyone use the server to reach other hosts.
 */

const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'kicksawa.appspot.com';
const ALLOWED_PREFIX = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/`;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_CACHE_BYTES = 64 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 20000;

// Least-recently-used: a Map iterates in insertion order, so re-inserting on
// each hit keeps the oldest entry first in line for eviction.
const cache = new Map(); // src -> { body, type }
let cachedBytes = 0;
const inflight = new Map(); // src -> Promise, so a burst of requests fetches once

const isAllowed = (src) => typeof src === 'string' && src.length < 2048 && src.startsWith(ALLOWED_PREFIX);

const remember = (src, entry) => {
  if (cache.has(src)) return;
  cache.set(src, entry);
  cachedBytes += entry.body.length;
  for (const [key, old] of cache) {
    if (cachedBytes <= MAX_CACHE_BYTES) break;
    cache.delete(key);
    cachedBytes -= old.body.length;
  }
};

/** Resolves { body, type } or throws an Error carrying a `status`. */
const fetchImage = async (src) => {
  const hit = cache.get(src);
  if (hit) {
    cache.delete(src);
    cache.set(src, hit);
    return hit;
  }
  if (inflight.has(src)) return inflight.get(src);

  const request = (async () => {
    // No redirects: Firebase does not use them, and following one could
    // lead outside the allowed bucket.
    const upstream = await fetch(src, { redirect: 'error', signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
    if (!upstream.ok) {
      throw Object.assign(new Error(`upstream ${upstream.status}`), { status: upstream.status === 404 ? 404 : 502 });
    }
    const type = upstream.headers.get('content-type') || '';
    if (!type.startsWith('image/')) {
      throw Object.assign(new Error(`not an image: ${type}`), { status: 502 });
    }
    const declared = Number(upstream.headers.get('content-length'));
    if (declared > MAX_IMAGE_BYTES) {
      throw Object.assign(new Error('image too large'), { status: 502 });
    }
    const body = Buffer.from(await upstream.arrayBuffer());
    if (body.length > MAX_IMAGE_BYTES) {
      throw Object.assign(new Error('image too large'), { status: 502 });
    }
    const entry = { body, type };
    remember(src, entry);
    return entry;
  })();

  inflight.set(src, request);
  try {
    return await request;
  } finally {
    inflight.delete(src);
  }
};

imgRouter.get('/', async (req, res) => {
  const { src } = req.query;
  if (!isAllowed(src)) {
    return res.status(400).json({ error: 'Only this shop\'s product images can be loaded here.' });
  }
  try {
    const { body, type } = await fetchImage(src);
    // Uploads get unique names, so a URL's contents never change.
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.type(type).send(body);
  } catch (error) {
    if (error.status !== 404) {
      logger.error('Image fetch failed:', error.message);
    }
    res.status(error.status || 502).end();
  }
});

/**
 * Fills the cache in the background so visitors find photos ready. Called at
 * startup with every product image; a few at a time so it does not swamp
 * Firebase or delay real requests.
 */
const warmImageCache = async (sources, concurrency = 4) => {
  const queue = [...new Set(sources.filter(isAllowed))];
  const started = Date.now();
  let failed = 0;
  const worker = async () => {
    while (queue.length > 0) {
      const src = queue.shift();
      try {
        await fetchImage(src);
      } catch {
        failed += 1;
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  logger.info(`Image cache warmed: ${cache.size} images, ${Math.round(cachedBytes / 1024)} KB, ${failed} failed, ${Math.round((Date.now() - started) / 1000)}s`);
};

module.exports = { imgRouter, warmImageCache, isAllowed };
