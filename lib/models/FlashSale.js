import mongoose from 'mongoose';

/**
 * Time-limited flash sale. Admin picks products and an override
 * price (either percentage off or fixed sale price) plus a
 * start/end datetime. During the window, storefront shows
 * the discounted price with a countdown.
 */
const FlashSaleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_price'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const FlashSaleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },

    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },

    items: { type: [FlashSaleItemSchema], default: [] },

    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended', 'cancelled'],
      default: 'scheduled',
      index: true,
    },

    banner: { type: String, default: '' }, // optional promo image
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.FlashSale ||
  mongoose.model('FlashSale', FlashSaleSchema);
