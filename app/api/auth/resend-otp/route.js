import { ok, handler } from '@/lib/apiResponse';
import { requireEmail, requireString } from '@/lib/validation';
import { issueOtp } from '@/lib/auth/otp';
import { rateLimit, getIp } from '@/lib/rateLimit';

export const POST = handler(async (req) => {
  const ip = getIp(req);
  await rateLimit({ key: `resend-otp:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });

  const body = await req.json().catch(() => ({}));
  const email = requireEmail(body.email);
  const purpose = requireString(body.purpose, 'purpose', { min: 1, max: 32 });

  await rateLimit({ key: `resend-otp:${email}`, limit: 3, windowMs: 10 * 60 * 1000 });

  await issueOtp({ email, purpose, ipAddress: ip });
  return ok({ sent: true });
});
