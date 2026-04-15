import styles from './page.module.css';

export const metadata = {
  title: 'Dashboard — UMICO Admin',
};

export default function AdminDashboardPage() {
  return (
    <div>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Dashboard</p>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>
          Stats and widgets will populate here once products, orders, and
          customers exist in the database.
        </p>
      </div>

      <div className={styles.placeholderGrid}>
        {[
          'Orders today',
          'Revenue this month',
          'New customers',
          'Low-stock items',
        ].map((label) => (
          <div key={label} className={styles.card}>
            <div className={styles.cardLabel}>{label}</div>
            <div className={styles.cardValue}>—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
