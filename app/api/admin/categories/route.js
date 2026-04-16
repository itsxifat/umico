import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { requireString, optionalString, slugify } from '@/lib/validation';
import { uniqueSlug, parsePagination, serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';
import { saveImage } from '@/lib/imageProcessor';

// GET /api/admin/categories
export const GET = handler(async (req) => {
  await requirePermission(PERMISSIONS.CATEGORIES_MANAGE);
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort, skip, limit, page } = parsePagination(sp, 'sortOrder');

  const filter = {};
  if (sp.get('status')) filter.status = sp.get('status');
  if (sp.get('parent') === 'null') filter.parent = null;
  else if (sp.get('parent')) filter.parent = sp.get('parent');

  const q = sp.get('q');
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { slug: { $regex: q, $options: 'i' } },
  ];

  const [docs, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit)
      .populate('parent', 'name slug').lean(),
    Category.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});

// POST /api/admin/categories  (create)
export const POST = handler(async (req) => {
  const admin = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE);
  await dbConnect();

  const ct = req.headers.get('content-type') || '';
  let name, slug, description, parentId, seoTitle, seoDescription, seoKeywords,
    status, sortOrder, imageFile;

  if (ct.includes('multipart/form-data')) {
    const form = await req.formData();
    name = form.get('name');
    slug = form.get('slug') || '';
    description = form.get('description') || '';
    parentId = form.get('parent') || null;
    seoTitle = form.get('seoTitle') || '';
    seoDescription = form.get('seoDescription') || '';
    seoKeywords = form.get('seoKeywords') ? JSON.parse(form.get('seoKeywords')) : [];
    status = form.get('status') || 'active';
    sortOrder = parseInt(form.get('sortOrder') || '0', 10);
    imageFile = form.get('image');
  } else {
    const body = await req.json().catch(() => ({}));
    ({ name, description = '', parentId = null,
      seoTitle = '', seoDescription = '', seoKeywords = [],
      status = 'active', sortOrder = 0 } = body);
    slug = body.slug || '';
  }

  name = requireString(name, 'name', { min: 1, max: 120 });
  description = optionalString(description, { max: 2000 });

  const finalSlug = slug
    ? await uniqueSlug(Category, slug)
    : await uniqueSlug(Category, name);

  let imagePath = '';
  if (imageFile && typeof imageFile.arrayBuffer === 'function') {
    const saved = await saveImage(imageFile, 'categories');
    imagePath = saved.url;
  }

  const doc = await Category.create({
    name,
    slug: finalSlug,
    description,
    image: imagePath,
    parent: parentId || null,
    seoTitle,
    seoDescription,
    seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
    status,
    sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
  });

  await logAction(admin, 'category.create', 'Category', doc._id, { name }, req);
  return ok(serialize(doc));
});
