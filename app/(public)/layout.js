import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSiteSettings } from '@/lib/siteSettings';

export default async function PublicLayout({ children }) {
  const settings = await getSiteSettings();

  // Maintenance mode — block everything except /login, /admin
  if (settings?.maintenanceMode?.enabled) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 520 }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
            {settings.siteName || 'UMICO'}
          </h1>
          <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
            {settings.maintenanceMode.message || 'We\u2019ll be back soon.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <AnnouncementBar config={settings?.announcementBar} />
      <Header settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
