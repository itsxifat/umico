import Link from 'next/link';
import styles from './AnnouncementBar.module.css';

export default function AnnouncementBar({ config }) {
  if (!config?.enabled || !config?.text) return null;

  const content = (
    <span className={styles.text}>{config.text}</span>
  );

  return (
    <div className={styles.bar}>
      {config.link ? (
        <Link href={config.link} className={styles.link}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
