import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import ProductForm from '../../ProductForm';

export const metadata = { title: 'Edit Product — UMICO Admin' };

export default async function EditProductPage({ params }) {
  await dbConnect();
  const doc = await Product.findById(params.id)
    .populate('brand', 'name')
    .populate('category', 'name')
    .lean();
  if (!doc) notFound();
  const initial = JSON.parse(JSON.stringify(doc));

  return (
    <div>
      <AdminPageHeader
        title={`Edit: ${initial.name}`}
        action={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <AdminBtn variant="secondary" href={`/product/${initial.slug}`} target="_blank">
              Preview ↗
            </AdminBtn>
            <AdminBtn variant="secondary" href="/admin/products">← Back</AdminBtn>
          </div>
        }
      />
      <ProductForm initial={initial} />
    </div>
  );
}
