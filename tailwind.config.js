/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        canvas: 'var(--color-background)',
        ink: 'var(--color-text)',
        muted: 'var(--color-muted)',
        'muted-fg': 'var(--color-muted-strong)',
        'line': 'var(--color-border)',
        'line-strong': 'var(--color-border-strong)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      letterSpacing: {
        wide: 'var(--ls-wide)',
        wider: 'var(--ls-wider)',
        widest: 'var(--ls-widest)',
      },
    },
  },
  plugins: [],
};
