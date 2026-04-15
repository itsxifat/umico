import mongoose from 'mongoose';

/**
 * Back-in-stock email subscription.
 * When a product/variant is out of stock, a customer can enter
 * their email and be notified once it's restocked.
 */
const BackInStockSubscriptionSchema = new mongoose.Schema(
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

    notified: { type: Boolean, default: false, index: true },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BackInStockSubscriptionSchema.index(
  { product: 1, variantId: 1, email: 1 },
  { unique: true }
);

export default mongoose.models.BackInStockSubscription ||
  mongoose.model('BackInStockSubscription', BackInStockSubscriptionSchema);
