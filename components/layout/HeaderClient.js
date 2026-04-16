'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const iconBtnCls = 'relative inline-flex items-center justify-center w-10 h-10 text-ink hover:opacity-65 transition-opacity';

export function MobileMenuButton() {
  const toggle = () => {
    const el = document.getElementById('umico-mobile-nav');
    if (!el) return;
    const isOpen = el.dataset.open === 'true';
    el.dataset.open = String(!isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  };

  return (
    <button
      type="button"
      className={`${iconBtnCls} min-[900px]:hidden`}
      aria-label="Open menu"
      onClick={toggle}
    >
      <span className="inline-flex flex-col gap-[5px] w-5">
        <span className="block h-px bg-current w-full transition-transform" />
        <span className="block h-px bg-current w-full transition-transform" />
        <span className="block h-px bg-current w-full transition-transform" />
      </span>
    </button>
  );
}

export function MobileMenuPanel({ menuItems }) {
  const close = () => {
    const el = document.getElementById('umico-mobile-nav');
    if (!el) return;
    el.dataset.open = 'false';
    document.body.style.overflow = '';
  };

  return (
    <div
      id="umico-mobile-nav"
      data-open="false"
      className="fixed inset-0 bg-canvas z-[var(--z-modal)] px-6 pb-6 pt-16 -translate-y-full pointer-events-none transition-transform duration-300 data-[open=true]:translate-y-0 data-[open=true]:pointer-events-auto min-[900px]:hidden"
    >
      <button
        type="button"
        className="absolute top-4 right-4 w-11 h-11 text-3xl leading-none text-ink"
        onClick={close}
        aria-label="Close menu"
      >
        ×
      </button>
      <nav aria-label="Mobile">
        {menuItems.length === 0 ? (
          <p className="text-muted italic">Menu not configured yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {menuItems.map((item, i) => (
              <li key={i}>
                <Link
                  href={item.url || '#'}
                  onClick={close}
                  className="block font-serif text-2xl text-ink py-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}

export function SearchButton() {
  return (
    <Link href="/search" className={iconBtnCls} aria-label="Search">
      <SearchIcon />
    </Link>
  );
}

export function AccountButton() {
  return (
    <Link href="/account" className={iconBtnCls} aria-label="Account">
      <UserIcon />
    </Link>
  );
}

export function WishlistButton() {
  return (
    <Link href="/wishlist" className={iconBtnCls} aria-label="Wishlist">
      <HeartIcon />
    </Link>
  );
}

export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('umico-cart');
        if (!raw) return setCount(0);
        const parsed = JSON.parse(raw);
        const total = (parsed.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0);
        setCount(total);
      } catch {
        setCount(0);
      }
    };
    read();
    window.addEventListener('umico:cart-changed', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('umico:cart-changed', read);
      window.removeEventListener('storage', read);
    };
  }, []);

  return (
    <Link href="/cart" className={iconBtnCls} aria-label="Cart">
      <BagIcon />
      {count > 0 && (
        <span className="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 text-[10px] leading-4 font-sans text-center bg-secondary text-canvas rounded-full font-medium">
          {count}
        </span>
      )}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-5 5-7 8-7s7 2 8 7" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s-7-4.5-9-9C1.5 8 4 5 7 5c2 0 4 1 5 3 1-2 3-3 5-3 3 0 5.5 3 4 7-2 4.5-9 9-9 9z" strokeLinejoin="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 7h14l-1.2 12.5a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7z" strokeLinejoin="round" />
      <path d="M9 7V5.5A3 3 0 0 1 12 2.5 3 3 0 0 1 15 5.5V7" strokeLinecap="round" />
    </svg>
  );
}
