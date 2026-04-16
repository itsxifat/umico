'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

const fieldInputCls = 'py-3 border-b border-line-strong bg-transparent text-ink w-full transition-colors focus:outline-none focus:border-ink';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get('from') || '/';
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast(res.error === 'CredentialsSignin' ? 'Incorrect email or password.' : res.error, { type: 'error' });
      return;
    }
    router.push(from);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-xs tracking-wide uppercase text-muted-fg">Email</span>
        <input type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} className={fieldInputCls} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs tracking-wide uppercase text-muted-fg">Password</span>
        <input type="password" autoComplete="current-password" required value={password}
          onChange={(e) => setPassword(e.target.value)} className={fieldInputCls} />
      </label>
      <button type="submit" disabled={loading}
        className="mt-4 py-4 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <button type="button"
        className="py-4 bg-transparent text-ink border border-line-strong text-xs tracking-widest uppercase hover:border-ink transition-colors"
        onClick={() => signIn('google', { callbackUrl: from })}>
        Continue with Google
      </button>
      <p className="text-center text-sm text-muted mt-4">
        New here?{' '}
        <a href="/register" className="text-accent underline underline-offset-[3px]">Create an account</a>
      </p>
    </form>
  );
}
