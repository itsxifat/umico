import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import Order from '@/lib/models/Order';
import { requireUser, getCurrentUser } from '@/lib/auth/session';
import { ok, fail, handler } from '@/lib/apiResponse';
import { parsePagination, serialize } from '@/lib/queryHelpers';

// GET — public: get approved reviews for a product
export const GET = handler(async (req) => {
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const productId = sp.get('product');
  if (!productId) return fail('Product ID required.', { status: 400 });

  const { sort, skip, limit, page } = parsePagination(sp, 'createdAt');

  const filter = { product: productId, status: 'approved' };

  const [docs, total] = await Promise.all([
    Review.find(filter)
      .sort(sort).skip(skip).limit(limit)
      .populate('user', 'name avatar')
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Aggregate rating stats
  const stats = await Review.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
        r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  return ok(serialize(docs), {
    total, page, limit, pages: Math.ceil(total / limit),
    stats: stats[0] || { avg: 0, count: 0, r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 },
  });
});

// POST — submit a review (authenticated users only)
export const POST = handler(async (req) => {
  const user = await requireUser();
  await dbConnect();

  const { productId, rating, title, body: reviewBody } = await req.json();
  if (!productId || !rating) return fail('Product and rating are required.', { status: 400 });
  if (rating < 1 || rating > 5) return fail('Rating must be 1–5.', { status: 400 });

  // Check for existing review
  const existing = await Review.findOne({ product: productId, user: user._id });
  if (existing) return fail('You have already reviewed this product.', { status: 400 });

  // Check verified purchase
  const purchased = await Order.findOne({
    customer: user._id,
    'items.product': productId,
    orderStatus: 'delivered',
  });

  const review = await Review.create({
    product: productId,
    user: user._id,
    rating,
    title: title || '',
    body: reviewBody || '',
    verifiedPurchase: !!purchased,
    status: 'pending',
  });

  return ok(serialize(review.toObject()), { status: 201 });
});
