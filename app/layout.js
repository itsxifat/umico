import { Playfair_Display, Inter } from 'next/font/google';
import { getSiteSettings, buildThemeStyle } from '@/lib/siteSettings';
import { getSession } from '@/lib/auth/session';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import SessionProvider from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const title = settings?.siteName || 'UMICO';
  const description =
    settings?.siteDescription ||
    settings?.tagline ||
    'UMICO — unisex cosmetics.';

  return {
    metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
    title: {
      default: title,
      template: `%s — ${title}`,
    },
    description,
    icons: settings?.favicon ? { icon: settings.favicon } : undefined,
    openGraph: {
      title,
      description,
      siteName: title,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function RootLayout({ children }) {
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getSession(),
  ]);
  const themeCss = buildThemeStyle(settings);

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      </head>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
