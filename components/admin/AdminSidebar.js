'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PERMISSIONS } from '@/lib/permissions';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  {
    heading: 'Catalog',
    children: [
      { href: '/admin/products', label: 'Products', perm: PERMISSIONS.PRODUCTS_VIEW },
      { href: '/admin/categories', label: 'Categories', perm: PERMISSIONS.CATEGORIES_MANAGE },
      { href: '/admin/brands', label: 'Brands', perm: PERMISSIONS.BRANDS_MANAGE },
      { href: '/admin/inventory', label: 'Inventory', perm: PERMISSIONS.INVENTORY_VIEW },
      { href: '/admin/flash-sales', label: 'Flash Sales' },
      { href: '/admin/bundles', label: 'Bundles' },
    ],
  },
  {
    heading: 'Sales',
    children: [
      { href: '/admin/orders', label: 'Orders', perm: PERMISSIONS.ORDERS_VIEW },
      { href: '/admin/returns', label: 'Returns', perm: PERMISSIONS.RETURNS_VIEW },
      { href: '/admin/coupons', label: 'Coupons', perm: PERMISSIONS.COUPONS_MANAGE },
      { href: '/admin/delivery', label: 'Delivery', perm: PERMISSIONS.DELIVERY_MANAGE },
    ],
  },
  {
    heading: 'People',
    children: [
      { href: '/admin/customers', label: 'Customers', perm: PERMISSIONS.CUSTOMERS_VIEW },
      { href: '/admin/reviews', label: 'Reviews', perm: PERMISSIONS.REVIEWS_MANAGE },
      { href: '/admin/staff', label: 'Staff', perm: PERMISSIONS.STAFF_MANAGE },
      { href: '/admin/newsletter', label: 'Newsletter' },
    ],
  },
  {
    heading: 'Content',
    children: [
      { href: '/admin/home', label: 'Home Page', perm: PERMISSIONS.CONTENT_EDIT },
      { href: '/admin/legal', label: 'Legal Pages', perm: PERMISSIONS.CONTENT_EDIT },
      { href: '/admin/navigation', label: 'Navigation', perm: PERMISSIONS.CONTENT_EDIT },
      { href: '/admin/faq', label: 'FAQ', perm: PERMISSIONS.CONTENT_EDIT },
      { href: '/admin/contact-messages', label: 'Contact Messages' },
    ],
  },
  {
    heading: 'Analytics',
    children: [
      { href: '/admin/reports', label: 'Reports', perm: PERMISSIONS.REPORTS_VIEW },
      { href: '/admin/search-analytics', label: 'Search Analytics' },
      { href: '/admin/activity-log', label: 'Activity Log' },
    ],
  },
  {
    heading: 'Settings',
    children: [
      { href: '/admin/branding', label: 'Branding', perm: PERMISSIONS.SETTINGS_EDIT },
      { href: '/admin/settings', label: 'Site Settings', perm: PERMISSIONS.SETTINGS_EDIT },
    ],
  },
];

function hasAccess(user, perm) {
  if (!perm) return true;
  if (user.role === 'superadmin' || user.role === 'admin') return true;
  return (user.permissions || []).includes(perm);
}

export default function AdminSidebar({ user }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const linkBase = 'block py-2 px-3 text-sm text-muted-fg border-l-2 border-transparent transition-all hover:text-ink hover:opacity-100';
  const linkActive = 'text-ink bg-surface-alt border-l-accent';

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        className="hidden max-[900px]:inline-flex fixed top-4 left-4 z-[calc(var(--z-modal))] w-10 h-10 bg-surface border border-line items-center justify-center text-xl"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle admin menu"
      >
        ☰
      </button>

      <aside className={`sticky top-0 h-screen overflow-y-auto bg-surface border-r border-line py-6 flex flex-col max-[900px]:fixed max-[900px]:inset-y-0 max-[900px]:left-0 max-[900px]:w-[280px] max-[900px]:z-[calc(var(--z-modal)-1)] max-[900px]:transition-transform max-[900px]:duration-300 ${mobileOpen ? 'max-[900px]:translate-x-0' : 'max-[900px]:-translate-x-full'}`}>
        {/* Brand mark */}
        <div className="flex items-baseline gap-2 px-6 pb-8 border-b border-line mb-6">
          <Link href="/admin" className="font-serif text-xl tracking-widest text-ink">
            UMICO
          </Link>
          <span className="text-[10px] tracking-widest uppercase text-muted">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 flex flex-col gap-6" aria-label="Admin">
          {NAV_ITEMS.map((item, i) => {
            if (item.children) {
              const visible = item.children.filter((c) => hasAccess(user, c.perm));
              if (visible.length === 0) return null;
              return (
                <div key={i} className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold tracking-widest uppercase text-muted px-3 pb-2">
                    {item.heading}
                  </div>
                  <ul className="flex flex-col">
                    {visible.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`${linkBase} ${isActive(child.href, false) ? linkActive : ''}`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkBase} py-3 font-medium ${isActive(item.href, item.exact) ? linkActive : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 pt-6 border-t border-line mt-6">
          <Link href="/" className="text-xs tracking-wide text-muted">
            ← View site
          </Link>
        </div>
      </aside>
    </>
  );
}
