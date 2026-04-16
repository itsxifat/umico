'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminInput';

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

const sectionCls = 'bg-surface border border-line p-6 flex flex-col gap-4';
const sectionTitleCls = 'font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line';

export default function BrandForm({ initial }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initial?.description || '');
  const [countryOfOrigin, setCountry] = useState(initial?.countryOfOrigin || '');
  const [website, setWebsite] = useState(initial?.website || '');
  const [status, setStatus] = useState(initial?.status || 'active');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initial?.logo || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  const onLogoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name); form.append('slug', slug);
      form.append('description', description);
      form.append('countryOfOrigin', countryOfOrigin);
      form.append('website', website); form.append('status', status);
      form.append('seoTitle', seoTitle); form.append('seoDescription', seoDescription);
      form.append('categories', JSON.stringify([]));
      if (logoFile) form.append('logo', logoFile);

      const url = isEdit ? `/api/admin/brands/${initial._id}` : '/api/admin/brands';
      const res = await fetch(url, { method: isEdit ? 'PATCH' : 'POST', body: form });
      const json = await res.json();
      if (json.success) {
        toast(isEdit ? 'Brand updated.' : 'Brand created.', { type: 'success' });
        router.push('/admin/brands'); router.refresh();
      } else {
        toast(json.message || 'Save failed.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="grid gap-6 items-start max-[900px]:grid-cols-1" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Main */}
        <div className="flex flex-col gap-4">
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Basic info</h2>
            <AdminInput label="Brand name" value={name} onChange={(e) => setName(e.target.value)} required />
            <AdminInput label="Slug" value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
              hint="Auto-generated. Used in /brand/[slug] URLs." />
            <AdminTextarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <AdminInput label="Country of origin" value={countryOfOrigin} onChange={(e) => setCountry(e.target.value)} />
              <AdminInput label="Website URL" value={website} type="url" onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>SEO</h2>
            <AdminInput label="Meta title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            <AdminTextarea label="Meta description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Status</h2>
            <AdminSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
          </div>
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Logo</h2>
            {logoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo preview" className="max-h-20 max-w-[240px] object-contain border border-line p-3 bg-surface-alt block" />
            )}
            <input type="file" accept="image/*" onChange={onLogoChange} className="text-xs text-muted-fg cursor-pointer" />
            <p className="text-xs text-muted">PNG or SVG recommended.</p>
          </div>
          <div className="flex flex-col gap-3">
            <AdminBtn type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Create brand'}</AdminBtn>
            <AdminBtn variant="ghost" href="/admin/brands">Cancel</AdminBtn>
          </div>
        </div>
      </div>
    </form>
  );
}
