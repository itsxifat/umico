'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'highest_rated', label: 'Top Rated' },
];

const SUITABILITY_OPTIONS = [
  { value: 'everyone', label: 'For Everyone' },
  { value: 'primarily_women', label: 'For Her' },
  { value: 'primarily_men', label: 'For Him' },
  { value: 'unisex', label: 'Unisex' },
];

export default function ShopClient({ categories, brands, initialParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') || '');
  const [brandSlug, setBrandSlug] = useState(searchParams.get('brand') || '');
  const [suitability, setSuitability] = useState(searchParams.get('suitability') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Data
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (sort !== 'newest') p.set('sort', sort);
    if (categorySlug) p.set('category', categorySlug);
    if (brandSlug) p.set('brand', brandSlug);
    if (suitability) p.set('suitability', suitability);
    if (minPrice) p.set('minPrice', minPrice);
    if (maxPrice) p.set('maxPrice', maxPrice);
    if (page > 1) p.set('page', page);
    p.set('limit', '24');
    return p;
  }, [q, sort, categorySlug, brandSlug, suitability, minPrice, maxPrice, page]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        setMeta(json.meta || { total: 0, pages: 1 });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Sync URL
  useEffect(() => {
    const params = buildParams();
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [buildParams, pathname, router]);

  useEffect(() => { load(); }, [load]);

  const resetPage = () => setPage(1);

  const filterSidebar = (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-3">Search</h3>
        <input
          type="search"
          placeholder="Search products…"
          value={q}
          onChange={(e) => { setQ(e.target.value); resetPage(); }}
          className="w-full px-3 py-2.5 border border-line-strong bg-canvas text-ink text-sm focus:outline-none focus:border-ink"
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-3">Category</h3>
          <ul className="flex flex-col gap-1.5">
            <li>
              <button
                type="button"
                onClick={() => { setCategorySlug(''); resetPage(); }}
                className={`text-sm transition-colors ${!categorySlug ? 'text-ink font-medium' : 'text-muted-fg hover:text-ink'}`}
              >
                All
              </button>
            </li>
            {categories.map((c) => (
              <li key={c._id}>
                <button
                  type="button"
                  onClick={() => { setCategorySlug(c.slug); resetPage(); }}
                  className={`text-sm transition-colors ${categorySlug === c.slug ? 'text-ink font-medium' : 'text-muted-fg hover:text-ink'}`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-3">Brand</h3>
          <ul className="flex flex-col gap-1.5">
            <li>
              <button
                type="button"
                onClick={() => { setBrandSlug(''); resetPage(); }}
                className={`text-sm transition-colors ${!brandSlug ? 'text-ink font-medium' : 'text-muted-fg hover:text-ink'}`}
              >
                All
              </button>
            </li>
            {brands.map((b) => (
              <li key={b._id}>
                <button
                  type="button"
                  onClick={() => { setBrandSlug(b.slug); resetPage(); }}
                  className={`text-sm transition-colors ${brandSlug === b.slug ? 'text-ink font-medium' : 'text-muted-fg hover:text-ink'}`}
                >
                  {b.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suitability */}
      <div>
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-3">Suitability</h3>
        <ul className="flex flex-col gap-1.5">
          <li>
            <button type="button" onClick={() => { setSuitability(''); resetPage(); }}
              className={`text-sm transition-colors ${!suitability ? 'text-ink font-medium' : 'text-muted-fg hover:text-ink'}`}>
              All
            </button>
          </li>
          {SUITABILITY_OPTIONS.map((o) => (
            <li key={o.value}>
              <button type="button" onClick={() => { setSuitability(o.value); resetPage(); }}
                className={`text-sm transition-colors ${suitability === o.value ? 'text-ink font-medium' : 'text-muted-fg hover:text-ink'}`}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-3">Price (৳)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number" min="0" placeholder="Min"
            value={minPrice} onChange={(e) => { setMinPrice(e.target.value); resetPage(); }}
            className="w-full px-2 py-2 border border-line-strong bg-canvas text-ink text-sm focus:outline-none focus:border-ink"
          />
          <span className="text-muted text-sm">–</span>
          <input
            type="number" min="0" placeholder="Max"
            value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); resetPage(); }}
            className="w-full px-2 py-2 border border-line-strong bg-canvas text-ink text-sm focus:outline-none focus:border-ink"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-10 items-start">
      {/* Desktop sidebar */}
      <aside className="w-52 flex-shrink-0 sticky top-[80px] hidden min-[900px]:block">
        {filterSidebar}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar: mobile filter toggle + sort */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <button
            type="button"
            className="min-[900px]:hidden text-xs tracking-wide uppercase text-muted-fg border border-line-strong px-4 py-2 hover:border-ink hover:text-ink transition-colors"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-muted hidden min-[640px]:block">{meta.total} products</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); resetPage(); }}
              className="px-3 py-2 border border-line-strong bg-canvas text-ink text-xs tracking-wide appearance-none cursor-pointer focus:outline-none focus:border-ink"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 min-[640px]:grid-cols-3 min-[1024px]:grid-cols-4 gap-x-4 gap-y-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-square bg-surface-alt animate-pulse" />
                <div className="h-3 bg-surface-alt animate-pulse w-2/3" />
                <div className="h-3 bg-surface-alt animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-muted mb-2">No products found</p>
            <p className="text-sm text-muted">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 min-[640px]:grid-cols-3 min-[1024px]:grid-cols-4 gap-x-4 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-5 py-3 text-xs tracking-wide uppercase border border-line-strong text-muted-fg hover:text-ink hover:border-ink disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm text-muted px-2">
              Page {page} of {meta.pages}
            </span>
            <button
              type="button"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              className="px-5 py-3 text-xs tracking-wide uppercase border border-line-strong text-muted-fg hover:text-ink hover:border-ink disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] min-[900px]:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute inset-0 bg-[var(--color-overlay)]" />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-canvas p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg">Filters</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="text-2xl leading-none text-muted hover:text-ink">×</button>
            </div>
            {filterSidebar}
          </div>
        </div>
      )}
    </div>
  );
}
