import mongoose from 'mongoose';

/**
 * Product bundle — multiple products sold together at a discounted price.
 * Gets its own card/page on the storefront.
 */
const ProductBundleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },

    products: {
      type: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
          variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
          quantity: { type: Number, default: 1, min: 1 },
        },
      ],
      default: [],
    },

    bundlePrice: { type: Number, required: true, min: 0 },

    // SEO
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductBundle ||
  mongoose.model('ProductBundle', ProductBundleSchema);
