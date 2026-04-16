import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';

export const GET = handler(async (req) => {
  const sp = req.nextUrl.searchParams;
  const q = sp.get('q');
  if (!q || q.trim().length < 2) return fail('Search query too short.', { status: 400 });

  await dbConnect();

  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const limit = Math.min(40, Math.max(1, parseInt(sp.get('limit') || '20', 10)));
  const skip = (page - 1) * limit;

  const filter = {
    status: 'active',
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
    ],
  };

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .sort({ soldCount: -1, createdAt: -1 })
      .skip(skip).limit(limit)
      .select('name slug price compareAtPrice mainImages averageRating reviewCount stock')
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit), query: q });
});
