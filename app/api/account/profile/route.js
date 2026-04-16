import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireUser } from '@/lib/auth/session';
import { ok, fail, handler } from '@/lib/apiResponse';
import bcrypt from 'bcryptjs';

export const PATCH = handler(async (req) => {
  const session = await requireUser();
  const { name, phone, currentPassword, newPassword } = await req.json();

  await dbConnect();
  const user = await User.findById(session._id);
  if (!user) return fail('User not found.', { status: 404 });

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  if (newPassword) {
    if (!currentPassword) return fail('Current password is required.', { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return fail('Current password is incorrect.', { status: 400 });
    if (newPassword.length < 8) return fail('New password must be at least 8 characters.', { status: 400 });
    user.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await user.save();
  return ok({ message: 'Profile updated.' });
});
