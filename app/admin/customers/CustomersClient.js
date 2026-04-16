'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminSelect } from '@/components/admin/AdminInput';

const STATUS_BADGE = {
  active: 'bg-[rgba(79,122,74,0.12)] text-success',
  suspended: 'bg-[rgba(196,138,60,0.12)] text-warning',
  banned: 'bg-[rgba(200,50,50,0.1)] text-error',
  timeout: 'bg-[rgba(196,138,60,0.12)] text-warning',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomersClient() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, page, limit: 20 });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/customers?${params}`);
      const json = await res.json();
      if (json.success) { setRows(json.data); setMeta(json.meta || {}); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Failed to load customers.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [q, status, page, toast]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
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
          type="search" placeholder="Search name, email, phone…" value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] max-w-[360px] px-4 py-3 border border-line-strong bg-surface text-ink text-sm focus:outline-none focus:border-ink"
        />
        <div className="w-[160px]">
          <AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </AdminSelect>
        </div>
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
        <span className="text-xs text-muted tracking-wide ml-auto">{meta.total || 0} customers</span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-16 px-4 text-muted italic">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-16 px-4 text-muted italic">No customers found.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Customer', 'Email', 'Phone', 'Status', 'Joined', ''].map((h) => (
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
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-alt border border-line flex items-center justify-center text-xs font-medium text-muted flex-shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-ink">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">{c.email}</td>
                  <td className="px-4 py-4 border-b border-line align-middle text-ink">{c.phone || '—'}</td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] tracking-wide rounded-full font-medium ${STATUS_BADGE[c.status] || ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle text-xs text-muted">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-4 border-b border-line align-middle">
                    <div className="flex gap-2 justify-end">
                      {c.status === 'active' ? (
                        <AdminBtn variant="danger" size="sm" onClick={() => updateStatus(c._id, 'suspended')}>Suspend</AdminBtn>
                      ) : c.status === 'suspended' ? (
                        <AdminBtn variant="secondary" size="sm" onClick={() => updateStatus(c._id, 'active')}>Reactivate</AdminBtn>
                      ) : c.status === 'banned' ? (
                        <AdminBtn variant="secondary" size="sm" onClick={() => updateStatus(c._id, 'active')}>Unban</AdminBtn>
                      ) : null}
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
