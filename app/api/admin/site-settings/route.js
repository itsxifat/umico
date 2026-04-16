import dbConnect from '@/lib/db';
import SiteSettings from '@/lib/models/SiteSettings';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, handler } from '@/lib/apiResponse';
import { logAction } from '@/lib/adminLog';
import { saveImage } from '@/lib/imageProcessor';

export const GET = handler(async () => {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);
  await dbConnect();
  let doc = await SiteSettings.findOne({ key: 'global' }).lean();
  if (!doc) doc = await SiteSettings.create({ key: 'global' });
  return ok(JSON.parse(JSON.stringify(doc)));
});

export const PATCH = handler(async (req) => {
  const admin = await requirePermission(PERMISSIONS.SETTINGS_EDIT);
  await dbConnect();

  let doc = await SiteSettings.findOne({ key: 'global' });
  if (!doc) doc = await SiteSettings.create({ key: 'global' });

  const ct = req.headers.get('content-type') || '';
  let updates = {};

  if (ct.includes('multipart/form-data')) {
    const form = await req.formData();

    const textFields = ['siteName','tagline','siteDescription','fontSerif','fontSans',
      'contactEmail','contactPhone','contactAddress','footerCopyright',
      'defaultSeoTitle','defaultSeoDescription','robotsTxt',
      'googleAnalyticsId','facebookPixelId','primaryCurrency','secondaryCurrency'];
    for (const f of textFields) {
      if (form.has(f)) updates[f] = form.get(f);
    }
    const numFields = ['secondaryExchangeRate','globalLowStockThreshold',
      'freeShippingMinimum','flatShippingRate'];
    for (const f of numFields) {
      if (form.has(f)) updates[f] = parseFloat(form.get(f));
    }
    const boolFields = ['hideOutOfStock'];
    for (const f of boolFields) {
      if (form.has(f)) updates[f] = form.get(f) === 'true';
    }
    const jsonFields = ['lightPalette','darkPalette','announcementBar','footerColumns',
      'socialLinks','maintenanceMode','defaultSeoKeywords'];
    for (const f of jsonFields) {
      if (form.has(f)) updates[f] = JSON.parse(form.get(f));
    }

    // Logo uploads
    const logoLight = form.get('logoLight');
    const logoDark = form.get('logoDark');
    const favicon = form.get('favicon');
    if (logoLight && typeof logoLight.arrayBuffer === 'function') {
      const s = await saveImage(logoLight, 'misc');
      updates.logoLight = s.url;
    }
    if (logoDark && typeof logoDark.arrayBuffer === 'function') {
      const s = await saveImage(logoDark, 'misc');
      updates.logoDark = s.url;
    }
    if (favicon && typeof favicon.arrayBuffer === 'function') {
      const s = await saveImage(favicon, 'misc');
      updates.favicon = s.url;
    }
  } else {
    updates = await req.json().catch(() => ({}));
  }

  Object.assign(doc, updates);
  await doc.save();
  await logAction(admin, 'settings.update', 'SiteSettings', doc._id, Object.keys(updates), req);
  return ok(JSON.parse(JSON.stringify(doc.toObject())));
});
