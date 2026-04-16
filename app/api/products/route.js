import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { ok, handler } from '@/lib/apiResponse';
import { serialize, parsePagination } from '@/lib/queryHelpers';

/**
 * GET /api/products — public product listing with filtering.
 * Used by shop page, category pages, brand pages, search results.
 */
export const GET = handler(async (req) => {
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort: defaultSort, skip, limit, page } = parsePagination(sp, 'createdAt');

  const filter = { status: 'active' };

  if (sp.get('category')) filter.category = sp.get('category');
  if (sp.get('brand')) filter.brand = sp.get('brand');
  if (sp.get('suitability')) filter.suitability = sp.get('suitability');
  if (sp.get('featured') === 'true') filter.isFeatured = true;
  if (sp.get('newArrival') === 'true') filter.isNewArrival = true;
  if (sp.get('bestSeller') === 'true') filter.isBestSeller = true;

  const minPrice = parseFloat(sp.get('minPrice') || '0');
  const maxPrice = parseFloat(sp.get('maxPrice') || '0');
  if (maxPrice > 0) filter.price = { $gte: minPrice, $lte: maxPrice };
  else if (minPrice > 0) filter.price = { $gte: minPrice };

  if (sp.get('q')) {
    filter.$or = [
      { name: { $regex: sp.get('q'), $options: 'i' } },
      { tags: { $regex: sp.get('q'), $options: 'i' } },
    ];
  }

  // Sort
  const sortBy = sp.get('sortBy') || 'newest';
  let sort;
  if (sortBy === 'price_asc') sort = { price: 1 };
  else if (sortBy === 'price_desc') sort = { price: -1 };
  else if (sortBy === 'best_selling') sort = { salesCount: -1 };
  else if (sortBy === 'highest_rated') sort = { averageRating: -1 };
  else sort = { createdAt: -1 };

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .sort(sort).skip(skip).limit(limit)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .select('name slug brand category mainImages price compareAtPrice stock suitability isFeatured isNewArrival isBestSeller averageRating reviewCount hasVariants lowStockThreshold')
      .lean(),
    Product.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});
