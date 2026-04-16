import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import CategoryForm from '../CategoryForm';

export const metadata = { title: 'New Category — UMICO Admin' };

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader
        title="New Category"
        action={<AdminBtn variant="secondary" href="/admin/categories">← Back</AdminBtn>}
      />
      <CategoryForm />
    </div>
  );
}
