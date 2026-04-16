import VerifyOtpForm from './VerifyOtpForm';

export const metadata = { title: 'Verify Email — UMICO' };

export default function VerifyOtpPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-[var(--gutter)] py-16">
      <div className="w-full max-w-[440px] bg-surface border border-line px-10 py-12">
        <p className="text-xs tracking-widest uppercase text-accent mb-3">Verification</p>
        <h1 className="font-serif text-2xl mb-3">Enter your code</h1>
        <p className="text-sm text-muted mb-8">We sent a 6-digit code to your email. It expires in 5 minutes.</p>
        <VerifyOtpForm />
      </div>
    </div>
  );
}
