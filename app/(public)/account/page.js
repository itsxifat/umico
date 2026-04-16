import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import Link from 'next/link';

export const metadata = { title: 'My Account — UMICO' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?from=/account');

  const sections = [
    { href: '/account/orders', label: 'My Orders', desc: 'View order history and track deliveries' },
    { href: '/account/wishlist', label: 'Wishlist', desc: 'Products you saved for later' },
    { href: '/account/addresses', label: 'Addresses', desc: 'Manage delivery addresses' },
    { href: '/account/profile', label: 'Profile', desc: 'Update name, email, and password' },
  ];

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto">
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase text-accent mb-2">Account</p>
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}
            className="border border-line bg-surface p-6 flex flex-col gap-2 hover:border-line-strong transition-colors group">
            <h2 className="font-serif text-lg text-ink group-hover:text-accent transition-colors">{s.label}</h2>
            <p className="text-sm text-muted">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
