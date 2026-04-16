'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';

const BADGE = {
  active: 'bg-[rgba(79,122,74,0.12)] text-success',
  inactive: 'bg-[rgba(42,24,16,0.08)] text-muted',
  draft: 'bg-[rgba(196,138,60,0.12)] text-warning',
};

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
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <input
          type="search" placeholder="Search brands…" value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] max-w-[360px] px-4 py-3 border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:border-ink"
        />
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-16 px-4 text-muted italic">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-16 px-4 text-muted italic">No brands yet. Add your first brand.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Brand', 'Slug', 'Country', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-muted border-b border-line bg-surface whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id} className="transition-colors hover:bg-surface-alt">
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">
                    <div className="flex items-center gap-3">
                      {b.logo
                        ? <img src={b.logo} alt={b.name} className="w-9 h-9 object-contain border border-line flex-shrink-0 p-1" />
                        : <div className="w-9 h-9 bg-surface-alt border border-line flex items-center justify-center text-xs font-medium text-muted-fg flex-shrink-0">{b.name[0]}</div>
                      }
                      <strong>{b.name}</strong>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle font-mono text-xs text-muted">{b.slug}</td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">{b.countryOfOrigin || <span className="text-muted">—</span>}</td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] tracking-wide rounded-full font-medium ${BADGE[b.status] || ''}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <div className="flex gap-2 justify-end">
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
