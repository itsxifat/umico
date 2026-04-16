import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import CouponsClient from './CouponsClient';

export const metadata = { title: 'Coupons — Admin — UMICO' };

export default function AdminCouponsPage() {
  return (
    <>
      <AdminPageHeader
        title="Coupons"
        subtitle="Create and manage discount codes"
        action={<AdminBtn href="/admin/coupons/new">+ New coupon</AdminBtn>}
      />
      <CouponsClient />
    </>
  );
}
