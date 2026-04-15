import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { ok, handler } from '@/lib/apiResponse';
import { requireEmail, requireOtp, requireString } from '@/lib/validation';
import { verifyOtp } from '@/lib/auth/otp';
import { sendEmail } from '@/lib/email/sender';
import { welcomeEmail } from '@/lib/email/templates';
import { rateLimit, getIp } from '@/lib/rateLimit';

export const POST = handler(async (req) => {
  const ip = getIp(req);
  await rateLimit({ key: `verify-otp:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 });

  const body = await req.json().catch(() => ({}));

  const email = requireEmail(body.email);
  const code = requireOtp(body.code);
  const purpose = requireString(body.purpose, 'purpose', { min: 1, max: 32 });

  await verifyOtp({ email, code, purpose });

  if (purpose === 'register') {
    await dbConnect();
    const user = await User.findOne({ email });
    if (user && !user.emailVerified) {
      user.emailVerified = true;
      await user.save();
      try {
        const { subject, html } = welcomeEmail({ name: user.name });
        await sendEmail({ to: user.email, subject, html });
      } catch (e) {
        console.warn('[verify-otp] welcome email failed:', e.message);
      }
    }
  }

  return ok({ verified: true });
});
