import mongoose from 'mongoose';

/**
 * UserActivity — tracks logins, daily visits, and purchases with
 * IP + device + (approximate) geo info. Used by the admin
 * customer-detail page and for analytics.
 */
const UserActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['login', 'daily_visit', 'purchase', 'logout'],
      required: true,
      index: true,
    },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    device: {
      type: { type: String, default: '' }, // 'desktop' | 'mobile' | 'tablet'
      os: { type: String, default: '' },
      browser: { type: String, default: '' },
      screenResolution: { type: String, default: '' },
    },
    location: {
      country: { type: String, default: '' },
      city: { type: String, default: '' },
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: null }, // e.g. orderId on 'purchase'
  },
  { timestamps: true }
);

UserActivitySchema.index({ user: 1, createdAt: -1 });
UserActivitySchema.index({ createdAt: -1 });

export default mongoose.models.UserActivity ||
  mongoose.model('UserActivity', UserActivitySchema);
