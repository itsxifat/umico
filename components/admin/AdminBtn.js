/**
 * Reusable button for the admin panel.
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 * size: 'sm' | 'md'
 */
export default function AdminBtn({
  children, variant = 'primary', size = 'md',
  onClick, type = 'button', disabled, href, loading,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans tracking-wide uppercase transition-all whitespace-nowrap no-underline border';
  const sizes = {
    md: 'text-xs px-5 py-3 min-h-[40px]',
    sm: 'text-[10px] px-3 py-2 min-h-[30px]',
  };
  const variants = {
    primary: 'bg-secondary text-canvas border-secondary hover:opacity-85',
    secondary: 'bg-transparent text-ink border-line-strong hover:border-ink',
    danger: 'bg-transparent text-error border-error hover:bg-error hover:text-white',
    ghost: 'bg-transparent text-muted-fg border-transparent hover:text-ink',
  };
  const disabledCls = (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const cls = [base, sizes[size] ?? sizes.md, variants[variant] ?? variants.primary, disabledCls].filter(Boolean).join(' ');

  const spinner = loading
    ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
    : null;

  if (href) {
    return (
      <a href={href} className={cls}>
        {spinner}{children}
      </a>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || loading}>
      {spinner}{children}
    </button>
  );
}
