import mongoose from 'mongoose';

/**
 * LegalPage — stores the content for every "static" content page
 * (privacy policy, terms, return policy, shipping policy,
 * about us, contact us, FAQ landing, etc.).
 *
 * Each page is referenced by a stable `slug`. Empty by default —
 * customer-facing views show an empty state until admin fills it in.
 */
const LegalPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      // e.g. 'privacy-policy', 'terms', 'return-policy', 'shipping-policy',
      //      'about', 'contact', 'faq'
    },
    title: { type: String, default: '' },
    content: { type: String, default: '' }, // rich text (HTML)

    // SEO
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },

    published: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.models.LegalPage ||
  mongoose.model('LegalPage', LegalPageSchema);
