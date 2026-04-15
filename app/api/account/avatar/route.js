import { handler, ok } from '@/lib/apiResponse';
import { requireUser } from '@/lib/auth/session';
import { saveImage, deleteImage } from '@/lib/imageProcessor';

export const runtime = 'nodejs';

/**
 * POST /api/account/avatar — upload/replace the current user's avatar.
 */
export const POST = handler(async (req) => {
  const user = await requireUser();

  const form = await req.formData();
  const file = form.get('file');

  const result = await saveImage(file, 'avatars');

  if (user.avatar) {
    try {
      await deleteImage(user.avatar);
    } catch {
      /* ignore */
    }
  }

  user.avatar = result.url;
  await user.save();

  return ok({ avatar: result.url });
});
