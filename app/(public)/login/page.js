import LoginForm from './LoginForm';

export const metadata = { title: 'Sign in — UMICO' };

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-[var(--gutter)] py-16">
      <div className="w-full max-w-[440px] bg-surface border border-line px-10 py-12">
        <p className="text-xs tracking-widest uppercase text-accent mb-3">Account</p>
        <h1 className="font-serif text-2xl mb-8">Sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
