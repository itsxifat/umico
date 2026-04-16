import RegisterForm from './RegisterForm';

export const metadata = { title: 'Create Account — UMICO' };

export default function RegisterPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-[var(--gutter)] py-16">
      <div className="w-full max-w-[440px] bg-surface border border-line px-10 py-12">
        <p className="text-xs tracking-widest uppercase text-accent mb-3">Welcome</p>
        <h1 className="font-serif text-2xl mb-8">Create an account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
