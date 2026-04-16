import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Link from 'next/link';
import AddressesClient from './AddressesClient';

export const metadata = { title: 'Addresses — UMICO' };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?from=/account/addresses');

  await dbConnect();
  const fullUser = await User.findById(user._id).select('addresses').lean();
  const addresses = JSON.parse(JSON.stringify(fullUser?.addresses || []));

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-muted mb-6 tracking-wide">
        <Link href="/account" className="hover:text-ink transition-colors">Account</Link>
        <span>/</span>
        <span className="text-muted-fg">Addresses</span>
      </nav>
      <h1 className="font-serif text-2xl mb-8">My Addresses</h1>
      <AddressesClient initialAddresses={addresses} />
    </div>
  );
}
