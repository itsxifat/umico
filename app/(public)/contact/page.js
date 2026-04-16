'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls = 'px-4 py-3 bg-canvas border border-line-strong text-ink text-sm w-full focus:outline-none focus:border-ink transition-colors';
  const labelCls = 'text-xs tracking-wide uppercase text-muted-fg font-medium';

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {} finally {
      setSending(false);
    }
  };

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto min-h-[60vh]">
      <p className="text-xs tracking-widest uppercase text-accent mb-3">Get in touch</p>
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] mb-3">Contact Us</h1>
      <p className="text-sm text-muted mb-10 max-w-[50ch]">
        Have a question, feedback, or need help with an order? We&apos;d love to hear from you.
      </p>

      {sent ? (
        <div className="bg-surface border border-line p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[rgba(79,122,74,0.12)] flex items-center justify-center text-success text-2xl mx-auto mb-4">✓</div>
          <h2 className="font-serif text-xl mb-2">Message sent!</h2>
          <p className="text-sm text-muted">We&apos;ll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Name *</span>
              <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Email *</span>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Phone</span>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Subject *</span>
              <input type="text" required value={form.subject} onChange={(e) => set('subject', e.target.value)} className={inputCls} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Message *</span>
            <textarea required rows={5} value={form.message} onChange={(e) => set('message', e.target.value)}
              className={`${inputCls} resize-y`} />
          </label>
          <button type="submit" disabled={sending}
            className="self-start px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
