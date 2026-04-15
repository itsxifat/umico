/**
 * UMICO — RBAC Permissions
 *
 * Single source of truth for role & permission strings.
 * Used by:
 *   - User model (validation)
 *   - Middleware guards
 *   - Admin UI permission checkboxes
 */

export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

export const ROLE_VALUES = Object.values(ROLES);

/**
 * Granular permissions a staff member can hold.
 * Admins and super admins implicitly hold every permission.
 */
export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',

  // Orders
  ORDERS_VIEW: 'orders.view',
  ORDERS_UPDATE_STATUS: 'orders.update_status',
  ORDERS_CANCEL: 'orders.cancel',

  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_BAN: 'customers.ban',
  CUSTOMERS_EDIT: 'customers.edit',

  // Catalog
  CATEGORIES_MANAGE: 'categories.manage',
  BRANDS_MANAGE: 'brands.manage',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',

  // Returns
  RETURNS_VIEW: 'returns.view',
  RETURNS_PROCESS: 'returns.process',

  // Content
  CONTENT_EDIT: 'content.edit',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',

  // Staff management
  STAFF_MANAGE: 'staff.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',

  // Coupons
  COUPONS_MANAGE: 'coupons.manage',

  // Delivery
  DELIVERY_MANAGE: 'delivery.manage',

  // Reviews
  REVIEWS_MANAGE: 'reviews.manage',
};

export const PERMISSION_VALUES = Object.values(PERMISSIONS);

/**
 * Check whether a user document has a given permission.
 * - superadmin and admin always return true
 * - staff checks against `user.permissions` array
 * - customer always returns false
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) return true;
  if (user.role !== ROLES.STAFF) return false;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

/**
 * Check whether a user can access the admin panel at all.
 */
export function canAccessAdmin(user) {
  if (!user) return false;
  return (
    user.role === ROLES.SUPER_ADMIN ||
    user.role === ROLES.ADMIN ||
    user.role === ROLES.STAFF
  );
}
