import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brand';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { requireString, optionalString } from '@/lib/validation';
import { uniqueSlug, serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';
import { saveImage, deleteImage } from '@/lib/imageProcessor';

export const GET = handler(async (req, { params }) => {
  await requirePermission(PERMISSIONS.BRANDS_MANAGE);
  await dbConnect();
  const doc = await Brand.findById(params.id).lean();
  if (!doc) return fail('Brand not found.', { status: 404 });
  return ok(serialize(doc));
});

export const PATCH = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.BRANDS_MANAGE);
  await dbConnect();
  const doc = await Brand.findById(params.id);
  if (!doc) return fail('Brand not found.', { status: 404 });

  const form = await req.formData().catch(() => null);
  const body = form ? null : await req.json().catch(() => ({}));

  const get = (key) => (form ? form.get(key) : body?.[key]);
  const updates = {};

  if (get('name') != null) updates.name = requireString(get('name'), 'name', { min: 1, max: 120 });
  if (get('slug') != null) updates.slug = await uniqueSlug(Brand, get('slug'), params.id);
  if (get('description') != null) updates.description = optionalString(get('description'), { max: 2000 });
  if (get('countryOfOrigin') != null) updates.countryOfOrigin = get('countryOfOrigin');
  if (get('website') != null) updates.website = get('website');
  if (get('categories') != null) updates.categories = JSON.parse(get('categories'));
  if (get('status') != null) updates.status = get('status');
  if (get('seoTitle') != null) updates.seoTitle = get('seoTitle');
  if (get('seoDescription') != null) updates.seoDescription = get('seoDescription');
  if (get('seoKeywords') != null) updates.seoKeywords = JSON.parse(get('seoKeywords'));

  const logoFile = form?.get('logo');
  if (logoFile && typeof logoFile.arrayBuffer === 'function') {
    if (doc.logo) await deleteImage(doc.logo).catch(() => {});
    const saved = await saveImage(logoFile, 'brands');
    updates.logo = saved.url;
  }

  Object.assign(doc, updates);
  await doc.save();
  await logAction(admin, 'brand.update', 'Brand', doc._id, updates, req);
  return ok(serialize(doc.toObject()));
});

export const DELETE = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.BRANDS_MANAGE);
  await dbConnect();
  const doc = await Brand.findById(params.id);
  if (!doc) return fail('Brand not found.', { status: 404 });
  await doc.deleteOne();
  if (doc.logo) await deleteImage(doc.logo).catch(() => {});
  await logAction(admin, 'brand.delete', 'Brand', params.id, { name: doc.name }, req);
  return ok({ deleted: true });
});
