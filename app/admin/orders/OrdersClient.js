'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminSelect } from '@/components/admin/AdminInput';

const STATUS_BADGE = {
  pending: 'bg-[rgba(196,138,60,0.12)] text-warning',
  confirmed: 'bg-[rgba(79,122,174,0.12)] text-accent',
  processing: 'bg-[rgba(79,122,174,0.12)] text-accent',
  shipped: 'bg-[rgba(79,122,74,0.12)] text-success',
  in_transit: 'bg-[rgba(79,122,74,0.12)] text-success',
  delivered: 'bg-[rgba(79,122,74,0.15)] text-success',
  cancelled: 'bg-[rgba(200,50,50,0.1)] text-error',
  returned: 'bg-[rgba(200,50,50,0.1)] text-error',
};

const PAYMENT_BADGE = {
  pending: 'bg-[rgba(196,138,60,0.12)] text-warning',
  paid: 'bg-[rgba(79,122,74,0.12)] text-success',
  failed: 'bg-[rgba(200,50,50,0.1)] text-error',
  refunded: 'bg-[rgba(42,24,16,0.08)] text-muted',
};

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

export default function OrdersClient() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, page, limit: 20 });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (json.success) { setRows(json.data); setMeta(json.meta || {}); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Failed to load orders.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [q, status, page, toast]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, orderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast('Status updated.', { type: 'success' });
        load();
      } else toast(json.message, { type: 'error' });
    } catch {
      toast('Update failed.', { type: 'error' });
    }
  };

  return (
    <div>
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <input
          type="search" placeholder="Search order ID, name, phone…" value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] max-w-[360px] px-4 py-3 border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:border-ink"
        />
        <div className="w-[160px]">
          <AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </AdminSelect>
        </div>
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
        <span className="text-xs text-muted tracking-wide ml-auto">{meta.total || 0} orders</span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-16 px-4 text-muted italic">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-16 px-4 text-muted italic">No orders found.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-muted border-b border-line bg-surface whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <>
                  <tr key={o._id} className="transition-colors hover:bg-surface-alt cursor-pointer" onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}>
                    <td className="px-4 py-4 border-b border-line align-middle">
                      <span className="font-mono text-xs font-medium text-ink">{o.orderId}</span>
                    </td>
                    <td className="px-4 py-4 border-b border-line align-middle">
                      <div className="text-ink text-sm">{o.shippingAddress?.fullName || '—'}</div>
                      <div className="text-xs text-muted">{o.shippingAddress?.phone || ''}</div>
                    </td>
                    <td className="px-4 py-4 border-b border-line align-middle text-ink">
                      {o.items?.length || 0}
                    </td>
                    <td className="px-4 py-4 border-b border-line align-middle font-medium text-ink">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-4 border-b border-line align-middle">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] tracking-wide rounded-full font-medium ${STATUS_BADGE[o.orderStatus] || ''}`}>
                        {o.orderStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b border-line align-middle">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] tracking-wide rounded-full font-medium ${PAYMENT_BADGE[o.paymentStatus] || ''}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b border-line align-middle text-xs text-muted">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-4 border-b border-line align-middle">
                      <span className="text-xs text-muted">{expandedId === o._id ? '▲' : '▼'}</span>
                    </td>
                  </tr>
                  {expandedId === o._id && (
                    <tr key={`${o._id}-detail`}>
                      <td colSpan={8} className="px-4 py-5 border-b border-line bg-surface-alt">
                        <div className="grid grid-cols-1 gap-4 max-w-[800px]">
                          {/* Items */}
                          <div>
                            <h4 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-2">Items</h4>
                            <div className="flex flex-col gap-2">
                              {o.items?.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  {it.productImage ? (
                                    <img src={it.productImage} alt={it.productName} className="w-8 h-8 object-cover border border-line" />
                                  ) : (
                                    <div className="w-8 h-8 bg-surface border border-line" />
                                  )}
                                  <span className="flex-1 text-ink">{it.productName} {it.variantLabel && <span className="text-muted">({it.variantLabel})</span>}</span>
                                  <span className="text-muted">×{it.quantity}</span>
                                  <span className="font-medium text-ink">{formatPrice(it.totalPrice)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <h4 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-2">Shipping address</h4>
                            <p className="text-sm text-ink">
                              {o.shippingAddress?.fullName}, {o.shippingAddress?.phone}<br />
                              {o.shippingAddress?.address}<br />
                              {o.shippingAddress?.city}{o.shippingAddress?.area ? `, ${o.shippingAddress.area}` : ''}{o.shippingAddress?.postcode ? ` - ${o.shippingAddress.postcode}` : ''}
                            </p>
                          </div>

                          {/* Summary */}
                          <div className="flex gap-6 text-sm">
                            <div><span className="text-muted">Subtotal:</span> <span className="text-ink">{formatPrice(o.subtotal)}</span></div>
                            <div><span className="text-muted">Shipping:</span> <span className="text-ink">{formatPrice(o.shippingCost)}</span></div>
                            {o.discountAmount > 0 && <div><span className="text-muted">Discount:</span> <span className="text-error">-{formatPrice(o.discountAmount)}</span></div>}
                            <div><span className="text-muted">Total:</span> <span className="font-medium text-ink">{formatPrice(o.total)}</span></div>
                          </div>

                          {o.customerNote && (
                            <div>
                              <h4 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1">Customer note</h4>
                              <p className="text-sm text-ink">{o.customerNote}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-3 items-center flex-wrap pt-2 border-t border-line">
                            <span className="text-[10px] font-semibold tracking-widest uppercase text-muted">Update status:</span>
                            {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                              <AdminBtn key={s} variant={o.orderStatus === s ? 'primary' : 'secondary'} size="sm"
                                onClick={() => updateStatus(o._id, s)}
                                disabled={o.orderStatus === s || o.orderStatus === 'delivered' || o.orderStatus === 'cancelled'}>
                                {s.replace('_', ' ')}
                              </AdminBtn>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.pages > 1 && (
        <div className="flex items-center gap-4 mt-6 justify-center">
          <AdminBtn variant="secondary" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}>← Prev</AdminBtn>
          <span className="text-sm text-muted">Page {page} of {meta.pages}</span>
          <AdminBtn variant="secondary" size="sm"
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page >= meta.pages}>Next →</AdminBtn>
        </div>
      )}
    </div>
  );
}
