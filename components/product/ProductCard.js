'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

function DiscountBadge({ price, compareAtPrice }) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const pct = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return (
    <span className="absolute top-3 left-3 z-[3] px-2.5 py-0.5 text-[11px] tracking-wide font-medium bg-secondary text-canvas">
      −{pct}%
    </span>
  );
}

function StarsDisplay({ rating, count }) {
  if (!count) return null;
  return (
    <div className="flex items-center gap-px mt-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`text-[13px] ${n <= Math.round(rating) ? 'text-accent' : 'text-line-strong'}`}>★</span>
      ))}
      <span className="text-xs text-muted ml-1">({count})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const img = product.mainImages?.[0];
  const img2 = product.mainImages?.[1];
  const inStock = product.hasVariants
    ? (product.variants || []).some((v) => v.stock > 0)
    : product.stock > 0;

  return (
    <article
      className="flex flex-col gap-4 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-square overflow-hidden bg-surface-alt">
          {img ? (
            <>
              <Image
                src={img.medium || img.url}
                alt={img.alt || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 group-hover:scale-[1.03] ${img2 && hovered ? 'opacity-0' : 'opacity-100'}`}
              />
              {img2 && (
                <Image
                  src={img2.medium || img2.url}
                  alt={img2.alt || product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className={`object-cover absolute inset-0 transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-surface-alt" />
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-[rgba(250,246,241,0.7)] flex items-center justify-center text-xs tracking-widest uppercase text-muted-fg z-[2]">
              Out of stock
            </div>
          )}
          <DiscountBadge price={product.price} compareAtPrice={product.compareAtPrice} />
          {product.isNewArrival && !product.compareAtPrice && (
            <span className="absolute top-3 left-3 z-[3] px-2.5 py-0.5 text-[11px] tracking-wide font-medium bg-accent text-canvas">
              New
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        {product.brand && (
          <Link href={`/brand/${product.brand.slug}`}
            className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">
            {product.brand.name}
          </Link>
        )}
        <Link href={`/product/${product.slug}`}
          className="font-serif text-base text-ink leading-snug hover:opacity-70 transition-opacity">
          {product.name}
        </Link>
        <StarsDisplay rating={product.averageRating} count={product.reviewCount} />
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-medium text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice > product.price && (
            <span className="text-sm text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
