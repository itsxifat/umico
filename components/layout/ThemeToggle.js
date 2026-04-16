'use client';

import { useTheme } from '@/components/providers/ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center w-11 h-6 p-0.5 border border-line-strong rounded-full bg-transparent"
        aria-label="Toggle theme"
        disabled
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center w-11 h-6 p-0.5 border border-line-strong rounded-full bg-transparent hover:border-ink transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="relative w-full h-full">
        <span
          className="absolute top-0 w-[18px] h-[18px] rounded-full bg-ink transition-all duration-300"
          style={{ left: isDark ? 'calc(100% - 18px)' : '0' }}
        />
      </span>
    </button>
  );
}
