'use client';

import { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';

const fieldCls = 'flex flex-col gap-2';
const labelCls = 'text-xs tracking-wide uppercase text-muted-fg font-medium';
const inputCls = 'px-4 py-3 bg-canvas border border-line-strong text-ink text-sm w-full focus:outline-none focus:border-ink transition-colors';

export default function ProfileForm({ user }) {
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        toast('Profile updated.', { type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        toast(json.message || 'Update failed.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <nav className="flex items-center gap-2 text-xs text-muted tracking-wide mb-2">
        <Link href="/account" className="hover:text-ink transition-colors">Account</Link>
        <span>/</span>
        <span className="text-muted-fg">Profile</span>
      </nav>

      <div className="bg-surface border border-line p-6 flex flex-col gap-4">
        <h2 className="font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line">
          Personal info
        </h2>
        <label className={fieldCls}>
          <span className={labelCls}>Full name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
        </label>
        <label className={fieldCls}>
          <span className={labelCls}>Email</span>
          <input type="email" value={user.email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
        </label>
        <label className={fieldCls}>
          <span className={labelCls}>Phone</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </label>
      </div>

      <div className="bg-surface border border-line p-6 flex flex-col gap-4">
        <h2 className="font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line">
          Change password
        </h2>
        <label className={fieldCls}>
          <span className={labelCls}>Current password</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} autoComplete="current-password" />
        </label>
        <label className={fieldCls}>
          <span className={labelCls}>New password</span>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} autoComplete="new-password" />
        </label>
        <p className="text-xs text-muted">Leave blank to keep current password.</p>
      </div>

      <button type="submit" disabled={saving}
        className="self-start px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
