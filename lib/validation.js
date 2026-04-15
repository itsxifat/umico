/**
 * Tiny hand-rolled validation helpers — no dependencies.
 * Throws on the first failure so route handlers can catch uniformly.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9\s\-()]{6,20}$/;

export function assert(cond, message, status = 400) {
  if (!cond) {
    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

export function requireString(value, field, { min = 1, max = 10_000 } = {}) {
  assert(typeof value === 'string', `${field} must be a string.`);
  const v = value.trim();
  assert(v.length >= min, `${field} must be at least ${min} characters.`);
  assert(v.length <= max, `${field} must be at most ${max} characters.`);
  return v;
}

export function requireEmail(value, field = 'email') {
  const v = requireString(value, field, { max: 320 }).toLowerCase();
  assert(EMAIL_RE.test(v), 'Please enter a valid email address.');
  return v;
}

export function requirePhone(value, field = 'phone') {
  const v = requireString(value, field, { min: 6, max: 20 });
  assert(PHONE_RE.test(v), 'Please enter a valid phone number.');
  return v;
}

export function requirePassword(value, field = 'password') {
  assert(typeof value === 'string', `${field} must be a string.`);
  assert(value.length >= 8, 'Password must be at least 8 characters.');
  assert(value.length <= 200, 'Password is too long.');
  return value;
}

export function requireOtp(value, field = 'code') {
  assert(typeof value === 'string', `${field} is required.`);
  const v = value.trim();
  assert(/^[0-9]{6}$/.test(v), 'Enter the 6-digit verification code.');
  return v;
}

export function optionalString(value, { max = 1000 } = {}) {
  if (value == null || value === '') return '';
  assert(typeof value === 'string', 'Expected a string.');
  const v = value.trim();
  assert(v.length <= max, `Value too long (max ${max}).`);
  return v;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
