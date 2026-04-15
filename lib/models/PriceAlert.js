import mongoose from 'mongoose';

/**
 * Customer-set price drop alert.
 * When the price of a product/variant falls at or below `targetPrice`,
 * the customer is emailed.
 */
const PriceAlertSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },

    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    targetPrice: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },

    notified: { type: Boolean, default: false, index: true },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.PriceAlert ||
  mongoose.model('PriceAlert', PriceAlertSchema);
