'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { PERMISSIONS } from '@/lib/permissions';
import styles from './AdminSidebar.module.css';

/**
 * Sidebar navigation for the admin panel.
 * Items hide themselves based on the current user's permissions.
 * (Super admin + admin always see everything.)
 */
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

  return (
    <>
      <button
        type="button"
        className={styles.mobileTrigger}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle admin menu"
      >
        ☰
      </button>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <Link href="/admin" className={styles.brandLink}>
            UMICO
          </Link>
          <span className={styles.brandLabel}>Admin</span>
        </div>

        <nav className={styles.nav} aria-label="Admin">
          {NAV_ITEMS.map((item, i) => {
            if (item.children) {
              const visible = item.children.filter((c) => hasAccess(user, c.perm));
              if (visible.length === 0) return null;
              return (
                <div key={i} className={styles.group}>
                  <div className={styles.groupHeading}>{item.heading}</div>
                  <ul>
                    {visible.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`${styles.link} ${
                            isActive(child.href, false) ? styles.active : ''
                          }`}
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
                className={`${styles.link} ${styles.topLink} ${
                  isActive(item.href, item.exact) ? styles.active : ''
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <Link href="/" className={styles.viewSite}>
            ← View site
          </Link>
        </div>
      </aside>
    </>
  );
}
