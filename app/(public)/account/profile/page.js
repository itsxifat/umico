import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import ProfileForm from './ProfileForm';

export const metadata = { title: 'Profile — UMICO' };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?from=/account/profile');

  const safeUser = JSON.parse(JSON.stringify({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
  }));

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-text)] mx-auto">
      <h1 className="font-serif text-2xl mb-8">Edit Profile</h1>
      <ProfileForm user={safeUser} />
    </div>
  );
}
