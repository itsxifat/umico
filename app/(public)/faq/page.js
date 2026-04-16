'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'How long does delivery take?', a: 'Inside Dhaka: 1–2 business days. Outside Dhaka: 3–5 business days. You\'ll receive a tracking number once your order ships.' },
  { q: 'Are all products authentic?', a: 'Yes. We source directly from authorized distributors and brands. Every product is 100% genuine.' },
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), bKash, and Nagad. Online payment options are being expanded.' },
  { q: 'Can I return or exchange a product?', a: 'Yes, within 7 days of delivery if the product is unused and in original packaging. Contact us to initiate a return.' },
  { q: 'Do you offer free shipping?', a: 'Yes! Orders over ৳999 qualify for free shipping across Bangladesh.' },
  { q: 'How can I track my order?', a: 'Log in to your account and go to My Orders. You\'ll see the current status and tracking details for each order.' },
  { q: 'Is my personal information safe?', a: 'Absolutely. We use secure encryption and never share your data with third parties.' },
  { q: 'How do I contact customer support?', a: 'Visit our Contact page or email us. We respond within 24 hours on business days.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="text-sm font-medium text-ink">{q}</span>
        <span className="text-muted text-lg flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="pb-5 text-sm text-muted-fg leading-relaxed pr-8">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto min-h-[60vh]">
      <p className="text-xs tracking-widest uppercase text-accent mb-3">Help</p>
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] mb-2">Frequently Asked Questions</h1>
      <p className="text-sm text-muted mb-10">Find answers to common questions about orders, shipping, and more.</p>

      <div className="border-t border-line">
        {FAQS.map((item, i) => (
          <FaqItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
