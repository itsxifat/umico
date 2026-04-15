import mongoose from 'mongoose';
import crypto from 'crypto';

const NewsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
      index: true,
    },
    unsubscribeToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString('hex'),
      index: true,
    },
    source: { type: String, default: 'footer' }, // where they signed up
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Newsletter ||
  mongoose.model('Newsletter', NewsletterSchema);
