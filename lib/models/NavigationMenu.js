import mongoose from 'mongoose';

/**
 * Header navigation & mega-menu structure. A document per location
 * (`location: 'header' | 'mobile' | 'footer'`). Items are nested
 * up to 2 levels deep for mega-menu dropdowns.
 */
const MenuItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, default: '' },
    icon: { type: String, default: '' },
    openInNewTab: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    children: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const NavigationMenuSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      enum: ['header', 'mobile', 'footer'],
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [MenuItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.NavigationMenu ||
  mongoose.model('NavigationMenu', NavigationMenuSchema);
