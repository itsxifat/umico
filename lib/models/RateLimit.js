import mongoose from 'mongoose';

/**
 * MongoDB-backed rate limiter.
 * Each document is a single bucket keyed by `key` (typically
 * `${routeId}:${ipAddress}` or `${routeId}:${userId}`).
 * Documents auto-expire via TTL index.
 */
const RateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    windowStart: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit ||
  mongoose.model('RateLimit', RateLimitSchema);
