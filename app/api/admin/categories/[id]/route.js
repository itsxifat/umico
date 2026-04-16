import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { requireString, optionalString } from '@/lib/validation';
import { uniqueSlug, serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';
import { saveImage, deleteImage } from '@/lib/imageProcessor';

// GET /api/admin/categories/[id]
export const GET = handler(async (req, { params }) => {
  await requirePermission(PERMISSIONS.CATEGORIES_MANAGE);
  await dbConnect();
  const doc = await Category.findById(params.id).populate('parent', 'name slug').lean();
  if (!doc) return fail('Category not found.', { status: 404 });
  return ok(serialize(doc));
});

// PATCH /api/admin/categories/[id]  (update)
export const PATCH = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE);
  await dbConnect();

  const doc = await Category.findById(params.id);
  if (!doc) return fail('Category not found.', { status: 404 });

  const ct = req.headers.get('content-type') || '';
  let updates = {};
  let imageFile = null;

  if (ct.includes('multipart/form-data')) {
    const form = await req.formData();
    if (form.has('name')) updates.name = form.get('name');
    if (form.has('slug')) updates.slug = form.get('slug');
    if (form.has('description')) updates.description = form.get('description');
    if (form.has('parent')) updates.parent = form.get('parent') || null;
    if (form.has('seoTitle')) updates.seoTitle = form.get('seoTitle');
    if (form.has('seoDescription')) updates.seoDescription = form.get('seoDescription');
    if (form.has('seoKeywords')) updates.seoKeywords = JSON.parse(form.get('seoKeywords'));
    if (form.has('status')) updates.status = form.get('status');
    if (form.has('sortOrder')) updates.sortOrder = parseInt(form.get('sortOrder'), 10);
    imageFile = form.get('image');
  } else {
    updates = await req.json().catch(() => ({}));
  }

  if (updates.name) {
    updates.name = requireString(updates.name, 'name', { min: 1, max: 120 });
  }
  if (updates.slug !== undefined) {
    updates.slug = await uniqueSlug(Category, updates.slug || doc.name, params.id);
  } else if (updates.name) {
    // Don't auto-change slug on name edits — only if slug is explicitly sent
  }

  if (imageFile && typeof imageFile.arrayBuffer === 'function') {
    if (doc.image) await deleteImage(doc.image).catch(() => {});
    const saved = await saveImage(imageFile, 'categories');
    updates.image = saved.url;
  }

  Object.assign(doc, updates);
  await doc.save();

  await logAction(admin, 'category.update', 'Category', doc._id, updates, req);
  return ok(serialize(doc.toObject()));
});

// DELETE /api/admin/categories/[id]
export const DELETE = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE);
  await dbConnect();

  const doc = await Category.findById(params.id);
  if (!doc) return fail('Category not found.', { status: 404 });

  // Check for child categories
  const childCount = await Category.countDocuments({ parent: params.id });
  if (childCount > 0) {
    return fail(`Cannot delete — this category has ${childCount} child categories.`, { status: 409 });
  }

  await doc.deleteOne();
  if (doc.image) await deleteImage(doc.image).catch(() => {});

  await logAction(admin, 'category.delete', 'Category', params.id, { name: doc.name }, req);
  return ok({ deleted: true });
});
