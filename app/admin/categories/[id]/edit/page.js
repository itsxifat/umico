import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import CategoryForm from '../../CategoryForm';

export const metadata = { title: 'Edit Category — UMICO Admin' };

export default async function EditCategoryPage({ params }) {
  await dbConnect();
  const doc = await Category.findById(params.id)
    .populate('parent', 'name slug')
    .lean();

  if (!doc) notFound();
  const initial = JSON.parse(JSON.stringify(doc));

  return (
    <div>
      <AdminPageHeader
        title={`Edit: ${initial.name}`}
        action={<AdminBtn variant="secondary" href="/admin/categories">← Back</AdminBtn>}
      />
      <CategoryForm initial={initial} />
    </div>
  );
}
