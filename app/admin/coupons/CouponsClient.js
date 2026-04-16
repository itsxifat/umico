'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminSelect } from '@/components/admin/AdminInput';

const STATUS_BADGE = {
  active: 'bg-[rgba(79,122,74,0.12)] text-success',
  inactive: 'bg-[rgba(42,24,16,0.08)] text-muted',
  expired: 'bg-[rgba(200,50,50,0.1)] text-error',
};

const TYPE_LABEL = {
  percentage: '%',
  fixed_amount: '৳',
  free_shipping: 'Free Ship',
};

function formatValue(coupon) {
  if (coupon.type === 'percentage') return `${coupon.value}%`;
  if (coupon.type === 'fixed_amount') return `৳${coupon.value}`;
  return 'Free Shipping';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CouponsClient() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, page, limit: 20 });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/coupons?${params}`);
      const json = await res.json();
      if (json.success) { setRows(json.data); setMeta(json.meta || {}); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Failed to load coupons.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [q, status, page, toast]);

  useEffect(() => { load(); }, [load]);

  const del = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { toast('Coupon deleted.', { type: 'success' }); load(); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Delete failed.', { type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) { toast('Updated.', { type: 'success' }); load(); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Update failed.', { type: 'error' });
    }
  };

  return (
    <div>
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <input
          type="search" placeholder="Search code…" value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] max-w-[360px] px-4 py-3 border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:border-ink"
        />
        <div className="w-[160px]">
          <AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </AdminSelect>
        </div>
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
        <span className="text-xs text-muted tracking-wide ml-auto">{meta.total || 0} coupons</span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-16 px-4 text-muted italic">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-16 px-4 text-muted italic">No coupons found.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Code', 'Type', 'Discount', 'Min Order', 'Usage', 'Valid Until', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-muted border-b border-line bg-surface whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c._id} className="transition-colors hover:bg-surface-alt">
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <span className="font-mono text-xs font-medium text-ink">{c.code}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-xs text-muted capitalize">
                    {c.type?.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle font-medium text-ink">
                    {formatValue(c)}
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">
                    {c.minOrderAmount ? `৳${c.minOrderAmount}` : '—'}
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">
                    {c.usedCount}/{c.usageLimit || '∞'}
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-xs text-muted">
                    {formatDate(c.validUntil)}
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] tracking-wide rounded-full font-medium ${STATUS_BADGE[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <div className="flex gap-2 justify-end">
                      <AdminBtn variant="ghost" size="sm" onClick={() => toggleStatus(c._id, c.status)}>
                        {c.status === 'active' ? 'Disable' : 'Enable'}
                      </AdminBtn>
                      <AdminBtn variant="danger" size="sm" onClick={() => del(c._id, c.code)}
                        loading={deletingId === c._id} disabled={!!deletingId}>
                        Delete
                      </AdminBtn>
                    </div>
                  </td>
                </tr>
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
