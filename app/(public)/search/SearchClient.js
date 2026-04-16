'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (query, pg = 1) => {
    if (!query || query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: query.trim(), page: pg, limit: 20 });
      const res = await fetch(`/api/search?${params}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        setMeta(json.meta || {});
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQ) search(initialQ);
  }, [initialQ, search]);

  const onSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    search(q, 1);
    window.history.replaceState(null, '', `/search?q=${encodeURIComponent(q)}`);
  };

  const goPage = (pg) => {
    setPage(pg);
    search(q, pg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="max-w-[600px] mx-auto mb-10">
        <div className="flex border border-line-strong bg-surface">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="flex-1 px-4 py-3 text-ink text-sm bg-transparent focus:outline-none"
            autoFocus
          />
          <button type="submit" className="px-6 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 transition-opacity">
            Search
          </button>
        </div>
      </form>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-surface-alt border border-line" />
              <div className="mt-3 h-3 bg-surface-alt rounded w-3/4" />
              <div className="mt-2 h-3 bg-surface-alt rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif text-xl text-muted mb-2">No results found</p>
          <p className="text-sm text-muted">Try a different search term</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-xs text-muted tracking-wide mb-6">
            {meta.total} result{meta.total !== 1 ? 's' : ''} for &ldquo;{meta.query}&rdquo;
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {meta.pages > 1 && (
            <div className="flex items-center gap-4 mt-10 justify-center">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 border border-line-strong text-xs tracking-wide uppercase text-muted disabled:opacity-30 hover:border-ink hover:text-ink transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm text-muted">Page {page} of {meta.pages}</span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= meta.pages}
                className="px-4 py-2 border border-line-strong text-xs tracking-wide uppercase text-muted disabled:opacity-30 hover:border-ink hover:text-ink transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
