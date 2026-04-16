'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import styles from './categories.module.css';
import tableStyles from '@/components/admin/AdminTable.module.css';

export default function CategoriesClient() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?q=${encodeURIComponent(q)}&limit=100`);
      const json = await res.json();
      if (json.success) setRows(json.data);
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Failed to load categories.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [q, toast]);

  useEffect(() => { load(); }, [load]);

  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast('Category deleted.', { type: 'success' });
        load();
      } else {
        toast(json.message, { type: 'error' });
      }
    } catch {
      toast('Delete failed.', { type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="search"
          placeholder="Search categories…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={styles.search}
        />
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
      </div>

      <div className={tableStyles.wrap}>
        {loading ? (
          <p className={tableStyles.empty}>Loading…</p>
        ) : rows.length === 0 ? (
          <p className={tableStyles.empty}>No categories yet. Create your first one.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Status</th>
                <th>Sort</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <div className={styles.nameCell}>
                      {cat.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.image} alt={cat.name} className={styles.thumb} />
                      )}
                      <strong>{cat.name}</strong>
                    </div>
                  </td>
                  <td className={styles.slug}>{cat.slug}</td>
                  <td>{cat.parent?.name || <span className={styles.none}>—</span>}</td>
                  <td>
                    <span className={`${tableStyles.badge} ${tableStyles[cat.status]}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>{cat.sortOrder}</td>
                  <td>
                    <div className={tableStyles.actions}>
                      <AdminBtn
                        href={`/admin/categories/${cat._id}/edit`}
                        variant="ghost" size="sm"
                      >Edit</AdminBtn>
                      <AdminBtn
                        variant="danger" size="sm"
                        onClick={() => del(cat._id, cat.name)}
                        loading={deletingId === cat._id}
                        disabled={!!deletingId}
                      >Delete</AdminBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
