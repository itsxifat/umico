import { handler, ok } from '@/lib/apiResponse';
import { requireAdmin } from '@/lib/auth/session';
import { saveImage } from '@/lib/imageProcessor';

export const runtime = 'nodejs';

/**
 * POST /api/upload
 *
 * Multipart form fields:
 *   file   — the image
 *   folder — one of: products | brands | categories | banners |
 *            avatars | returns | legal | misc
 *
 * Admin-only. Returns the saved URLs for the 4 derivatives.
 */
export const POST = handler(async (req) => {
  await requireAdmin();

  const form = await req.formData();
  const file = form.get('file');
  const folder = String(form.get('folder') || 'misc');

  const result = await saveImage(file, folder);
  return ok(result);
});
