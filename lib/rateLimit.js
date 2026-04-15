import dbConnect from './db.js';
import RateLimit from './models/RateLimit.js';

/**
 * MongoDB-backed fixed-window rate limiter.
 *
 * @param {Object} options
 * @param {string} options.key      Unique bucket key (e.g. `login:${ip}`)
 * @param {number} options.limit    Max calls allowed in the window
 * @param {number} options.windowMs Window length in ms
 *
 * Throws a 429-status Error if the bucket is exhausted.
 */
export async function rateLimit({ key, limit, windowMs }) {
  await dbConnect();

  const now = Date.now();
  const expiresAt = new Date(now + windowMs);

  const doc = await RateLimit.findOneAndUpdate(
    { key },
    {
      $setOnInsert: {
        key,
        windowStart: new Date(now),
        expiresAt,
      },
      $inc: { count: 1 },
    },
    { upsert: true, new: true }
  );

  // If the existing window has expired, reset it atomically.
  if (doc.windowStart.getTime() + windowMs < now) {
    doc.count = 1;
    doc.windowStart = new Date(now);
    doc.expiresAt = expiresAt;
    await doc.save();
    return;
  }

  if (doc.count > limit) {
    const err = new Error('Too many requests. Please slow down.');
    err.status = 429;
    throw err;
  }
}

/**
 * Extract a best-effort IP from a Next.js Request.
 */
export function getIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
