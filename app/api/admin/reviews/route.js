import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { parsePagination, serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';

export const GET = handler(async (req) => {
  await requirePermission(PERMISSIONS.REVIEWS_MANAGE);
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort, skip, limit, page } = parsePagination(sp, 'createdAt');

  const filter = {};
  if (sp.get('status')) filter.status = sp.get('status');
  if (sp.get('product')) filter.product = sp.get('product');

  const [docs, total] = await Promise.all([
    Review.find(filter)
      .sort(sort).skip(skip).limit(limit)
      .populate('user', 'name email')
      .populate('product', 'name slug mainImages')
      .lean(),
    Review.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});

export const PATCH = handler(async (req) => {
  const admin = await requirePermission(PERMISSIONS.REVIEWS_MANAGE);
  await dbConnect();

  const { id, status, reply } = await req.json();
  if (!id) return fail('Review ID required.', { status: 400 });

  const review = await Review.findById(id);
  if (!review) return fail('Review not found.', { status: 404 });

  if (status) review.status = status;
  if (reply !== undefined) {
    review.reply = {
      body: reply,
      repliedBy: admin._id,
      repliedAt: new Date(),
    };
  }

  await review.save();
  await logAction(admin, 'review.update', 'Review', review._id, { status: review.status }, req);

  return ok(serialize(review.toObject()));
});
