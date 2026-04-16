import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import Review from '@/lib/models/Review';
import { requireAdmin } from '@/lib/auth/session';
import Link from 'next/link';

export const metadata = { title: 'Dashboard — UMICO Admin' };

async function getStats() {
  await dbConnect();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ordersToday,
    ordersMonth,
    revenueMonth,
    pendingOrders,
    totalCustomers,
    newCustomersMonth,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    pendingReviews,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.countDocuments({ createdAt: { $gte: monthStart } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, orderStatus: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ orderStatus: 'pending' }),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: monthStart } }),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'active', stock: { $gt: 0, $lte: 5 }, hasVariants: false }),
    Product.countDocuments({ status: 'active', stock: 0, hasVariants: false }),
    Review.countDocuments({ status: 'pending' }),
  ]);

  return {
    ordersToday,
    ordersMonth,
    revenueMonth: revenueMonth[0]?.total || 0,
    pendingOrders,
    totalCustomers,
    newCustomersMonth,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    pendingReviews,
  };
}

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getStats();

  const cards = [
    { label: 'Orders today', value: stats.ordersToday, href: '/admin/orders' },
    { label: 'Orders this month', value: stats.ordersMonth, href: '/admin/orders' },
    { label: 'Revenue this month', value: formatPrice(stats.revenueMonth), href: '/admin/orders' },
    { label: 'Pending orders', value: stats.pendingOrders, href: '/admin/orders', highlight: stats.pendingOrders > 0 },
    { label: 'Total customers', value: stats.totalCustomers, href: '/admin/customers' },
    { label: 'New customers (month)', value: stats.newCustomersMonth, href: '/admin/customers' },
    { label: 'Active products', value: stats.totalProducts, href: '/admin/products' },
    { label: 'Low stock items', value: stats.lowStockProducts, href: '/admin/products', highlight: stats.lowStockProducts > 0 },
    { label: 'Out of stock', value: stats.outOfStockProducts, href: '/admin/products', highlight: stats.outOfStockProducts > 0 },
    { label: 'Pending reviews', value: stats.pendingReviews, href: '/admin/reviews', highlight: stats.pendingReviews > 0 },
  ];

  return (
    <div>
      <div className="mb-12">
        <p className="text-xs tracking-widest uppercase text-accent mb-3">Dashboard</p>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-serif mb-3">Overview</h1>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-surface border border-line p-6 flex flex-col gap-3 min-h-[140px] hover:border-line-strong transition-colors group">
            <div className="text-xs tracking-widest uppercase text-muted">{card.label}</div>
            <div className={`font-serif text-3xl mt-auto ${card.highlight ? 'text-warning' : 'text-ink'}`}>
              {card.value}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/products/new', label: 'New product' },
            { href: '/admin/orders', label: 'View orders' },
            { href: '/admin/coupons/new', label: 'Create coupon' },
            { href: '/admin/reviews', label: 'Moderate reviews' },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="px-5 py-3 border border-line-strong text-xs tracking-widest uppercase text-muted-fg hover:text-ink hover:border-ink transition-colors">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
