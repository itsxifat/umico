'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminSelect } from '@/components/admin/AdminInput';
import styles from './products.module.css';
import tableStyles from '@/components/admin/AdminTable.module.css';

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
      <div className={styles.toolbar}>
        <input type="search" placeholder="Search products, SKU…" value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className={styles.search} />
        <div className={styles.statusFilter}>
          <AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </AdminSelect>
        </div>
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
        <span className={styles.total}>{meta.total || 0} products</span>
      </div>

      <div className={tableStyles.wrap}>
        {loading ? (
          <p className={tableStyles.empty}>Loading…</p>
        ) : rows.length === 0 ? (
          <p className={tableStyles.empty}>No products found.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className={styles.productCell}>
                      {p.mainImages?.[0]
                        ? <img src={p.mainImages[0].thumbnail || p.mainImages[0].url}
                            alt={p.name} className={styles.thumb} />
                        : <div className={styles.noImg}>No image</div>
                      }
                      <div>
                        <div className={styles.productName}>{p.name}</div>
                        {p.sku && <div className={styles.sku}>SKU: {p.sku}</div>}
                        {p.hasVariants && <div className={styles.variantsBadge}>{p.variants?.length || 0} variants</div>}
                      </div>
                    </div>
                  </td>
                  <td>{p.brand?.name || '—'}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>
                    <div>
                      <div className={styles.price}>{formatPrice(p.price)}</div>
                      {p.compareAtPrice > p.price && (
                        <div className={styles.comparePrice}>{formatPrice(p.compareAtPrice)}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={p.stock <= (p.lowStockThreshold || 5) && p.stock > 0
                      ? styles.lowStock
                      : p.stock === 0 ? styles.outOfStock : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`${tableStyles.badge} ${tableStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className={tableStyles.actions}>
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

      {meta.pages > 1 && (
        <div className={styles.pagination}>
          <AdminBtn variant="secondary" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}>← Prev</AdminBtn>
          <span className={styles.pageInfo}>Page {page} of {meta.pages}</span>
          <AdminBtn variant="secondary" size="sm"
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page >= meta.pages}>Next →</AdminBtn>
        </div>
      )}
    </div>
  );
}
