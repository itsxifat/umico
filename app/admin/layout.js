import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/permissions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';

export const metadata = {
  title: 'Admin — UMICO',
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) {
    redirect('/login?from=/admin');
  }

  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    role: user.role,
    permissions: user.permissions || [],
  };

  return (
    <div className="grid min-h-screen bg-surface-alt max-[900px]:grid-cols-1" style={{ gridTemplateColumns: '260px 1fr' }}>
      <AdminSidebar user={safeUser} />
      <div className="flex flex-col min-w-0">
        <AdminTopBar user={safeUser} />
        <div className="p-8 max-w-[1440px] w-full mx-auto flex-1 max-[640px]:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
