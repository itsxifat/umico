import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brand';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, handler } from '@/lib/apiResponse';
import { requireString, optionalString } from '@/lib/validation';
import { uniqueSlug, parsePagination, serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';
import { saveImage } from '@/lib/imageProcessor';

export const GET = handler(async (req) => {
  await requirePermission(PERMISSIONS.BRANDS_MANAGE);
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort, skip, limit, page } = parsePagination(sp, 'name');

  const filter = {};
  if (sp.get('status')) filter.status = sp.get('status');
  const q = sp.get('q');
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { slug: { $regex: q, $options: 'i' } },
  ];

  const [docs, total] = await Promise.all([
    Brand.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Brand.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = handler(async (req) => {
  const admin = await requirePermission(PERMISSIONS.BRANDS_MANAGE);
  await dbConnect();

  const form = await req.formData();
  const name = requireString(form.get('name'), 'name', { min: 1, max: 120 });
  const slugInput = form.get('slug') || '';
  const description = optionalString(form.get('description'), { max: 2000 });
  const countryOfOrigin = optionalString(form.get('countryOfOrigin'));
  const website = optionalString(form.get('website'), { max: 500 });
  const categories = form.get('categories') ? JSON.parse(form.get('categories')) : [];
  const seoTitle = optionalString(form.get('seoTitle'), { max: 160 });
  const seoDescription = optionalString(form.get('seoDescription'), { max: 320 });
  const seoKeywords = form.get('seoKeywords') ? JSON.parse(form.get('seoKeywords')) : [];
  const status = form.get('status') || 'active';
  const logoFile = form.get('logo');

  const finalSlug = slugInput
    ? await uniqueSlug(Brand, slugInput)
    : await uniqueSlug(Brand, name);

  let logoPath = '';
  if (logoFile && typeof logoFile.arrayBuffer === 'function') {
    const saved = await saveImage(logoFile, 'brands');
    logoPath = saved.url;
  }

  const doc = await Brand.create({
    name, slug: finalSlug, logo: logoPath, description,
    countryOfOrigin, website, categories, seoTitle,
    seoDescription, seoKeywords, status,
  });

  await logAction(admin, 'brand.create', 'Brand', doc._id, { name }, req);
  return ok(serialize(doc.toObject()));
});
