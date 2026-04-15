import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata = { title: 'Account' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?from=/account');

  return (
    <div style={{ padding: 'var(--s-12) var(--gutter)', maxWidth: 800, margin: '0 auto' }}>
      <p
        style={{
          fontSize: 'var(--fs-xs)',
          letterSpacing: 'var(--ls-widest)',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          marginBottom: 'var(--s-3)',
        }}
      >
        Account
      </p>
      <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--s-4)' }}>
        Welcome, {user.name}
      </h1>
      <p style={{ color: 'var(--color-muted)' }}>
        Your orders, wishlist, addresses, and settings will appear here once
        those features are built.
      </p>
    </div>
  );
}
