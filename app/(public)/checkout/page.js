import CheckoutClient from './CheckoutClient';

export const metadata = { title: 'Checkout — UMICO' };

export default function CheckoutPage() {
  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto min-h-[60vh]">
      <h1 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] mb-8">Checkout</h1>
      <CheckoutClient />
    </div>
  );
}
