'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import styles from './page.module.css';

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
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast(res.error === 'CredentialsSignin' ? 'Incorrect email or password.' : res.error, {
        type: 'error',
      });
      return;
    }
    router.push(from);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <label className={styles.field}>
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <button
        type="button"
        className={styles.google}
        onClick={() => signIn('google', { callbackUrl: from })}
      >
        Continue with Google
      </button>
      <p className={styles.foot}>
        New here? <a href="/register">Create an account</a>
      </p>
    </form>
  );
}
