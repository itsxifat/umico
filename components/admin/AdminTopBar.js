'use client';

import { signOut } from 'next-auth/react';
import styles from './AdminTopBar.module.css';

export default function AdminTopBar({ user }) {
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.greeting}>Welcome, {user.name.split(' ')[0]}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.role}>{user.role}</span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={styles.logout}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
