import mongoose from 'mongoose';

const StockLedgerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    // null if the product has no variants
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    variantLabel: { type: String, default: '' }, // human-readable snapshot

    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    change: { type: Number, required: true }, // +/- delta

    reason: {
      type: String,
      enum: [
        'manual_adjustment',
        'order_placed',
        'order_cancelled',
        'return_received',
        'bulk_import',
        'initial_stock',
      ],
      required: true,
      index: true,
    },
    note: { type: String, default: '' },

    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { timestamps: true }
);

StockLedgerSchema.index({ product: 1, createdAt: -1 });

export default mongoose.models.StockLedger ||
  mongoose.model('StockLedger', StockLedgerSchema);
