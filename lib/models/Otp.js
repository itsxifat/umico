import mongoose from 'mongoose';

/**
 * OTP codes — short-lived, one-time email verification codes.
 * The plaintext code is never stored; only a bcrypt hash.
 */
const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['register', 'login', 'reset_password', 'change_email'],
      required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

// TTL index — Mongo will auto-delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
