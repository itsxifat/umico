import CartClient from './CartClient';

export const metadata = { title: 'Shopping Cart — UMICO' };

export default function CartPage() {
  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto min-h-[60vh]">
      <h1 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] mb-8">Your cart</h1>
      <CartClient />
    </div>
  );
}
