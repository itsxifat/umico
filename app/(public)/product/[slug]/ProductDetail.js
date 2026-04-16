'use client';

import { useState, useMemo } from 'react';
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

          {/* Quantity + add to cart */}
          <div className="flex items-center gap-4 mt-2">
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
    </div>
  );
}
