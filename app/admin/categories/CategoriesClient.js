'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';

const BADGE = {
  active: 'bg-[rgba(79,122,74,0.12)] text-success',
  inactive: 'bg-[rgba(42,24,16,0.08)] text-muted',
  draft: 'bg-[rgba(196,138,60,0.12)] text-warning',
};

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
      {/* Toolbar */}
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <input
          type="search"
          placeholder="Search categories…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] max-w-[360px] px-4 py-3 border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:border-ink"
        />
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-16 px-4 text-muted italic">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-16 px-4 text-muted italic">No categories yet. Create your first one.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Name', 'Slug', 'Parent', 'Status', 'Sort', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-muted border-b border-line bg-surface whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((cat) => (
                <tr key={cat._id} className="transition-colors hover:bg-surface-alt">
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">
                    <div className="flex items-center gap-3">
                      {cat.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.image} alt={cat.name} className="w-9 h-9 object-cover border border-line flex-shrink-0" />
                      )}
                      <strong>{cat.name}</strong>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle font-mono text-xs text-muted">{cat.slug}</td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">{cat.parent?.name || <span className="text-muted">—</span>}</td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] tracking-wide rounded-full font-medium ${BADGE[cat.status] || ''}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">{cat.sortOrder}</td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <div className="flex gap-2 justify-end">
                      <AdminBtn href={`/admin/categories/${cat._id}/edit`} variant="ghost" size="sm">Edit</AdminBtn>
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
