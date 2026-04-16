import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ReviewsClient from './ReviewsClient';

export const metadata = { title: 'Reviews — Admin — UMICO' };

export default function AdminReviewsPage() {
  return (
    <>
      <AdminPageHeader title="Reviews" subtitle="Moderate customer reviews" />
      <ReviewsClient />
    </>
  );
}
