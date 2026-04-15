import LoginForm from './LoginForm';
import styles from './page.module.css';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={styles.title}>Sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
