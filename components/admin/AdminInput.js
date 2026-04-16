import styles from './AdminInput.module.css';

export function AdminInput({ label, error, hint, ...props }) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <input className={`${styles.input} ${error ? styles.hasError : ''}`} {...props} />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

export function AdminTextarea({ label, error, hint, rows = 4, ...props }) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea
        rows={rows}
        className={`${styles.input} ${styles.textarea} ${error ? styles.hasError : ''}`}
        {...props}
      />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

export function AdminSelect({ label, error, hint, children, ...props }) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.selectWrap}>
        <select className={`${styles.input} ${error ? styles.hasError : ''}`} {...props}>
          {children}
        </select>
        <span className={styles.caret} aria-hidden>▾</span>
      </div>
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
