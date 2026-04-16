'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import styles from './brands.module.css';
import tableStyles from '@/components/admin/AdminTable.module.css';

export default function BrandsClient() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands?q=${encodeURIComponent(q)}&limit=100`);
      const json = await res.json();
      if (json.success) setRows(json.data);
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Failed to load brands.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [q, toast]);

  useEffect(() => { load(); }, [load]);

  const del = async (id, name) => {
    if (!confirm(`Delete brand "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { toast('Brand deleted.', { type: 'success' }); load(); }
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
        <input type="search" placeholder="Search brands…" value={q}
          onChange={(e) => setQ(e.target.value)} className={styles.search} />
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
      </div>

      <div className={tableStyles.wrap}>
        {loading ? (
          <p className={tableStyles.empty}>Loading…</p>
        ) : rows.length === 0 ? (
          <p className={tableStyles.empty}>No brands yet. Add your first brand.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Brand</th>
                <th>Slug</th>
                <th>Country</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div className={styles.nameCell}>
                      {b.logo
                        ? <img src={b.logo} alt={b.name} className={styles.logo} />
                        : <div className={styles.logoPlaceholder}>{b.name[0]}</div>
                      }
                      <strong>{b.name}</strong>
                    </div>
                  </td>
                  <td className={styles.slug}>{b.slug}</td>
                  <td>{b.countryOfOrigin || <span className={styles.none}>—</span>}</td>
                  <td>
                    <span className={`${tableStyles.badge} ${tableStyles[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className={tableStyles.actions}>
                      <AdminBtn href={`/admin/brands/${b._id}/edit`} variant="ghost" size="sm">Edit</AdminBtn>
                      <AdminBtn variant="danger" size="sm"
                        onClick={() => del(b._id, b.name)}
                        loading={deletingId === b._id} disabled={!!deletingId}
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
