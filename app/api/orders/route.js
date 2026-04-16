import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { getCurrentUser } from '@/lib/auth/session';
import { ok, fail, handler } from '@/lib/apiResponse';

function generateOrderId() {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `UMICO-${date}-${rand}`;
}

export const POST = handler(async (req) => {
  const user = await getCurrentUser();
  const body = await req.json();
  const { items, shippingAddress, paymentMethod, notes, subtotal, shippingCost, grandTotal } = body;

  if (!items?.length) return fail('Cart is empty.', { status: 400 });
  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.addressLine1 || !shippingAddress?.city) {
    return fail('Shipping address is incomplete.', { status: 400 });
  }
  if (!user) return fail('Please log in to place an order.', { status: 401 });

  await dbConnect();

  // Validate stock and build order items
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return fail(`Product "${item.productName}" not found.`, { status: 400 });

    if (product.hasVariants) {
      const variant = product.variants.find((v) => {
        if (!item.variant) return false;
        return Object.keys(item.variant).every((k) => v.dimensionValues?.get?.(k) === item.variant[k] || v.dimensionValues?.[k] === item.variant[k]);
      });
      if (variant && variant.stock < item.quantity) {
        return fail(`Insufficient stock for ${item.productName} (${item.variantLabel}).`, { status: 400 });
      }
      if (variant) variant.stock -= item.quantity;
    } else {
      if (product.stock < item.quantity) {
        return fail(`Insufficient stock for ${item.productName}.`, { status: 400 });
      }
      product.stock -= item.quantity;
    }

    product.soldCount = (product.soldCount || 0) + item.quantity;
    await product.save();

    orderItems.push({
      product: product._id,
      productName: item.productName,
      productImage: item.productImage || '',
      variantLabel: item.variantLabel || '',
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    });
  }

  const order = await Order.create({
    orderId: generateOrderId(),
    customer: user._id,
    items: orderItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      address: shippingAddress.addressLine1 + (shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''),
      city: shippingAddress.city,
      area: shippingAddress.area || '',
      postcode: shippingAddress.postalCode || '',
    },
    paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
    subtotal,
    shippingCost,
    total: grandTotal,
    customerNote: notes || '',
    orderStatus: 'pending',
    paymentStatus: 'pending',
  });

  return ok({ orderId: order.orderId, _id: order._id }, { status: 201 });
});
