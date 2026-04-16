import Link from 'next/link';

export const metadata = { title: 'About — UMICO' };

export default function AboutPage() {
  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto min-h-[60vh]">
      <p className="text-xs tracking-widest uppercase text-accent mb-3">Our story</p>
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] mb-8">About UMICO</h1>

      <div className="flex flex-col gap-6 text-sm text-muted-fg leading-relaxed max-w-[65ch]">
        <p>
          UMICO is a curated unisex cosmetics destination, bringing together the finest skincare,
          haircare, and beauty products for everyone — regardless of gender. We believe great
          skincare is universal.
        </p>
        <p>
          Founded with a simple mission: make premium cosmetics accessible, honest, and
          inclusive. Every product in our catalog is carefully selected for quality,
          ingredients, and effectiveness.
        </p>
        <p>
          We partner with trusted local and international brands to offer authentic products
          at fair prices, delivered right to your doorstep across Bangladesh.
        </p>

        <div className="grid grid-cols-3 gap-6 py-8 border-y border-line text-center">
          <div>
            <div className="font-serif text-2xl text-ink mb-1">100%</div>
            <div className="text-xs tracking-wide uppercase text-muted">Authentic</div>
          </div>
          <div>
            <div className="font-serif text-2xl text-ink mb-1">Fast</div>
            <div className="text-xs tracking-wide uppercase text-muted">Delivery</div>
          </div>
          <div>
            <div className="font-serif text-2xl text-ink mb-1">24/7</div>
            <div className="text-xs tracking-wide uppercase text-muted">Support</div>
          </div>
        </div>

        <p>
          Questions? We&apos;d love to hear from you.
        </p>
        <Link href="/contact"
          className="self-start px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 transition-opacity">
          Contact us
        </Link>
      </div>
    </div>
  );
}
