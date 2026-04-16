import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import BrandsClient from './BrandsClient';

export const metadata = { title: 'Brands — UMICO Admin' };

export default function BrandsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Brands"
        subtitle="Manage imported cosmetic brands."
        action={<AdminBtn href="/admin/brands/new">+ New Brand</AdminBtn>}
      />
      <BrandsClient />
    </div>
  );
}
