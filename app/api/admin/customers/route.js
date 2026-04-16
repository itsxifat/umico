import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, handler } from '@/lib/apiResponse';
import { parsePagination, serialize } from '@/lib/queryHelpers';

export const GET = handler(async (req) => {
  await requirePermission(PERMISSIONS.CUSTOMERS_VIEW);
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort, skip, limit, page } = parsePagination(sp, 'createdAt');

  const filter = {};
  const role = sp.get('role');
  if (role) filter.role = role;
  else filter.role = 'customer';

  const st = sp.get('status');
  if (st) filter.status = st;

  const q = sp.get('q');
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    User.find(filter)
      .sort(sort).skip(skip).limit(limit)
      .select('name email phone role status createdAt lastLoginAt avatar')
      .lean(),
    User.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});
