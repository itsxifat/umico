'use client';

import { signOut } from 'next-auth/react';

export default function AdminTopBar({ user }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 bg-surface border-b border-line max-[640px]:px-4 max-[640px]:pl-[calc(1rem+56px)]">
      <span className="font-serif text-base text-ink max-[640px]:text-sm">
        Welcome, {user.name.split(' ')[0]}
      </span>
      <div className="flex items-center gap-5">
        <span className="text-[10px] tracking-widest uppercase text-muted px-2.5 py-1 border border-line-strong rounded-full">
          {user.role}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs tracking-wide text-muted-fg uppercase py-2 px-3 border border-line transition-colors hover:text-ink hover:border-ink"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
