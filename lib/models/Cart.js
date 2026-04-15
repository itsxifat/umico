import mongoose from 'mongoose';

/**
 * Cart — persistent cart for logged-in users.
 * Guests use localStorage client-side and merge on login.
 * Also used for abandoned-cart tracking.
 */

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    quantity: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true }, // price when added
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [CartItemSchema], default: [] },
    couponCode: { type: String, default: '' },
    lastActivityAt: { type: Date, default: Date.now, index: true },

    // Abandoned-cart tracking
    abandonedReminderSentAt: { type: Date, default: null },
    recovered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
