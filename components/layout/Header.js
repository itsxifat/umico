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
import styles from './Header.module.css';

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
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <MobileMenuButton />
          <nav className={styles.desktopNav} aria-label="Primary">
            {menuItems.length === 0 ? null : (
              <ul className={styles.navList}>
                {menuItems.map((item, i) => (
                  <li key={i} className={styles.navItem}>
                    <Link href={item.url || '#'}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>

        <Link href="/" className={styles.logo} aria-label={siteName}>
          {settings?.logoLight ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoLight}
              alt={siteName}
              className={styles.logoImage}
            />
          ) : (
            <span className={styles.logoText}>{siteName}</span>
          )}
        </Link>

        <div className={styles.right}>
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
