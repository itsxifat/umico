import mongoose from 'mongoose';

/**
 * SiteSettings — singleton document.
 * Holds everything the admin can edit globally: brand colors, fonts,
 * logos, favicon, social links, announcement bar, footer, SEO defaults,
 * analytics IDs, robots.txt content, maintenance mode.
 *
 * Access pattern: always fetch the single document with:
 *   SiteSettings.findOne({ key: 'global' })
 */

const PaletteSchema = new mongoose.Schema(
  {
    primary: { type: String, default: '' },
    secondary: { type: String, default: '' },
    accent: { type: String, default: '' },
    background: { type: String, default: '' },
    text: { type: String, default: '' },
  },
  { _id: false }
);

const SocialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, default: '' }, // 'instagram', 'facebook', etc.
    url: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const SiteSettingsSchema = new mongoose.Schema(
  {
    // Singleton key — always 'global'
    key: { type: String, default: 'global', unique: true, index: true },

    // ─── Brand identity ───
    siteName: { type: String, default: 'UMICO' },
    tagline: { type: String, default: '' },
    siteDescription: { type: String, default: '' },

    // ─── Logos & favicon (local upload paths) ───
    logoLight: { type: String, default: '' },
    logoDark: { type: String, default: '' },
    favicon: { type: String, default: '' },

    // ─── Branding colors ───
    lightPalette: { type: PaletteSchema, default: () => ({}) },
    darkPalette: { type: PaletteSchema, default: () => ({}) },

    // ─── Typography ───
    fontSerif: { type: String, default: '' },
    fontSans: { type: String, default: '' },

    // ─── Announcement bar (top of site) ───
    announcementBar: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: '' },
      link: { type: String, default: '' },
    },

    // ─── Footer ───
    footerColumns: {
      type: [
        {
          heading: { type: String, default: '' },
          links: [
            {
              label: { type: String, default: '' },
              url: { type: String, default: '' },
            },
          ],
        },
      ],
      default: [],
    },
    footerCopyright: { type: String, default: '' },

    // ─── Social links (also used in contact/footer) ───
    socialLinks: { type: [SocialLinkSchema], default: [] },

    // ─── Contact info ───
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },

    // ─── SEO defaults (used as fallback) ───
    defaultSeoTitle: { type: String, default: '' },
    defaultSeoDescription: { type: String, default: '' },
    defaultSeoKeywords: { type: [String], default: [] },
    defaultOgImage: { type: String, default: '' },

    // ─── Analytics ───
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },

    // ─── robots.txt (editable) ───
    robotsTxt: { type: String, default: 'User-agent: *\nAllow: /' },

    // ─── Maintenance mode ───
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: '' },
    },

    // ─── Currency ───
    primaryCurrency: { type: String, default: 'BDT' },
    secondaryCurrency: { type: String, default: '' },
    secondaryExchangeRate: { type: Number, default: 0 },

    // ─── Catalog display options ───
    hideOutOfStock: { type: Boolean, default: false },

    // ─── Global low-stock alert threshold (can be overridden per variant) ───
    globalLowStockThreshold: { type: Number, default: 5 },

    // ─── Shipping settings ───
    freeShippingMinimum: { type: Number, default: 0 },
    flatShippingRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model('SiteSettings', SiteSettingsSchema);
