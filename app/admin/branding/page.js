import dbConnect from '@/lib/db';
import SiteSettings from '@/lib/models/SiteSettings';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import BrandingClient from './BrandingClient';

export const metadata = { title: 'Branding — UMICO Admin' };

export default async function BrandingPage() {
  await dbConnect();
  let settings = await SiteSettings.findOne({ key: 'global' }).lean();
  if (!settings) settings = {};
  const initial = JSON.parse(JSON.stringify(settings));
  return (
    <div>
      <AdminPageHeader
        title="Branding & Settings"
        subtitle="Colors, fonts, logos, and site identity."
      />
      <BrandingClient initial={initial} />
    </div>
  );
}
