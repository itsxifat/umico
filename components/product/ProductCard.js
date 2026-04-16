'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './ProductCard.module.css';

const SUITABILITY_LABELS = {
  primarily_women: 'For Her',
  primarily_men: 'For Him',
  everyone: 'For Everyone',
  unisex: 'Unisex',
};

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

function DiscountBadge({ price, compareAtPrice }) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const pct = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return <span className={styles.discountBadge}>−{pct}%</span>;
}

function StarsDisplay({ rating, count }) {
  if (!count) return null;
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
      <span className={styles.reviewCount}>({count})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const img = product.mainImages?.[0];
  const img2 = product.mainImages?.[1]; // second image on hover
  const inStock = product.hasVariants
    ? (product.variants || []).some((v) => v.stock > 0)
    : product.stock > 0;

  return (
    <article
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className={styles.imageLink} aria-label={product.name}>
        <div className={styles.imageWrap}>
          {img ? (
            <>
              <Image
                src={img.medium || img.url}
                alt={img.alt || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className={`${styles.image} ${img2 && hovered ? styles.imageFaded : ''}`}
              />
              {img2 && (
                <Image
                  src={img2.medium || img2.url}
                  alt={img2.alt || product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className={`${styles.image} ${styles.imageHover} ${hovered ? styles.imageHoverVisible : ''}`}
                />
              )}
            </>
          ) : (
            <div className={styles.imagePlaceholder} />
          )}
          {!inStock && <div className={styles.outOfStockOverlay}>Out of stock</div>}
          <DiscountBadge price={product.price} compareAtPrice={product.compareAtPrice} />
          {product.isNewArrival && !product.compareAtPrice && (
            <span className={styles.newBadge}>New</span>
          )}
        </div>
      </Link>

      <div className={styles.info}>
        {product.brand && (
          <Link href={`/brand/${product.brand.slug}`} className={styles.brand}>
            {product.brand.name}
          </Link>
        )}
        <Link href={`/product/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>
        <StarsDisplay rating={product.averageRating} count={product.reviewCount} />
        <div className={styles.pricing}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.compareAtPrice > product.price && (
            <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
