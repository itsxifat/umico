import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';

export const GET = handler(async (req, { params }) => {
  await requirePermission(PERMISSIONS.COUPONS_MANAGE);
  await dbConnect();

  const coupon = await Coupon.findById(params.id).lean();
  if (!coupon) return fail('Coupon not found.', { status: 404 });

  return ok(serialize(coupon));
});

export const PATCH = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.COUPONS_MANAGE);
  await dbConnect();

  const body = await req.json();
  const coupon = await Coupon.findById(params.id);
  if (!coupon) return fail('Coupon not found.', { status: 404 });

  const fields = ['description', 'type', 'value', 'minOrderAmount', 'maxDiscountAmount',
    'usageLimit', 'usagePerUser', 'validFrom', 'validUntil', 'status'];
  for (const f of fields) {
    if (body[f] !== undefined) coupon[f] = body[f];
  }

  await coupon.save();
  await logAction(admin, 'coupon.update', 'Coupon', coupon._id, { code: coupon.code }, req);
  return ok(serialize(coupon.toObject()));
});

export const DELETE = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.COUPONS_MANAGE);
  await dbConnect();

  const coupon = await Coupon.findByIdAndDelete(params.id);
  if (!coupon) return fail('Coupon not found.', { status: 404 });

  await logAction(admin, 'coupon.delete', 'Coupon', coupon._id, { code: coupon.code }, req);
  return ok({ deleted: true });
});
