import AdminPageHeader from '@/components/admin/AdminPageHeader';
import OrdersClient from './OrdersClient';

export const metadata = { title: 'Orders — Admin — UMICO' };

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader title="Orders" subtitle="Manage and track customer orders" />
      <OrdersClient />
    </>
  );
}
