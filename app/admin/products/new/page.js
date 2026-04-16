import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import ProductForm from '../ProductForm';

export const metadata = { title: 'New Product — UMICO Admin' };

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="New Product"
        action={<AdminBtn variant="secondary" href="/admin/products">← Back</AdminBtn>}
      />
      <ProductForm />
    </div>
  );
}
