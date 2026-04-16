import AdminPageHeader from '@/components/admin/AdminPageHeader';
import CustomersClient from './CustomersClient';

export const metadata = { title: 'Customers — Admin — UMICO' };

export default function AdminCustomersPage() {
  return (
    <>
      <AdminPageHeader title="Customers" subtitle="View and manage customer accounts" />
      <CustomersClient />
    </>
  );
}
