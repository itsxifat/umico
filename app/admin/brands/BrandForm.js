'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminInput';
import styles from './BrandForm.module.css';

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

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
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.main}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic info</h2>
            <AdminInput label="Brand name" value={name} onChange={(e) => setName(e.target.value)} required />
            <AdminInput label="Slug" value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
              hint="Auto-generated. Used in /brand/[slug] URLs." />
            <AdminTextarea label="Description" value={description}
              onChange={(e) => setDescription(e.target.value)} rows={3} />
            <div className={styles.row}>
              <AdminInput label="Country of origin" value={countryOfOrigin}
                onChange={(e) => setCountry(e.target.value)} />
              <AdminInput label="Website URL" value={website} type="url"
                onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>SEO</h2>
            <AdminInput label="Meta title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            <AdminTextarea label="Meta description" value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
          </div>
        </div>
        <div className={styles.sidebar}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Status</h2>
            <AdminSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Logo</h2>
            {logoPreview && <img src={logoPreview} alt="Logo preview" className={styles.logoPreview} />}
            <input type="file" accept="image/*" onChange={onLogoChange} className={styles.fileInput} />
            <p className={styles.hint}>PNG or SVG recommended. Will be displayed on brand page.</p>
          </div>
          <div className={styles.btnRow}>
            <AdminBtn type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Create brand'}</AdminBtn>
            <AdminBtn variant="ghost" href="/admin/brands">Cancel</AdminBtn>
          </div>
        </div>
      </div>
    </form>
  );
}
