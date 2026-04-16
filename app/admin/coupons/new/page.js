import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminBtn from '@/components/admin/AdminBtn';
import CouponForm from './CouponForm';

export const metadata = { title: 'New Coupon — Admin — UMICO' };

export default function NewCouponPage() {
  return (
    <>
      <AdminPageHeader
        title="New Coupon"
        subtitle="Create a new discount code"
        action={<AdminBtn href="/admin/coupons" variant="secondary">← Back</AdminBtn>}
      />
      <CouponForm />
    </>
  );
}
