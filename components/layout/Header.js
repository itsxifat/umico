import Link from 'next/link';
import dbConnect from '@/lib/db';
import NavigationMenu from '@/lib/models/NavigationMenu';
import ThemeToggle from './ThemeToggle';
import {
  MobileMenuButton,
  MobileMenuPanel,
  SearchButton,
  AccountButton,
  WishlistButton,
  CartButton,
} from './HeaderClient';

async function getHeaderMenu() {
  try {
    await dbConnect();
    const menu = await NavigationMenu.findOne({ location: 'header' }).lean();
    return menu?.items || [];
  } catch {
    return [];
  }
}

export default async function Header({ settings }) {
  const menuItems = await getHeaderMenu();
  const siteName = settings?.siteName || 'UMICO';

  return (
    <header className="sticky top-0 z-[var(--z-header)] bg-canvas border-b border-line backdrop-saturate-[180%] backdrop-blur-[12px]">
      <div className="grid items-center px-[var(--gutter)] py-5 max-w-[var(--max-w)] mx-auto gap-6 max-[640px]:px-4 max-[640px]:gap-3"
        style={{ gridTemplateColumns: '1fr auto 1fr' }}>
        {/* Left: mobile trigger + desktop nav */}
        <div className="flex items-center gap-5">
          <MobileMenuButton />
          <nav className="hidden min-[900px]:block" aria-label="Primary">
            {menuItems.length > 0 && (
              <ul className="flex items-center gap-8 text-xs tracking-widest uppercase">
                {menuItems.map((item, i) => (
                  <li key={i}>
                    <Link href={item.url || '#'} className="text-ink hover:opacity-65 transition-opacity">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>

        {/* Center: logo */}
        <Link href="/" className="justify-self-center inline-flex items-center gap-2" aria-label={siteName}>
          {settings?.logoLight ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoLight} alt={siteName} className="max-h-9 w-auto" />
          ) : (
            <span className="font-serif text-xl tracking-widest text-ink">{siteName}</span>
          )}
        </Link>

        {/* Right: icon buttons */}
        <div className="justify-self-end flex items-center gap-3 max-[640px]:gap-2">
          <SearchButton />
          <AccountButton />
          <WishlistButton />
          <CartButton />
          <ThemeToggle />
        </div>
      </div>

      <MobileMenuPanel menuItems={menuItems} />
    </header>
  );
}
