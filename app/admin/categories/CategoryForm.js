'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminInput';

function slugify(str) {
  return String(str).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

const sectionCls = 'bg-surface border border-line p-6 flex flex-col gap-4';
const sectionTitleCls = 'font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line';

export default function CategoryForm({ initial }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [parentId, setParentId] = useState(initial?.parent?._id || initial?.parent || '');
  const [status, setStatus] = useState(initial?.status || 'active');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image || '');
  const [parents, setParents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    fetch('/api/admin/categories?limit=200&status=active')
      .then((r) => r.json())
      .then((j) => { if (j.success) setParents(j.data.filter((c) => c._id !== initial?._id)); })
      .catch(() => {});
  }, [initial]);

  const onImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name); form.append('slug', slug);
      form.append('description', description); form.append('parent', parentId || '');
      form.append('status', status); form.append('sortOrder', sortOrder);
      form.append('seoTitle', seoTitle); form.append('seoDescription', seoDescription);
      if (imageFile) form.append('image', imageFile);

      const url = isEdit ? `/api/admin/categories/${initial._id}` : '/api/admin/categories';
      const res = await fetch(url, { method: isEdit ? 'PATCH' : 'POST', body: form });
      const json = await res.json();

      if (json.success) {
        toast(isEdit ? 'Category updated.' : 'Category created.', { type: 'success' });
        router.push('/admin/categories'); router.refresh();
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
        {/* Main column */}
        <div className="flex flex-col gap-4">
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Basic info</h2>
            <AdminInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <AdminInput
              label="Slug" value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
              hint="URL-safe identifier. Auto-generated from name."
            />
            <AdminTextarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>SEO</h2>
            <AdminInput label="Meta title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} hint="Defaults to category name if empty." />
            <AdminTextarea label="Meta description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
          </div>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-4">
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Publish</h2>
            <AdminSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
            <AdminInput label="Sort order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} hint="Lower numbers appear first." />
            <AdminSelect label="Parent category" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— No parent (top level) —</option>
              {parents.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </AdminSelect>
          </div>

          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Image</h2>
            {imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="w-full aspect-square object-cover border border-line" />
            )}
            <input type="file" accept="image/*" onChange={onImageChange} className="text-xs text-muted-fg cursor-pointer" />
            <p className="text-xs text-muted">1:1 ratio recommended. Max 5 MB.</p>
          </div>

          <div className="flex flex-col gap-3">
            <AdminBtn type="submit" loading={saving}>
              {isEdit ? 'Save changes' : 'Create category'}
            </AdminBtn>
            <AdminBtn variant="ghost" href="/admin/categories">Cancel</AdminBtn>
          </div>
        </div>
      </div>
    </form>
  );
}
