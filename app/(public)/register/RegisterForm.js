'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

const fieldCls = 'flex flex-col gap-2';
const labelCls = 'text-xs tracking-wide uppercase text-muted-fg';
const inputCls = 'py-3 border-b border-line-strong bg-transparent text-ink w-full transition-colors focus:outline-none focus:border-ink';

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast('Passwords do not match.', { type: 'error' });
      return;
    }
    if (password.length < 8) {
      toast('Password must be at least 8 characters.', { type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const json = await res.json();
      if (json.success) {
        toast('Account created! Check your email for the verification code.', { type: 'success' });
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=email_verification`);
      } else {
        toast(json.message || 'Registration failed.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className={fieldCls}>
        <span className={labelCls}>Full name</span>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className={inputCls} autoComplete="name" />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}>Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className={inputCls} autoComplete="email" />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}>Phone (optional)</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          className={inputCls} autoComplete="tel" />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}>Password</span>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className={inputCls} autoComplete="new-password" />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}>Confirm password</span>
        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputCls} autoComplete="new-password" />
      </label>
      <button type="submit" disabled={loading}
        className="mt-4 py-4 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
        {loading ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-center text-sm text-muted mt-2">
        Already have an account?{' '}
        <a href="/login" className="text-accent underline underline-offset-[3px]">Sign in</a>
      </p>
    </form>
  );
}
