import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import ProductsClient from './ProductsClient';

export const metadata = { title: 'Products — UMICO Admin' };

export default function ProductsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle="All products in your catalog."
        action={<AdminBtn href="/admin/products/new">+ New Product</AdminBtn>}
      />
      <ProductsClient />
    </div>
  );
}
