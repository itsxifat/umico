'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { AdminInput, AdminSelect } from '@/components/admin/AdminInput';
import AdminBtn from '@/components/admin/AdminBtn';

export default function CouponForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usagePerUser: '1',
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: '',
    status: 'active',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.type || !form.value) {
      toast('Code, type and value are required.', { type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value) || 0,
          minOrderAmount: parseFloat(form.minOrderAmount) || 0,
          maxDiscountAmount: parseFloat(form.maxDiscountAmount) || 0,
          usageLimit: parseInt(form.usageLimit) || 0,
          usagePerUser: parseInt(form.usagePerUser) || 1,
          validUntil: form.validUntil || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast('Coupon created!', { type: 'success' });
        router.push('/admin/coupons');
      } else {
        toast(json.message, { type: 'error' });
      }
    } catch {
      toast('Failed to create coupon.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-[600px]">
      <div className="bg-surface border border-line p-6 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <AdminInput label="Coupon code *" value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20" />
          <AdminSelect label="Type *" value={form.type}
            onChange={(e) => set('type', e.target.value)}>
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="free_shipping">Free Shipping</option>
          </AdminSelect>
        </div>

        <AdminInput label="Description" value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Internal description" />

        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <AdminInput label={form.type === 'percentage' ? 'Discount (%) *' : 'Discount (৳) *'}
            type="number" step="0.01" value={form.value}
            onChange={(e) => set('value', e.target.value)} />
          <AdminInput label="Min order amount" type="number" step="0.01"
            value={form.minOrderAmount}
            onChange={(e) => set('minOrderAmount', e.target.value)}
            hint="Leave empty for no minimum" />
        </div>

        {form.type === 'percentage' && (
          <AdminInput label="Max discount cap (৳)" type="number" step="0.01"
            value={form.maxDiscountAmount}
            onChange={(e) => set('maxDiscountAmount', e.target.value)}
            hint="Cap the discount amount for percentage coupons" />
        )}

        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <AdminInput label="Total usage limit" type="number"
            value={form.usageLimit}
            onChange={(e) => set('usageLimit', e.target.value)}
            hint="0 = unlimited" />
          <AdminInput label="Usage per customer" type="number"
            value={form.usagePerUser}
            onChange={(e) => set('usagePerUser', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <AdminInput label="Valid from" type="date" value={form.validFrom}
            onChange={(e) => set('validFrom', e.target.value)} />
          <AdminInput label="Valid until" type="date" value={form.validUntil}
            onChange={(e) => set('validUntil', e.target.value)}
            hint="Leave empty for no expiry" />
        </div>

        <AdminSelect label="Status" value={form.status}
          onChange={(e) => set('status', e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </AdminSelect>

        <div className="flex gap-3 pt-4 border-t border-line">
          <AdminBtn type="submit" loading={saving}>Create coupon</AdminBtn>
          <AdminBtn variant="secondary" href="/admin/coupons">Cancel</AdminBtn>
        </div>
      </div>
    </form>
  );
}
