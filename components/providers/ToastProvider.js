'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext({ toast: () => {} });

let nextId = 1;

const BORDER_COLORS = {
  info: 'border-l-[var(--color-info)]',
  success: 'border-l-success',
  error: 'border-l-error',
  warning: 'border-l-warning',
};

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
      <div
        className="fixed top-6 right-6 flex flex-col gap-3 z-[var(--z-toast)] max-w-[360px] max-[640px]:top-auto max-[640px]:bottom-4 max-[640px]:right-4 max-[640px]:left-4 max-[640px]:max-w-none"
        aria-live="polite"
        aria-atomic="true"
      >
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

  const borderColor = BORDER_COLORS[toast.type] || BORDER_COLORS.info;

  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 bg-surface text-ink border border-line border-l-[3px] text-sm leading-snug shadow-md transition-all duration-300 ${borderColor} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}
      role="status"
    >
      <span className="flex-1 pt-0.5">{toast.message}</span>
      <button
        type="button"
        className="w-6 h-6 text-xl leading-none text-muted hover:text-ink transition-colors"
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
