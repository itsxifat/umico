'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

const fieldCls = 'flex flex-col gap-1';
const labelCls = 'text-xs tracking-wide uppercase text-muted-fg font-medium';
const inputCls = 'px-3 py-2.5 bg-canvas border border-line-strong text-ink text-sm w-full focus:outline-none focus:border-ink transition-colors';

export default function CheckoutClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: '', phone: '', email: '',
    addressLine1: '', addressLine2: '',
    city: '', area: '', postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');

  const set = (k, v) => setShipping((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('umico-cart');
      if (raw) setItems(JSON.parse(raw).items || []);
    } catch {}
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-xl text-muted mb-4">Your cart is empty</p>
        <Link href="/shop" className="inline-block px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 transition-opacity">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shippingCost = subtotal >= 999 ? 0 : 80;
  const grandTotal = subtotal + shippingCost;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.phone || !shipping.addressLine1 || !shipping.city) {
      toast('Please fill in all required fields.', { type: 'error' });
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        items: items.map((it) => ({
          product: it.productId,
          productName: it.name,
          productImage: it.image,
          variantLabel: it.variantLabel || '',
          variant: it.variant,
          price: it.price,
          quantity: it.quantity,
        })),
        shippingAddress: shipping,
        paymentMethod,
        notes,
        subtotal,
        shippingCost,
        grandTotal,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const json = await res.json();

      if (json.success) {
        localStorage.removeItem('umico-cart');
        window.dispatchEvent(new Event('umico:cart-changed'));
        toast('Order placed successfully!', { type: 'success' });
        router.push(`/order-confirmation?id=${json.data.orderId}`);
      } else {
        toast(json.message || 'Order failed.', { type: 'error' });
      }
    } catch {
      toast('Network error. Please try again.', { type: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-8 items-start" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }} data-checkout-grid>
        {/* Shipping details */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-line p-6 flex flex-col gap-4">
            <h2 className="font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line">
              Shipping address
            </h2>
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <label className={fieldCls}><span className={labelCls}>Full name *</span>
                <input type="text" required value={shipping.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls} /></label>
              <label className={fieldCls}><span className={labelCls}>Phone *</span>
                <input type="tel" required value={shipping.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} /></label>
            </div>
            <label className={fieldCls}><span className={labelCls}>Email</span>
              <input type="email" value={shipping.email} onChange={(e) => set('email', e.target.value)} className={inputCls} /></label>
            <label className={fieldCls}><span className={labelCls}>Address line 1 *</span>
              <input type="text" required value={shipping.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} className={inputCls} /></label>
            <label className={fieldCls}><span className={labelCls}>Address line 2</span>
              <input type="text" value={shipping.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} className={inputCls} /></label>
            <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
              <label className={fieldCls}><span className={labelCls}>City *</span>
                <input type="text" required value={shipping.city} onChange={(e) => set('city', e.target.value)} className={inputCls} /></label>
              <label className={fieldCls}><span className={labelCls}>Area</span>
                <input type="text" value={shipping.area} onChange={(e) => set('area', e.target.value)} className={inputCls} /></label>
              <label className={fieldCls}><span className={labelCls}>Postal code</span>
                <input type="text" value={shipping.postalCode} onChange={(e) => set('postalCode', e.target.value)} className={inputCls} /></label>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-surface border border-line p-6 flex flex-col gap-4">
            <h2 className="font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line">
              Payment method
            </h2>
            {[
              { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
              { value: 'bkash', label: 'bKash', desc: 'Pay via bKash mobile banking' },
              { value: 'nagad', label: 'Nagad', desc: 'Pay via Nagad mobile banking' },
            ].map((pm) => (
              <label key={pm.value} className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                paymentMethod === pm.value ? 'border-ink bg-surface-alt' : 'border-line hover:border-line-strong'
              }`}>
                <input type="radio" name="payment" value={pm.value}
                  checked={paymentMethod === pm.value}
                  onChange={() => setPaymentMethod(pm.value)}
                  className="mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-ink">{pm.label}</span>
                  <p className="text-xs text-muted mt-0.5">{pm.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Notes */}
          <label className={fieldCls}>
            <span className={labelCls}>Order notes (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className={`${inputCls} resize-y`} placeholder="Special instructions, delivery preferences…" />
          </label>
        </div>

        {/* Order summary */}
        <div className="bg-surface border border-line p-6 flex flex-col gap-4 sticky top-24">
          <h2 className="font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line">
            Order summary
          </h2>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover border border-line flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-surface-alt border border-line flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{item.name}</p>
                  {item.variantLabel && <p className="text-xs text-muted">{item.variantLabel}</p>}
                  <p className="text-xs text-muted">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-ink">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-3 flex flex-col gap-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Shipping</span>
              <span className="text-ink">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
            </div>
            {shippingCost === 0 && (
              <p className="text-xs text-success">Free shipping on orders over ৳999</p>
            )}
            <div className="flex justify-between pt-2 border-t border-line">
              <span className="font-medium text-ink">Total</span>
              <span className="text-xl font-medium text-ink">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <button type="submit" disabled={placing}
            className="w-full py-4 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity mt-2">
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </div>
    </form>
  );
}
