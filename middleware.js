import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Edge middleware — runs before every request.
 *
 * Responsibilities:
 *   1. Guard /admin/* and /api/admin/* routes (requires admin/staff/superadmin).
 *   2. Guard /account/* routes (requires authenticated user).
 *   3. Handle banned / suspended / timed-out users at the edge.
 *
 * Detailed permission checks (e.g. "products.edit") live inside
 * individual API routes and server components via requirePermission().
 */

const ADMIN_ROLES = new Set(['superadmin', 'admin', 'staff']);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAccount = pathname.startsWith('/account');

  if (!isAdmin && !isAdminApi && !isAccount) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in
  if (!token) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Account status checks
  if (token.status === 'banned' || token.status === 'suspended') {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, message: 'Account restricted.' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/login?error=restricted', req.url));
  }

  // Admin route → must have admin role
  if (isAdmin || isAdminApi) {
    if (!ADMIN_ROLES.has(token.role)) {
      if (isAdminApi) {
        return NextResponse.json(
          { success: false, message: 'Forbidden.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*'],
};
