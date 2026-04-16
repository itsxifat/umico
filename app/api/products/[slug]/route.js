import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';

export const GET = handler(async (req, { params }) => {
  await dbConnect();

  const doc = await Product.findOne({ slug: params.slug, status: 'active' })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .lean();

  if (!doc) return fail('Product not found.', { status: 404 });

  // Increment view count (fire and forget)
  Product.findByIdAndUpdate(doc._id, { $inc: { viewCount: 1 } }).catch(() => {});

  return ok(serialize(doc));
});
