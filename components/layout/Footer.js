import Link from 'next/link';

export default function Footer({ settings }) {
  const columns = settings?.footerColumns || [];
  const copyright =
    settings?.footerCopyright ||
    `© ${new Date().getFullYear()} ${settings?.siteName || 'UMICO'}`;
  const socials = settings?.socialLinks || [];

  return (
    <footer className="mt-32 border-t border-line bg-canvas">
      <div className="grid gap-12 px-[var(--gutter)] py-16 pb-12 max-w-[var(--max-w)] mx-auto min-[900px]:gap-16"
        style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}
        data-footer-inner>
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <span className="font-serif text-2xl tracking-widest text-ink">
            {settings?.siteName || 'UMICO'}
          </span>
          {settings?.tagline && (
            <p className="text-muted max-w-[360px] text-sm leading-relaxed">{settings.tagline}</p>
          )}
          {socials.length > 0 && (
            <ul className="flex gap-5 mt-3">
              {socials.map((s, i) =>
                s.url ? (
                  <li key={i}>
                    <Link href={s.url} target="_blank" rel="noreferrer"
                      className="text-xs tracking-widest uppercase text-muted-fg hover:text-ink transition-colors">
                      {s.label || s.platform}
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>

        {/* Link columns */}
        {columns.length === 0 ? (
          <div className="text-muted italic text-sm">Footer columns not configured yet.</div>
        ) : (
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            {columns.map((col, i) => (
              <div key={i}>
                <h4 className="font-sans text-xs font-semibold tracking-widest uppercase text-ink mb-4">
                  {col.heading || ''}
                </h4>
                <ul className="flex flex-col gap-3">
                  {(col.links || []).map((link, j) => (
                    <li key={j}>
                      <Link href={link.url || '#'} className="text-sm text-muted-fg hover:text-ink transition-colors">
                        {link.label || ''}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-[var(--gutter)] py-5 border-t border-line text-xs tracking-wide text-muted text-center">
        <span>{copyright}</span>
      </div>
    </footer>
  );
}
