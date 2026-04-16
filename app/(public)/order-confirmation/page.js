import Link from 'next/link';

export const metadata = { title: 'Order Confirmed — UMICO' };

export default function OrderConfirmationPage({ searchParams }) {
  const orderId = searchParams?.id || '';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-[var(--gutter)] py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[rgba(79,122,74,0.12)] flex items-center justify-center text-success text-3xl mb-6">
        ✓
      </div>
      <p className="text-xs tracking-widest uppercase text-accent mb-3">Thank you</p>
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] mb-4">Order confirmed!</h1>
      {orderId && (
        <p className="text-muted mb-2">
          Your order number is <span className="font-medium text-ink font-mono">{orderId}</span>
        </p>
      )}
      <p className="text-sm text-muted max-w-[40ch] mb-8">
        We&apos;ll send you an email with tracking details once your order ships.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/shop" className="px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 transition-opacity">
          Continue shopping
        </Link>
        <Link href="/account/orders" className="px-8 py-3 border border-line-strong text-xs tracking-wide uppercase text-muted-fg hover:text-ink hover:border-ink transition-colors">
          View orders
        </Link>
      </div>
    </div>
  );
}
