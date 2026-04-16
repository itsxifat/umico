import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Link from 'next/link';

export const metadata = { title: 'My Orders — UMICO' };

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

const STATUS_COLORS = {
  pending: 'text-warning',
  confirmed: 'text-accent',
  processing: 'text-accent',
  shipped: 'text-success',
  in_transit: 'text-success',
  delivered: 'text-success',
  cancelled: 'text-error',
  returned: 'text-muted',
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?from=/account/orders');

  await dbConnect();
  const orders = await Order.find({ customer: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const safeOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-muted mb-6 tracking-wide">
        <Link href="/account" className="hover:text-ink transition-colors">Account</Link>
        <span>/</span>
        <span className="text-muted-fg">Orders</span>
      </nav>
      <h1 className="font-serif text-2xl mb-8">My Orders</h1>

      {safeOrders.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-xl text-muted mb-4">No orders yet</p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 transition-opacity">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {safeOrders.map((order) => (
            <div key={order._id} className="border border-line bg-surface p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-sm font-medium text-ink">{order.orderId}</span>
                  <span className="text-xs text-muted ml-3">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className={`text-xs tracking-wide uppercase font-medium ${STATUS_COLORS[order.orderStatus] || 'text-muted'}`}>
                  {order.orderStatus?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.items?.slice(0, 4).map((item, i) => (
                  <div key={i} className="w-12 h-12 bg-surface-alt border border-line flex-shrink-0">
                    {item.productImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div className="w-12 h-12 bg-surface-alt border border-line flex items-center justify-center text-xs text-muted">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{order.items?.length || 0} items</span>
                <span className="font-medium text-ink">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
