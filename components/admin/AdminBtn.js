import styles from './AdminBtn.module.css';

/**
 * Reusable button for the admin panel.
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 * size: 'sm' | 'md'
 */
export default function AdminBtn({
  children, variant = 'primary', size = 'md',
  onClick, type = 'button', disabled, href, loading,
}) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    (disabled || loading) ? styles.disabled : '',
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} className={cls}>
        {loading ? <span className={styles.spinner} aria-hidden /> : null}
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || loading}>
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
      {children}
    </button>
  );
}
