import { getServerSession } from 'next-auth';
import { authOptions } from './options.js';
import dbConnect from '../db.js';
import User from '../models/User.js';
import { canAccessAdmin, hasPermission, ROLES } from '../permissions.js';

/**
 * Get the current session on the server (RSC, route handlers, etc.).
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Load the full User document for the current session.
 * Returns null if not logged in. Also enforces tokenVersion — if the
 * DB tokenVersion is higher than the session's, the session is
 * considered revoked (force-logout).
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return null;

  if ((user.tokenVersion || 0) > (session.user.tokenVersion || 0)) {
    return null; // force logout
  }

  if (user.status === 'banned' || user.status === 'suspended') return null;
  if (user.status === 'timeout' && user.timeoutUntil > new Date()) return null;

  return user;
}

/**
 * Require an authenticated user. Throws a 401-like error otherwise.
 * For use in API route handlers.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error('Authentication required.');
    err.status = 401;
    throw err;
  }
  return user;
}

/**
 * Require admin-panel access (superadmin/admin/staff).
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (!canAccessAdmin(user)) {
    const err = new Error('Forbidden.');
    err.status = 403;
    throw err;
  }
  return user;
}

/**
 * Require a specific permission. Super admin and admin pass through.
 */
export async function requirePermission(permission) {
  const user = await requireAdmin();
  if (!hasPermission(user, permission)) {
    const err = new Error('Missing required permission: ' + permission);
    err.status = 403;
    throw err;
  }
  return user;
}

/**
 * Require a specific role (strict match).
 */
export async function requireRole(role) {
  const user = await requireUser();
  if (user.role !== role) {
    const err = new Error('Forbidden.');
    err.status = 403;
    throw err;
  }
  return user;
}

export { ROLES };
