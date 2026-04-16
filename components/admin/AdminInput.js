const labelCls = 'text-xs tracking-wide uppercase text-muted-fg font-medium';
const inputCls = (error) =>
  `px-4 py-3 bg-canvas border text-ink text-sm transition-colors w-full focus:outline-none focus:border-ink ${
    error ? 'border-error' : 'border-line-strong'
  }`;
const hintCls = 'text-xs text-muted';
const errorCls = 'text-xs text-error';

export function AdminInput({ label, error, hint, ...props }) {
  return (
    <label className="flex flex-col gap-2">
      {label && <span className={labelCls}>{label}</span>}
      <input className={inputCls(error)} {...props} />
      {hint && !error && <span className={hintCls}>{hint}</span>}
      {error && <span className={errorCls}>{error}</span>}
    </label>
  );
}

export function AdminTextarea({ label, error, hint, rows = 4, ...props }) {
  return (
    <label className="flex flex-col gap-2">
      {label && <span className={labelCls}>{label}</span>}
      <textarea
        rows={rows}
        className={`${inputCls(error)} resize-y min-h-[80px] leading-relaxed`}
        {...props}
      />
      {hint && !error && <span className={hintCls}>{hint}</span>}
      {error && <span className={errorCls}>{error}</span>}
    </label>
  );
}

export function AdminSelect({ label, error, hint, children, ...props }) {
  return (
    <label className="flex flex-col gap-2">
      {label && <span className={labelCls}>{label}</span>}
      <div className="relative">
        <select
          className={`${inputCls(error)} appearance-none pr-8 cursor-pointer`}
          {...props}
        >
          {children}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none text-xs" aria-hidden>▾</span>
      </div>
      {hint && !error && <span className={hintCls}>{hint}</span>}
      {error && <span className={errorCls}>{error}</span>}
    </label>
  );
}
