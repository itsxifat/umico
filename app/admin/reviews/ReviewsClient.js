'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminSelect } from '@/components/admin/AdminInput';

const STATUS_BADGE = {
  pending: 'bg-[rgba(196,138,60,0.12)] text-warning',
  approved: 'bg-[rgba(79,122,74,0.12)] text-success',
  rejected: 'bg-[rgba(200,50,50,0.1)] text-error',
};

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReviewsClient() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/reviews?${params}`);
      const json = await res.json();
      if (json.success) { setRows(json.data); setMeta(json.meta || {}); }
      else toast(json.message, { type: 'error' });
    } catch {
      toast('Failed to load reviews.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [status, page, toast]);

  useEffect(() => { load(); }, [load]);

  const updateReview = async (id, newStatus) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
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
        <div className="w-[160px]">
          <AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </AdminSelect>
        </div>
        <AdminBtn variant="secondary" onClick={load} size="sm">Refresh</AdminBtn>
        <span className="text-xs text-muted tracking-wide ml-auto">{meta.total || 0} reviews</span>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-16 px-4 text-muted italic">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center py-16 px-4 text-muted italic">No reviews found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map((r) => (
              <div key={r._id} className="bg-surface border border-line p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-warning text-sm tracking-wide">{stars(r.rating)}</span>
                      <span className={`inline-block px-2 py-0.5 text-[10px] tracking-wide rounded-full font-medium ${STATUS_BADGE[r.status] || ''}`}>
                        {r.status}
                      </span>
                      {r.verifiedPurchase && (
                        <span className="text-[10px] tracking-wide text-success font-medium">Verified</span>
                      )}
                    </div>
                    {r.title && <p className="text-sm font-medium text-ink">{r.title}</p>}
                    {r.body && <p className="text-sm text-muted mt-1">{r.body}</p>}
                  </div>
                  <div className="text-right text-xs text-muted flex-shrink-0">
                    <p>{r.user?.name || 'Unknown'}</p>
                    <p>{formatDate(r.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>Product:</span>
                  <span className="text-ink font-medium">{r.product?.name || '—'}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-line">
                  {r.status !== 'approved' && (
                    <AdminBtn variant="primary" size="sm" onClick={() => updateReview(r._id, 'approved')}>Approve</AdminBtn>
                  )}
                  {r.status !== 'rejected' && (
                    <AdminBtn variant="danger" size="sm" onClick={() => updateReview(r._id, 'rejected')}>Reject</AdminBtn>
                  )}
                </div>
              </div>
            ))}
          </div>
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
