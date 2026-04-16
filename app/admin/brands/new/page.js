import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import BrandForm from '../BrandForm';

export const metadata = { title: 'New Brand — UMICO Admin' };

export default function NewBrandPage() {
  return (
    <div>
      <AdminPageHeader
        title="New Brand"
        action={<AdminBtn variant="secondary" href="/admin/brands">← Back</AdminBtn>}
      />
      <BrandForm />
    </div>
  );
}
