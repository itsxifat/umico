/**
 * Consistent JSON response helpers for API routes.
 */

export function ok(data = null, meta = null) {
  const body = { success: true };
  if (data !== null) body.data = data;
  if (meta) body.meta = meta;
  return Response.json(body);
}

export function fail(message, { status = 400, errors = null, code = null } = {}) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (code) body.code = code;
  return Response.json(body, { status });
}

/**
 * Wrap an async handler so thrown errors become consistent JSON responses.
 * Errors with a `.status` property keep that status; others default to 500.
 */
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      console.error('[api] error:', err);
      return fail(err.message || 'Internal server error.', {
        status: err.status || 500,
        errors: err.errors || null,
      });
    }
  };
}
