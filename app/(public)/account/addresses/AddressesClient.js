'use client';

import { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';

const fieldCls = 'flex flex-col gap-1';
const labelCls = 'text-xs tracking-wide uppercase text-muted-fg font-medium';
const inputCls = 'px-3 py-2.5 bg-canvas border border-line-strong text-ink text-sm w-full focus:outline-none focus:border-ink transition-colors';

export default function AddressesClient({ initialAddresses }) {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', area: '', postalCode: '', isDefault: false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast('Address added.', { type: 'success' });
        setAddresses(json.data.addresses || []);
        setShowForm(false);
        setForm({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', area: '', postalCode: '', isDefault: false });
      } else {
        toast(json.message || 'Failed.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (idx) => {
    if (!confirm('Remove this address?')) return;
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: idx }),
      });
      const json = await res.json();
      if (json.success) {
        toast('Address removed.', { type: 'success' });
        setAddresses(json.data.addresses || []);
      } else {
        toast(json.message || 'Failed.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    }
  };

  return (
    <div>
      {addresses.length === 0 && !showForm && (
        <p className="text-muted text-center py-12">No saved addresses yet.</p>
      )}

      {/* Existing addresses */}
      <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-4 mb-6">
        {addresses.map((a, i) => (
          <div key={i} className="border border-line bg-surface p-5 flex flex-col gap-1.5 relative">
            {a.isDefault && (
              <span className="absolute top-3 right-3 text-[10px] tracking-widest uppercase text-accent font-medium">Default</span>
            )}
            {a.label && <span className="text-xs tracking-wide uppercase text-muted-fg font-medium">{a.label}</span>}
            <p className="text-sm font-medium text-ink">{a.fullName}</p>
            <p className="text-sm text-muted-fg">{a.addressLine1}</p>
            {a.addressLine2 && <p className="text-sm text-muted-fg">{a.addressLine2}</p>}
            <p className="text-sm text-muted-fg">{[a.area, a.city, a.postalCode].filter(Boolean).join(', ')}</p>
            {a.phone && <p className="text-sm text-muted">{a.phone}</p>}
            <button type="button" onClick={() => onDelete(i)} className="mt-2 text-xs text-error hover:underline self-start">
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add address */}
      {!showForm ? (
        <button type="button" onClick={() => setShowForm(true)}
          className="px-6 py-3 border border-line-strong text-xs tracking-wide uppercase text-muted-fg hover:text-ink hover:border-ink transition-colors">
          + Add new address
        </button>
      ) : (
        <form onSubmit={onSubmit} className="border border-line bg-surface p-6 flex flex-col gap-4">
          <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line">New address</h3>
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <label className={fieldCls}><span className={labelCls}>Label</span>
              <input type="text" value={form.label} onChange={(e) => set('label', e.target.value)} className={inputCls} placeholder="e.g. Home, Office" /></label>
            <label className={fieldCls}><span className={labelCls}>Full name</span>
              <input type="text" required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls} /></label>
          </div>
          <label className={fieldCls}><span className={labelCls}>Phone</span>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} /></label>
          <label className={fieldCls}><span className={labelCls}>Address line 1</span>
            <input type="text" required value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} className={inputCls} /></label>
          <label className={fieldCls}><span className={labelCls}>Address line 2</span>
            <input type="text" value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} className={inputCls} /></label>
          <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
            <label className={fieldCls}><span className={labelCls}>City</span>
              <input type="text" required value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} /></label>
            <label className={fieldCls}><span className={labelCls}>Area</span>
              <input type="text" value={form.area} onChange={(e) => set('area', e.target.value)} className={inputCls} /></label>
            <label className={fieldCls}><span className={labelCls}>Postal code</span>
              <input type="text" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} className={inputCls} /></label>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} />
            <span>Set as default address</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-6 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 disabled:opacity-50 transition-opacity">
              {saving ? 'Saving…' : 'Save address'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-line-strong text-xs tracking-wide uppercase text-muted-fg hover:text-ink transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
