import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import StockLedger from '@/lib/models/StockLedger';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';
import { saveImage, deleteImage } from '@/lib/imageProcessor';

export const GET = handler(async (req, { params }) => {
  await requirePermission(PERMISSIONS.PRODUCTS_VIEW);
  await dbConnect();
  const doc = await Product.findById(params.id)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .lean();
  if (!doc) return fail('Product not found.', { status: 404 });
  return ok(serialize(doc));
});

export const PATCH = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.PRODUCTS_EDIT);
  await dbConnect();
  const doc = await Product.findById(params.id);
  if (!doc) return fail('Product not found.', { status: 404 });

  const ct = req.headers.get('content-type') || '';
  let updates = {};
  let imageFiles = [];
  let imageAlts = [];

  if (ct.includes('multipart/form-data')) {
    const form = await req.formData();
    const keys = ['name','description','ingredients','howToUse','suitability','status',
      'isFeatured','isNewArrival','isBestSeller','seoTitle','seoDescription','sku','barcode',
      'price','compareAtPrice','stock','weight','lowStockThreshold','brand','category','subcategory'];
    for (const k of keys) {
      if (form.has(k)) updates[k] = form.get(k);
    }
    if (form.has('tags')) updates.tags = JSON.parse(form.get('tags'));
    if (form.has('seoKeywords')) updates.seoKeywords = JSON.parse(form.get('seoKeywords'));
    if (form.has('hasVariants')) updates.hasVariants = form.get('hasVariants') === 'true';
    if (form.has('variantDimensions')) updates.variantDimensions = JSON.parse(form.get('variantDimensions'));
    if (form.has('variants')) updates.variants = JSON.parse(form.get('variants'));
    imageFiles = form.getAll('images');
    imageAlts = form.has('imageAlts') ? JSON.parse(form.get('imageAlts')) : [];
  } else {
    updates = await req.json().catch(() => ({}));
  }

  // Coerce numeric fields
  for (const f of ['price','compareAtPrice','weight']) {
    if (updates[f] !== undefined) updates[f] = parseFloat(updates[f]);
  }
  for (const f of ['stock','lowStockThreshold']) {
    if (updates[f] !== undefined) {
      const oldQty = f === 'stock' ? (doc.stock || 0) : undefined;
      updates[f] = parseInt(updates[f], 10);
      if (f === 'stock' && oldQty !== undefined && updates.stock !== oldQty) {
        await StockLedger.create({
          product: doc._id, previousQuantity: oldQty,
          newQuantity: updates.stock, change: updates.stock - oldQty,
          reason: 'manual_adjustment', performedBy: admin._id,
        });
      }
    }
  }
  for (const f of ['isFeatured','isNewArrival','isBestSeller']) {
    if (typeof updates[f] === 'string') updates[f] = updates[f] === 'true';
  }

  // New images appended
  if (imageFiles.length > 0) {
    const newImages = [...doc.mainImages];
    for (let i = 0; i < imageFiles.length; i++) {
      const f = imageFiles[i];
      if (f && typeof f.arrayBuffer === 'function') {
        const saved = await saveImage(f, 'products');
        newImages.push({ url: saved.url, thumbnail: saved.thumbnail,
          medium: saved.medium, large: saved.large,
          alt: imageAlts[i] || '', sortOrder: newImages.length });
      }
    }
    updates.mainImages = newImages;
  }

  Object.assign(doc, updates);
  await doc.save();
  await logAction(admin, 'product.update', 'Product', doc._id, Object.keys(updates), req);
  return ok(serialize(doc.toObject()));
});

export const DELETE = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.PRODUCTS_DELETE);
  await dbConnect();
  const doc = await Product.findById(params.id);
  if (!doc) return fail('Product not found.', { status: 404 });
  // Delete all main images
  for (const img of doc.mainImages) await deleteImage(img.url).catch(() => {});
  await doc.deleteOne();
  await logAction(admin, 'product.delete', 'Product', params.id, { name: doc.name }, req);
  return ok({ deleted: true });
});
