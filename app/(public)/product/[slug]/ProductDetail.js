'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

function StarsDisplay({ rating, count }) {
  if (!count) return null;
  return (
    <div className="flex items-center gap-px" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`text-sm ${n <= Math.round(rating) ? 'text-accent' : 'text-line-strong'}`}>★</span>
      ))}
      <span className="text-xs text-muted ml-2">({count} reviews)</span>
    </div>
  );
}

export default function ProductDetail({ product }) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const images = product.mainImages || [];
  const hasVariants = product.hasVariants && product.variants?.length > 0;
  const dims = product.variantDimensions || [];

  // Build option values per dimension from variants
  const dimOptions = useMemo(() => {
    if (!hasVariants) return {};
    const map = {};
    for (const d of dims) {
      const vals = new Set();
      product.variants.forEach((v) => {
        if (v.dimensionValues?.[d]) vals.add(v.dimensionValues[d]);
      });
      map[d] = [...vals];
    }
    return map;
  }, [hasVariants, dims, product.variants]);

  const [selections, setSelections] = useState(() => {
    const s = {};
    dims.forEach((d) => { s[d] = ''; });
    return s;
  });

  // Find matching variant
  const matchedVariant = useMemo(() => {
    if (!hasVariants) return null;
    const allSelected = dims.every((d) => selections[d]);
    if (!allSelected) return null;
    return product.variants.find((v) =>
      dims.every((d) => v.dimensionValues?.[d] === selections[d])
    ) || null;
  }, [hasVariants, dims, selections, product.variants]);

  const currentPrice = matchedVariant?.price || product.price;
  const currentCompare = matchedVariant?.compareAtPrice || product.compareAtPrice;
  const currentStock = matchedVariant ? matchedVariant.stock : product.stock;
  const inStock = currentStock > 0;
  const discount = currentCompare > currentPrice
    ? Math.round(((currentCompare - currentPrice) / currentCompare) * 100) : 0;

  const addToCart = () => {
    if (hasVariants && !matchedVariant) return;
    try {
      const raw = localStorage.getItem('umico-cart');
      const cart = raw ? JSON.parse(raw) : { items: [] };
      const key = matchedVariant
        ? `${product._id}-${Object.values(matchedVariant.dimensionValues).join('-')}`
        : product._id;

      const existing = cart.items.find((it) => it.key === key);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.items.push({
          key,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: currentPrice,
          image: images[0]?.thumbnail || images[0]?.url || '',
          variant: matchedVariant?.dimensionValues || null,
          variantLabel: matchedVariant
            ? Object.values(matchedVariant.dimensionValues).join(' / ')
            : null,
          quantity: qty,
        });
      }
      localStorage.setItem('umico-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('umico:cart-changed'));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {}
  };

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w)] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted mb-8 tracking-wide">
        <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-ink transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-muted-fg">{product.name}</span>
      </nav>

      <div className="grid gap-10 min-[900px]:gap-16 items-start" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }} data-product-grid>
        {/* Image gallery */}
        <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex min-[900px]:flex-col gap-2 order-2 min-[900px]:order-1 min-[900px]:w-16">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIdx(i)}
                  className={`relative w-14 h-14 min-[900px]:w-16 min-[900px]:h-16 overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    selectedImageIdx === i ? 'border-accent' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <Image src={img.thumbnail || img.url} alt={img.alt || ''} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
          {/* Main image */}
          <div className="relative aspect-square flex-1 overflow-hidden bg-surface-alt order-1 min-[900px]:order-2">
            {images[selectedImageIdx] ? (
              <Image
                src={images[selectedImageIdx].large || images[selectedImageIdx].url}
                alt={images[selectedImageIdx].alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">No image</div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-[rgba(250,246,241,0.7)] flex items-center justify-center text-xs tracking-widest uppercase text-muted-fg z-[2]">
                Out of stock
              </div>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          {product.brand && (
            <Link href={`/brand/${product.brand.slug}`} className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">
              {product.brand.name}
            </Link>
          )}

          <h1 className="font-serif text-[clamp(1.5rem,3vw,2.5rem)] leading-tight">{product.name}</h1>

          <StarsDisplay rating={product.averageRating} count={product.reviewCount} />

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-medium text-ink">{formatPrice(currentPrice)}</span>
            {currentCompare > currentPrice && (
              <>
                <span className="text-base text-muted line-through">{formatPrice(currentCompare)}</span>
                <span className="text-xs tracking-wide font-medium bg-secondary text-canvas px-2 py-0.5">
                  −{discount}%
                </span>
              </>
            )}
          </div>

          {/* Variant selectors */}
          {hasVariants && dims.map((dim) => (
            <div key={dim} className="flex flex-col gap-2">
              <span className="text-xs tracking-wide uppercase text-muted-fg font-medium">
                {dim}{selections[dim] ? `: ${selections[dim]}` : ''}
              </span>
              <div className="flex flex-wrap gap-2">
                {(dimOptions[dim] || []).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelections((s) => ({ ...s, [dim]: opt }))}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      selections[dim] === opt
                        ? 'border-ink text-ink bg-surface-alt'
                        : 'border-line-strong text-muted-fg hover:border-ink hover:text-ink'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + add to cart + wishlist */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center border border-line-strong">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 text-lg text-muted-fg hover:text-ink transition-colors">−</button>
              <span className="w-10 h-10 flex items-center justify-center text-sm font-medium text-ink">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 text-lg text-muted-fg hover:text-ink transition-colors">+</button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!inStock || (hasVariants && !matchedVariant)}
              className="flex-1 py-3 px-8 bg-secondary text-canvas text-xs tracking-widest uppercase transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {added ? '✓ Added to cart' : !inStock ? 'Out of stock' : (hasVariants && !matchedVariant) ? 'Select options' : 'Add to cart'}
            </button>
            <WishlistBtn productId={product._id} />
          </div>

          {/* Stock indicator */}
          {inStock && currentStock <= 10 && (
            <p className="text-xs text-warning">Only {currentStock} left in stock</p>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-4 pt-6 border-t border-line">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">Description</h2>
              <div className="text-sm text-muted-fg leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <div className="pt-4 border-t border-line">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">Ingredients</h2>
              <p className="text-sm text-muted-fg leading-relaxed">{product.ingredients}</p>
            </div>
          )}

          {/* How to use */}
          {product.howToUse && (
            <div className="pt-4 border-t border-line">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">How to use</h2>
              <p className="text-sm text-muted-fg leading-relaxed">{product.howToUse}</p>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {product.tags.map((tag) => (
                <Link key={tag} href={`/shop?q=${encodeURIComponent(tag)}`}
                  className="text-xs tracking-wide px-3 py-1 border border-line text-muted hover:text-ink hover:border-ink transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <ReviewsSection productId={product._id} />
    </div>
  );
}

function WishlistBtn({ productId }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const method = wishlisted ? 'DELETE' : 'POST';
      const res = await fetch('/api/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (json.success) setWishlisted(!wishlisted);
    } catch {} finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-label="Add to wishlist"
      className={`w-12 h-12 flex items-center justify-center border transition-colors flex-shrink-0 ${
        wishlisted ? 'border-secondary text-secondary bg-[rgba(var(--color-secondary-rgb,42,24,16),0.05)]' : 'border-line-strong text-muted-fg hover:text-ink hover:border-ink'
      }`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21s-7-4.5-9-9C1.5 8 4 5 7 5c2 0 4 1 5 3 1-2 3-3 5-3 3 0 5.5 3 4 7-2 4.5-9 9-9 9z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?product=${productId}`);
      const json = await res.json();
      if (json.success) {
        setReviews(json.data);
        setStats(json.meta?.stats || null);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, body: body }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitMsg('Review submitted! It will appear after approval.');
        setShowForm(false);
        setTitle('');
        setBody('');
        setRating(5);
      } else {
        setSubmitMsg(json.message || 'Failed to submit.');
      }
    } catch {
      setSubmitMsg('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="mt-16 pt-10 border-t border-line">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h2 className="font-serif text-[clamp(1.25rem,2vw,1.75rem)] mb-2">Customer Reviews</h2>
          {stats && stats.count > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-medium text-ink">{stats.avg?.toFixed(1)}</span>
              <div className="flex items-center gap-px">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`text-sm ${n <= Math.round(stats.avg) ? 'text-accent' : 'text-line-strong'}`}>★</span>
                ))}
              </div>
              <span className="text-xs text-muted">({stats.count} review{stats.count !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 border border-line-strong text-xs tracking-widest uppercase text-muted-fg hover:text-ink hover:border-ink transition-colors"
        >
          Write a review
        </button>
      </div>

      {submitMsg && (
        <p className="text-sm text-success mb-4">{submitMsg}</p>
      )}

      {showForm && (
        <form onSubmit={submitReview} className="bg-surface border border-line p-6 mb-8 flex flex-col gap-4 max-w-[500px]">
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide uppercase text-muted-fg font-medium">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-xl ${n <= rating ? 'text-accent' : 'text-line-strong'}`}>★</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide uppercase text-muted-fg font-medium">Title</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 bg-canvas border border-line-strong text-ink text-sm focus:outline-none focus:border-ink" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide uppercase text-muted-fg font-medium">Your review</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3}
              className="px-3 py-2 bg-canvas border border-line-strong text-ink text-sm resize-y focus:outline-none focus:border-ink" />
          </div>
          <button type="submit" disabled={submitting}
            className="self-start px-6 py-2.5 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted py-8">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((r) => (
            <div key={r._id} className="pb-6 border-b border-line last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-px">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`text-xs ${n <= r.rating ? 'text-accent' : 'text-line-strong'}`}>★</span>
                  ))}
                </div>
                {r.verifiedPurchase && (
                  <span className="text-[10px] tracking-wide text-success font-medium">Verified Purchase</span>
                )}
              </div>
              {r.title && <p className="text-sm font-medium text-ink mb-1">{r.title}</p>}
              {r.body && <p className="text-sm text-muted-fg leading-relaxed">{r.body}</p>}
              <p className="text-xs text-muted mt-2">
                {r.user?.name || 'Anonymous'} — {new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              {r.reply?.body && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-accent">
                  <p className="text-xs font-medium text-accent mb-1">UMICO Team</p>
                  <p className="text-sm text-muted-fg">{r.reply.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
