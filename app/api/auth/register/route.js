import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { ROLES } from '@/lib/permissions';
import { ok, fail, handler } from '@/lib/apiResponse';
import {
  requireString,
  requireEmail,
  requirePhone,
  requirePassword,
} from '@/lib/validation';
import { issueOtp } from '@/lib/auth/otp';
import { rateLimit, getIp } from '@/lib/rateLimit';

export const POST = handler(async (req) => {
  const ip = getIp(req);
  await rateLimit({ key: `register:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });

  const body = await req.json().catch(() => ({}));

  const name = requireString(body.name, 'name', { min: 2, max: 80 });
  const email = requireEmail(body.email);
  const phone = requirePhone(body.phone);
  const password = requirePassword(body.password);

  await dbConnect();

  const existing = await User.findOne({ email });
  if (existing && existing.emailVerified) {
    return fail('An account with this email already exists.', { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Determine role — bootstrap superadmin if env matches
  const isSuper =
    process.env.BOOTSTRAP_SUPERADMIN_EMAIL &&
    process.env.BOOTSTRAP_SUPERADMIN_EMAIL.toLowerCase() === email;

  if (existing) {
    // Unverified account — overwrite with new details
    existing.name = name;
    existing.phone = phone;
    existing.passwordHash = passwordHash;
    existing.role = isSuper ? ROLES.SUPER_ADMIN : existing.role;
    await existing.save();
  } else {
    await User.create({
      name,
      email,
      phone,
      passwordHash,
      emailVerified: false,
      role: isSuper ? ROLES.SUPER_ADMIN : ROLES.CUSTOMER,
    });
  }

  await issueOtp({ email, purpose: 'register', ipAddress: ip });

  return ok({ email });
});
