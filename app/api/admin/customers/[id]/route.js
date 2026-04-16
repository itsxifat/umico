import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';

export const GET = handler(async (req, { params }) => {
  await requirePermission(PERMISSIONS.CUSTOMERS_VIEW);
  await dbConnect();

  const user = await User.findById(params.id)
    .select('-passwordHash -tokenVersion')
    .lean();
  if (!user) return fail('Customer not found.', { status: 404 });

  const orderStats = await Order.aggregate([
    { $match: { customer: user._id } },
    { $group: { _id: null, count: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
  ]);

  return ok(serialize({
    ...user,
    orderCount: orderStats[0]?.count || 0,
    totalSpent: orderStats[0]?.totalSpent || 0,
  }));
});

export const PATCH = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.CUSTOMERS_EDIT);
  await dbConnect();

  const body = await req.json();
  const user = await User.findById(params.id);
  if (!user) return fail('Customer not found.', { status: 404 });

  if (body.status) user.status = body.status;
  if (body.banReason !== undefined) user.banReason = body.banReason;
  if (body.role && ['customer', 'staff'].includes(body.role)) user.role = body.role;
  if (body.tags) user.tags = body.tags;

  await user.save();
  await logAction(admin, 'customer.update', 'User', user._id, { status: user.status }, req);

  return ok(serialize(user.toObject()));
});
