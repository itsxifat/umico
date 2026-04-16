'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminSelect } from '@/components/admin/AdminInput';

const BADGE = {
  active: 'bg-[rgba(79,122,74,0.12)] text-success',
  inactive: 'bg-[rgba(42,24,16,0.08)] text-muted',
  draft: 'bg-[rgba(196,138,60,0.12)] text-warning',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
];

function formatPrice(p) {
  return p ? `৳${Number(p).toLocaleString()}` : '—';
}

export default function ProductsClient() {
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
      const res = await fetch(`/api/admin/products?${params}`);
      const json = await res.json();
      if (json.success) { setRows(json.data); setMeta(json.meta || {}); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Failed to load products.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [q, status, page, toast]);

  useEffect(() => { load(); }, [load]);

  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"? This will also delete all product images.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { toast('Product deleted.', { type: 'success' }); load(); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Delete failed.', { type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <input
          type="search" placeholder="Search products, SKU…" value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] max-w-[360px] px-4 py-3 border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:border-ink"
        />
        <div className="w-[160px]">
          <AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </AdminSelect>
        </div>
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
        <span className="text-xs text-muted tracking-wide ml-auto">{meta.total || 0} products</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-16 px-4 text-muted italic">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-16 px-4 text-muted italic">No products found.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Product', 'Brand', 'Category', 'Price', 'Stock', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-muted border-b border-line bg-surface whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="transition-colors hover:bg-surface-alt">
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">
                    <div className="flex items-center gap-3">
                      {p.mainImages?.[0]
                        ? <img src={p.mainImages[0].thumbnail || p.mainImages[0].url} alt={p.name} className="w-10 h-10 object-cover border border-line flex-shrink-0" />
                        : <div className="w-10 h-10 bg-surface-alt border border-line flex items-center justify-center text-[10px] text-muted flex-shrink-0">No img</div>
                      }
                      <div>
                        <div className="font-medium text-ink">{p.name}</div>
                        {p.sku && <div className="text-[11px] font-mono text-muted">SKU: {p.sku}</div>}
                        {p.hasVariants && <div className="text-[10px] tracking-wide uppercase text-accent">{p.variants?.length || 0} variants</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">{p.brand?.name || '—'}</td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">{p.category?.name || '—'}</td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <div className="font-medium text-ink">{formatPrice(p.price)}</div>
                    {p.compareAtPrice > p.price && (
                      <div className="text-xs text-muted line-through">{formatPrice(p.compareAtPrice)}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <span className={
                      p.stock === 0 ? 'text-error font-medium' :
                      p.stock <= (p.lowStockThreshold || 5) ? 'text-warning font-medium' :
                      'text-ink'
                    }>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] tracking-wide rounded-full font-medium ${BADGE[p.status] || ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <div className="flex gap-2 justify-end">
                      <AdminBtn href={`/admin/products/${p._id}/edit`} variant="ghost" size="sm">Edit</AdminBtn>
                      <AdminBtn variant="danger" size="sm"
                        onClick={() => del(p._id, p.name)}
                        loading={deletingId === p._id} disabled={!!deletingId}
                      >Delete</AdminBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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
