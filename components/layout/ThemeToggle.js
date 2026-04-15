'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid hydration mismatch — render a stable placeholder until mounted.
  if (!mounted) {
    return <button className={styles.toggle} aria-label="Toggle theme" disabled />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className={`${styles.indicator} ${isDark ? styles.dark : styles.light}`}>
        <span className={styles.dot} />
      </span>
    </button>
  );
}
