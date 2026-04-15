import mongoose from 'mongoose';

/**
 * HomeSection — flexible, orderable sections for the home page.
 * Each section has a `type` that determines how it's rendered
 * and `content` (Mixed) that holds the data.
 *
 * Types (type string → rendered component):
 *   'hero'            → hero slider / banner
 *   'featured_categories'
 *   'new_arrivals'
 *   'best_sellers'
 *   'featured_brands'
 *   'promotional_banner'
 *   'testimonials'
 *   'newsletter'
 *   'instagram'
 *   'rich_text'       → free-form editorial block
 *   'product_grid'    → curated product list
 */
const HomeSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },

    enabled: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },

    // Free-form content (structure depends on type)
    content: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Optional product list (for curated grids)
    products: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.HomeSection ||
  mongoose.model('HomeSection', HomeSectionSchema);
