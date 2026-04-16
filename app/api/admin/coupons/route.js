import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { parsePagination, serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';

export const GET = handler(async (req) => {
  await requirePermission(PERMISSIONS.COUPONS_MANAGE);
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const { sort, skip, limit, page } = parsePagination(sp, 'createdAt');

  const filter = {};
  if (sp.get('status')) filter.status = sp.get('status');

  const q = sp.get('q');
  if (q) {
    filter.$or = [
      { code: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    Coupon.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);

  return ok(serialize(docs), { total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = handler(async (req) => {
  const admin = await requirePermission(PERMISSIONS.COUPONS_MANAGE);
  await dbConnect();

  const body = await req.json();
  if (!body.code || !body.type || body.value === undefined) {
    return fail('Code, type and value are required.', { status: 400 });
  }

  const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
  if (existing) return fail('Coupon code already exists.', { status: 400 });

  const coupon = await Coupon.create({
    code: body.code.toUpperCase(),
    description: body.description || '',
    type: body.type,
    value: body.value,
    minOrderAmount: body.minOrderAmount || 0,
    maxDiscountAmount: body.maxDiscountAmount || 0,
    usageLimit: body.usageLimit || 0,
    usagePerUser: body.usagePerUser || 1,
    validFrom: body.validFrom || new Date(),
    validUntil: body.validUntil || null,
    status: body.status || 'active',
    createdBy: admin._id,
  });

  await logAction(admin, 'coupon.create', 'Coupon', coupon._id, { code: coupon.code }, req);
  return ok(serialize(coupon.toObject()), { status: 201 });
});
