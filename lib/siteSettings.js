import dbConnect from './db.js';
import SiteSettings from './models/SiteSettings.js';

/**
 * Fetch (or lazily create) the global SiteSettings document.
 * Returns a plain object so it can be passed from server to client components.
 */
export async function getSiteSettings() {
  try {
    await dbConnect();
    let doc = await SiteSettings.findOne({ key: 'global' }).lean();
    if (!doc) {
      doc = await SiteSettings.create({ key: 'global' });
      doc = doc.toObject();
    }
    return serialize(doc);
  } catch (err) {
    console.warn('[siteSettings] fallback defaults:', err.message);
    // Graceful fallback if DB is unreachable during dev
    return serialize({
      key: 'global',
      siteName: 'UMICO',
      tagline: '',
      siteDescription: '',
      logoLight: '',
      logoDark: '',
      favicon: '',
      lightPalette: {},
      darkPalette: {},
      announcementBar: { enabled: false, text: '', link: '' },
      footerColumns: [],
      footerCopyright: '',
      socialLinks: [],
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      maintenanceMode: { enabled: false, message: '' },
    });
  }
}

function serialize(obj) {
  // Convert ObjectIds / Dates to strings so they're safe for RSC serialization
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Build an inline <style> snippet that overrides CSS variables with
 * whatever the admin has configured in SiteSettings. Empty fields fall
 * back to the defaults declared in variables.css.
 */
export function buildThemeStyle(settings) {
  const l = settings?.lightPalette || {};
  const d = settings?.darkPalette || {};

  const lightVars = [
    l.primary && `--color-primary: ${l.primary};`,
    l.secondary && `--color-secondary: ${l.secondary};`,
    l.accent && `--color-accent: ${l.accent};`,
    l.background && `--color-background: ${l.background};`,
    l.text && `--color-text: ${l.text};`,
  ]
    .filter(Boolean)
    .join('');

  const darkVars = [
    d.primary && `--color-primary: ${d.primary};`,
    d.secondary && `--color-secondary: ${d.secondary};`,
    d.accent && `--color-accent: ${d.accent};`,
    d.background && `--color-background: ${d.background};`,
    d.text && `--color-text: ${d.text};`,
  ]
    .filter(Boolean)
    .join('');

  let css = '';
  if (lightVars) css += `:root{${lightVars}}`;
  if (darkVars) css += `[data-theme='dark']{${darkVars}}`;
  return css;
}
