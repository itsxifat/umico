'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function formatPrice(p) {
  return `৳${Number(p).toLocaleString()}`;
}

export default function CartClient() {
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  const readCart = useCallback(() => {
    try {
      const raw = localStorage.getItem('umico-cart');
      if (!raw) return setItems([]);
      const cart = JSON.parse(raw);
      setItems(cart.items || []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    readCart();
    window.addEventListener('umico:cart-changed', readCart);
    return () => window.removeEventListener('umico:cart-changed', readCart);
  }, [readCart]);

  const saveCart = (newItems) => {
    setItems(newItems);
    localStorage.setItem('umico-cart', JSON.stringify({ items: newItems }));
    window.dispatchEvent(new Event('umico:cart-changed'));
  };

  const updateQty = (key, delta) => {
    const next = items.map((it) => {
      if (it.key !== key) return it;
      const newQty = Math.max(0, it.quantity + delta);
      return { ...it, quantity: newQty };
    }).filter((it) => it.quantity > 0);
    saveCart(next);
  };

  const remove = (key) => {
    saveCart(items.filter((it) => it.key !== key));
  };

  const clearCart = () => saveCart([]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-xl text-muted mb-4">Your cart is empty</p>
        <Link href="/shop" className="inline-block px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 transition-opacity">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div>
      {/* Header row */}
      <div className="hidden min-[640px]:grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 pb-3 border-b border-line text-[10px] font-semibold tracking-widest uppercase text-muted">
        <span>Product</span>
        <span className="text-center">Price</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Total</span>
        <span className="w-8" />
      </div>

      {/* Cart items */}
      {items.map((item) => (
        <div key={item.key} className="grid grid-cols-[auto_1fr] min-[640px]:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 py-5 border-b border-line items-center">
          {/* Product info */}
          <div className="col-span-2 min-[640px]:col-span-1 flex items-center gap-4">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.name} className="w-16 h-16 min-[640px]:w-20 min-[640px]:h-20 object-cover border border-line flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 min-[640px]:w-20 min-[640px]:h-20 bg-surface-alt border border-line flex-shrink-0" />
            )}
            <div className="min-w-0">
              <Link href={`/product/${item.slug}`} className="text-sm font-medium text-ink hover:opacity-70 transition-opacity line-clamp-2">
                {item.name}
              </Link>
              {item.variantLabel && (
                <p className="text-xs text-muted mt-0.5">{item.variantLabel}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-center text-sm text-ink hidden min-[640px]:block">
            {formatPrice(item.price)}
          </div>

          {/* Quantity controls */}
          <div className="flex items-center justify-center">
            <div className="flex items-center border border-line-strong">
              <button type="button" onClick={() => updateQty(item.key, -1)}
                className="w-8 h-8 text-sm text-muted-fg hover:text-ink transition-colors">−</button>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-ink">{item.quantity}</span>
              <button type="button" onClick={() => updateQty(item.key, 1)}
                className="w-8 h-8 text-sm text-muted-fg hover:text-ink transition-colors">+</button>
            </div>
          </div>

          {/* Line total */}
          <div className="text-right text-sm font-medium text-ink">
            {formatPrice(item.price * item.quantity)}
          </div>

          {/* Remove */}
          <button type="button" onClick={() => remove(item.key)}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-error transition-colors text-lg">
            ×
          </button>
        </div>
      ))}

      {/* Summary */}
      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="w-full max-w-[320px] flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-line">
            <span className="font-medium text-ink">Subtotal</span>
            <span className="text-xl font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
          <Link href="/checkout"
            className="w-full py-3 bg-secondary text-canvas text-xs tracking-widest uppercase text-center hover:opacity-85 transition-opacity mt-2 block">
            Proceed to checkout
          </Link>
          <div className="flex gap-3">
            <Link href="/shop" className="flex-1 py-2.5 text-xs tracking-wide uppercase text-center border border-line-strong text-muted-fg hover:text-ink hover:border-ink transition-colors">
              Continue shopping
            </Link>
            <button type="button" onClick={clearCart}
              className="py-2.5 px-4 text-xs tracking-wide uppercase text-error border border-error hover:bg-error hover:text-white transition-colors">
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
