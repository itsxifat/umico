import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Otp from '../models/Otp.js';
import { sendEmail } from '../email/sender.js';
import { otpEmail } from '../email/templates.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically random 6-digit OTP string.
 */
export function generateOtpCode() {
  // Uniform 0..999999 via rejection sampling
  const max = 1_000_000;
  const bound = 256 ** 4 - (256 ** 4 % max);
  let n;
  do {
    n = crypto.randomBytes(4).readUInt32BE(0);
  } while (n >= bound);
  return String(n % max).padStart(6, '0');
}

/**
 * Create and email an OTP for the given email + purpose.
 * Invalidates previous unconsumed OTPs for the same (email, purpose).
 */
export async function issueOtp({ email, purpose, ipAddress = '' }) {
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);

  // Invalidate previous OTPs of same purpose
  await Otp.updateMany(
    { email: email.toLowerCase(), purpose, consumed: false },
    { $set: { consumed: true } }
  );

  await Otp.create({
    email: email.toLowerCase(),
    codeHash,
    purpose,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    ipAddress,
  });

  const { subject, html } = otpEmail({ code, purpose });
  await sendEmail({ to: email, subject, html });

  return true;
}

/**
 * Verify a submitted OTP code. Returns true on success,
 * throws an Error with a user-friendly message on failure.
 */
export async function verifyOtp({ email, code, purpose }) {
  const record = await Otp.findOne({
    email: email.toLowerCase(),
    purpose,
    consumed: false,
  }).sort({ createdAt: -1 });

  if (!record) throw new Error('No active verification code.');
  if (record.expiresAt < new Date()) throw new Error('Verification code has expired.');
  if (record.attempts >= MAX_ATTEMPTS) {
    throw new Error('Too many attempts. Request a new code.');
  }

  const ok = await bcrypt.compare(code, record.codeHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new Error('Incorrect code.');
  }

  record.consumed = true;
  await record.save();
  return true;
}
