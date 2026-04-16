'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useToast } from '@/components/providers/ToastProvider';

export default function VerifyOtpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const email = search.get('email') || '';
  const purpose = search.get('purpose') || 'email_verification';
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast('Please enter the 6-digit code.', { type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, purpose }),
      });
      const json = await res.json();
      if (json.success) {
        toast('Email verified! You can now sign in.', { type: 'success' });
        router.push('/login');
      } else {
        toast(json.message || 'Verification failed.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      });
      const json = await res.json();
      if (json.success) {
        toast('New code sent! Check your email.', { type: 'success' });
      } else {
        toast(json.message || 'Could not resend code.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs tracking-wide uppercase text-muted-fg">Email</span>
        <p className="text-sm text-ink">{email || '—'}</p>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-xs tracking-wide uppercase text-muted-fg">6-digit code</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="py-3 border-b border-line-strong bg-transparent text-ink text-center text-2xl tracking-[0.5em] font-mono w-full focus:outline-none focus:border-ink"
          autoComplete="one-time-code"
          placeholder="000000"
        />
      </label>
      <button type="submit" disabled={loading}
        className="mt-2 py-4 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
        {loading ? 'Verifying…' : 'Verify email'}
      </button>
      <p className="text-center text-sm text-muted mt-2">
        Didn&apos;t get a code?{' '}
        <button type="button" onClick={resend} disabled={resending}
          className="text-accent underline underline-offset-[3px] disabled:opacity-50">
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </p>
    </form>
  );
}
