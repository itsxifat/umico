import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/permissions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import styles from './layout.module.css';

export const metadata = {
  title: 'Admin — UMICO',
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) {
    redirect('/login?from=/admin');
  }

  // Strip down to what we need to pass to client components
  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    role: user.role,
    permissions: user.permissions || [],
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar user={safeUser} />
      <div className={styles.main}>
        <AdminTopBar user={safeUser} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
