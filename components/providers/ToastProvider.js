'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import styles from './ToastProvider.module.css';

const ToastContext = createContext({
  toast: () => {},
});

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, { type = 'info', duration = 3500 } = {}) => {
    const id = nextId++;
    setToasts((curr) => [...curr, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${visible ? styles.visible : ''}`}
      role="status"
    >
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.close}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
