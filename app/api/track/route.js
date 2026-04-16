import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';

export const GET = handler(async (req) => {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) return fail('Order ID is required.', { status: 400 });

  await dbConnect();
  const order = await Order.findOne({ orderId })
    .select('orderId orderStatus paymentMethod paymentStatus total items.productName items.quantity createdAt deliveryStatusUpdates')
    .lean();

  if (!order) return fail('Order not found.', { status: 404 });

  return ok(serialize(order));
});
