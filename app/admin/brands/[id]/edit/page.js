import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brand';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import BrandForm from '../../BrandForm';

export const metadata = { title: 'Edit Brand — UMICO Admin' };

export default async function EditBrandPage({ params }) {
  await dbConnect();
  const doc = await Brand.findById(params.id).lean();
  if (!doc) notFound();
  const initial = JSON.parse(JSON.stringify(doc));

  return (
    <div>
      <AdminPageHeader
        title={`Edit: ${initial.name}`}
        action={<AdminBtn variant="secondary" href="/admin/brands">← Back</AdminBtn>}
      />
      <BrandForm initial={initial} />
    </div>
  );
}
