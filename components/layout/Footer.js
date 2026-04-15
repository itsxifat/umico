import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer({ settings }) {
  const columns = settings?.footerColumns || [];
  const copyright =
    settings?.footerCopyright ||
    `© ${new Date().getFullYear()} ${settings?.siteName || 'UMICO'}`;
  const socials = settings?.socialLinks || [];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandName}>{settings?.siteName || 'UMICO'}</span>
          {settings?.tagline && (
            <p className={styles.tagline}>{settings.tagline}</p>
          )}
          {socials.length > 0 && (
            <ul className={styles.socials}>
              {socials.map((s, i) =>
                s.url ? (
                  <li key={i}>
                    <Link href={s.url} target="_blank" rel="noreferrer">
                      {s.label || s.platform}
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>

        {columns.length === 0 ? (
          <div className={styles.empty}>
            Footer columns not configured yet.
          </div>
        ) : (
          <div className={styles.columns}>
            {columns.map((col, i) => (
              <div key={i} className={styles.column}>
                <h4 className={styles.colHeading}>{col.heading || ''}</h4>
                <ul className={styles.colLinks}>
                  {(col.links || []).map((link, j) => (
                    <li key={j}>
                      <Link href={link.url || '#'}>{link.label || ''}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <span>{copyright}</span>
      </div>
    </footer>
  );
}
