import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import CategoriesClient from './CategoriesClient';

export const metadata = { title: 'Categories — UMICO Admin' };

export default function CategoriesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle="Manage product categories and hierarchy."
        action={<AdminBtn href="/admin/categories/new">+ New Category</AdminBtn>}
      />
      <CategoriesClient />
    </div>
  );
}
