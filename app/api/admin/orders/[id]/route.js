import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { requirePermission } from '@/lib/auth/session';
import { PERMISSIONS } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';
import { logAction } from '@/lib/adminLog';

export const GET = handler(async (req, { params }) => {
  await requirePermission(PERMISSIONS.ORDERS_VIEW);
  await dbConnect();

  const order = await Order.findById(params.id)
    .populate('customer', 'name email phone')
    .lean();
  if (!order) return fail('Order not found.', { status: 404 });

  return ok(serialize(order));
});

export const PATCH = handler(async (req, { params }) => {
  const admin = await requirePermission(PERMISSIONS.ORDERS_UPDATE_STATUS);
  await dbConnect();

  const body = await req.json();
  const order = await Order.findById(params.id);
  if (!order) return fail('Order not found.', { status: 404 });

  if (body.orderStatus) {
    order.orderStatus = body.orderStatus;
    order.deliveryStatusUpdates.push({
      status: body.orderStatus,
      note: body.statusNote || '',
      source: 'manual',
    });
  }
  if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
  if (body.adminNote !== undefined) order.adminNote = body.adminNote;
  if (body.steadfastTrackingCode) order.steadfastTrackingCode = body.steadfastTrackingCode;
  if (body.steadfastConsignmentId) order.steadfastConsignmentId = body.steadfastConsignmentId;

  if (body.orderStatus === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = body.cancelReason || '';
    order.cancelledBy = admin._id;
  }

  await order.save();
  await logAction(admin, 'order.update', 'Order', order._id, { orderStatus: order.orderStatus }, req);

  const populated = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .lean();
  return ok(serialize(populated));
});
