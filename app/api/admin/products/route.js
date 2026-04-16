import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, handler } from '@/lib/apiResponse';
import { requireString } from '@/lib/validation';
import { uniqueSlug, parsePagination, serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';
import { saveImage } from '@/lib/imageProcessor';

// GET /api/admin/products
export const GET = handler(async (req) => {
  await requirePermission(PERMISSIONS.PRODUCTS_VIEW);
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort, skip, limit, page } = parsePagination(sp, 'createdAt');

  const filter = {};
  if (sp.get('status')) filter.status = sp.get('status');
  if (sp.get('brand')) filter.brand = sp.get('brand');
  if (sp.get('category')) filter.category = sp.get('category');
  if (sp.get('featured') === 'true') filter.isFeatured = true;
  if (sp.get('newArrival') === 'true') filter.isNewArrival = true;
  if (sp.get('bestSeller') === 'true') filter.isBestSeller = true;

  const q = sp.get('q');
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { sku: { $regex: q, $options: 'i' } },
    { tags: { $regex: q, $options: 'i' } },
  ];

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .sort(sort).skip(skip).limit(limit)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .select('-variants') // exclude variant details from list view
      .lean(),
    Product.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});

// POST /api/admin/products  (create)
export const POST = handler(async (req) => {
  const admin = await requirePermission(PERMISSIONS.PRODUCTS_CREATE);
  await dbConnect();

  const form = await req.formData();

  const name = requireString(form.get('name'), 'name', { min: 1, max: 300 });
  const slugInput = form.get('slug') || '';
  const brandId = requireString(form.get('brand'), 'brand');
  const categoryId = requireString(form.get('category'), 'category');
  const subcategoryId = form.get('subcategory') || null;

  const description = form.get('description') || '';
  const ingredients = form.get('ingredients') || '';
  const howToUse = form.get('howToUse') || '';
  const suitability = form.get('suitability') || 'everyone';
  const status = form.get('status') || 'draft';
  const isFeatured = form.get('isFeatured') === 'true';
  const isNewArrival = form.get('isNewArrival') === 'true';
  const isBestSeller = form.get('isBestSeller') === 'true';
  const seoTitle = form.get('seoTitle') || '';
  const seoDescription = form.get('seoDescription') || '';
  const seoKeywords = form.get('seoKeywords') ? JSON.parse(form.get('seoKeywords')) : [];
  const tags = form.get('tags') ? JSON.parse(form.get('tags')) : [];
  const hasVariants = form.get('hasVariants') === 'true';
  const variantDimensions = form.get('variantDimensions')
    ? JSON.parse(form.get('variantDimensions')) : [];
  const variants = form.get('variants') ? JSON.parse(form.get('variants')) : [];

  // Non-variant fields
  const price = parseFloat(form.get('price') || '0');
  const compareAtPrice = parseFloat(form.get('compareAtPrice') || '0');
  const stock = parseInt(form.get('stock') || '0', 10);
  const sku = form.get('sku') || '';
  const barcode = form.get('barcode') || '';
  const weight = parseFloat(form.get('weight') || '0');
  const lowStockThreshold = parseInt(form.get('lowStockThreshold') || '5', 10);

  const finalSlug = slugInput
    ? await uniqueSlug(Product, slugInput)
    : await uniqueSlug(Product, name);

  // Process uploaded main images
  const mainImages = [];
  const imageFiles = form.getAll('images');
  const imageAlts = form.get('imageAlts') ? JSON.parse(form.get('imageAlts')) : [];
  for (let i = 0; i < imageFiles.length; i++) {
    const f = imageFiles[i];
    if (f && typeof f.arrayBuffer === 'function') {
      const saved = await saveImage(f, 'products');
      mainImages.push({
        url: saved.url,
        thumbnail: saved.thumbnail,
        medium: saved.medium,
        large: saved.large,
        alt: imageAlts[i] || '',
        sortOrder: i,
      });
    }
  }

  const doc = await Product.create({
    name, slug: finalSlug, brand: brandId, category: categoryId,
    subcategory: subcategoryId, description, ingredients, howToUse,
    suitability, mainImages, seoTitle, seoDescription, seoKeywords,
    status, isFeatured, isNewArrival, isBestSeller, tags,
    hasVariants, variantDimensions, variants,
    price, compareAtPrice, stock, sku, barcode, weight, lowStockThreshold,
  });

  await logAction(admin, 'product.create', 'Product', doc._id, { name }, req);
  return ok(serialize(doc.toObject()));
});
