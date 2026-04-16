import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, handler } from '@/lib/apiResponse';
import { parsePagination, serialize } from '@/lib/queryHelpers';

export const GET = handler(async (req) => {
  await requirePermission(PERMISSIONS.ORDERS_VIEW);
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort, skip, limit, page } = parsePagination(sp, 'createdAt');

  const filter = {};
  if (sp.get('status')) filter.orderStatus = sp.get('status');
  if (sp.get('payment')) filter.paymentStatus = sp.get('payment');

  const q = sp.get('q');
  if (q) {
    filter.$or = [
      { orderId: { $regex: q, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: q, $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    Order.find(filter)
      .sort(sort).skip(skip).limit(limit)
      .populate('customer', 'name email phone')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});
