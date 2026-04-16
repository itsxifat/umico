'use client';

import { useState } from 'react';
import Link from 'next/link';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_LABEL = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(orderId.trim())}`);
      const json = await res.json();
      if (json.success) setOrder(json.data);
      else setError(json.message || 'Order not found.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w-narrow)] mx-auto min-h-[60vh]">
      <p className="text-xs tracking-widest uppercase text-accent mb-3">Order tracking</p>
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] mb-3">Track Your Order</h1>
      <p className="text-sm text-muted mb-8">Enter your order ID to check the current status.</p>

      <form onSubmit={onSubmit} className="flex gap-3 mb-10 max-w-[500px]">
        <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. UMICO-20260416-1234"
          className="flex-1 px-4 py-3 bg-canvas border border-line-strong text-ink text-sm focus:outline-none focus:border-ink transition-colors" />
        <button type="submit" disabled={loading}
          className="px-6 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
          {loading ? 'Checking…' : 'Track'}
        </button>
      </form>

      {error && <p className="text-sm text-error mb-6">{error}</p>}

      {order && (
        <div className="bg-surface border border-line p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <span className="font-mono text-sm font-medium text-ink">{order.orderId}</span>
              <span className="text-xs text-muted ml-3">
                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <span className="text-xs tracking-wide uppercase font-medium text-accent">
              {STATUS_LABEL[order.orderStatus] || order.orderStatus}
            </span>
          </div>

          {/* Progress bar */}
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned' && (
            <div className="flex items-center gap-0 mb-6">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${
                    i <= stepIdx ? 'bg-secondary text-canvas' : 'bg-surface-alt border border-line text-muted'
                  }`}>
                    {i <= stepIdx ? '✓' : i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${i < stepIdx ? 'bg-secondary' : 'bg-line'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div><span className="text-muted">Items:</span> <span className="text-ink">{order.items?.length || 0}</span></div>
            <div><span className="text-muted">Total:</span> <span className="font-medium text-ink">৳{Number(order.total).toLocaleString()}</span></div>
            <div><span className="text-muted">Payment:</span> <span className="text-ink">{order.paymentMethod?.toUpperCase()}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
