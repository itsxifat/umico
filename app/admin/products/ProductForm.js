'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/AdminInput';
import VariantMatrix from './VariantMatrix';
import styles from './ProductForm.module.css';

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

const SUITABILITY_OPTIONS = [
  { value: 'everyone', label: 'For Everyone' },
  { value: 'primarily_women', label: 'Primarily For Her' },
  { value: 'primarily_men', label: 'Primarily For Him' },
  { value: 'unisex', label: 'Unisex' },
];

export default function ProductForm({ initial }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [brandId, setBrandId] = useState(initial?.brand?._id || initial?.brand || '');
  const [categoryId, setCategoryId] = useState(initial?.category?._id || initial?.category || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [ingredients, setIngredients] = useState(initial?.ingredients || '');
  const [howToUse, setHowToUse] = useState(initial?.howToUse || '');
  const [suitability, setSuitability] = useState(initial?.suitability || 'everyone');
  const [status, setStatus] = useState(initial?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured || false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival || false);
  const [isBestSeller, setIsBestSeller] = useState(initial?.isBestSeller || false);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [tags, setTags] = useState((initial?.tags || []).join(', '));
  const [hasVariants, setHasVariants] = useState(initial?.hasVariants || false);
  const [variantDimensions, setVariantDimensions] = useState(initial?.variantDimensions || []);
  const [variants, setVariants] = useState(initial?.variants || []);
  // Single SKU fields
  const [price, setPrice] = useState(initial?.price || '');
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice || '');
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [sku, setSku] = useState(initial?.sku || '');
  const [weight, setWeight] = useState(initial?.weight || '');
  const [lowStockThreshold, setLowStockThreshold] = useState(initial?.lowStockThreshold ?? 5);
  // Images
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(initial?.mainImages || []);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    fetch('/api/admin/brands?limit=200&status=active')
      .then((r) => r.json()).then((j) => { if (j.success) setBrands(j.data); });
    fetch('/api/admin/categories?limit=200&status=active')
      .then((r) => r.json()).then((j) => { if (j.success) setCategories(j.data); });
  }, []);

  const onImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, { url: ev.target.result, alt: '' }]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    // If it's a new file (not existing), remove from imageFiles too
    const existingCount = initial?.mainImages?.length || 0;
    if (idx >= existingCount) {
      setImageFiles((prev) => prev.filter((_, i) => i !== (idx - existingCount)));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!brandId) { toast('Please select a brand.', { type: 'error' }); return; }
    if (!categoryId) { toast('Please select a category.', { type: 'error' }); return; }
    setSaving(true);

    try {
      const form = new FormData();
      form.append('name', name); form.append('slug', slug);
      form.append('brand', brandId); form.append('category', categoryId);
      form.append('description', description); form.append('ingredients', ingredients);
      form.append('howToUse', howToUse); form.append('suitability', suitability);
      form.append('status', status);
      form.append('isFeatured', isFeatured); form.append('isNewArrival', isNewArrival);
      form.append('isBestSeller', isBestSeller);
      form.append('seoTitle', seoTitle); form.append('seoDescription', seoDescription);
      form.append('tags', JSON.stringify(tags.split(',').map((t) => t.trim()).filter(Boolean)));
      form.append('hasVariants', hasVariants);
      form.append('variantDimensions', JSON.stringify(variantDimensions));
      form.append('variants', JSON.stringify(variants));
      form.append('price', price || 0); form.append('compareAtPrice', compareAtPrice || 0);
      form.append('stock', stock); form.append('sku', sku);
      form.append('weight', weight || 0); form.append('lowStockThreshold', lowStockThreshold);
      for (const f of imageFiles) form.append('images', f);

      const url = isEdit ? `/api/admin/products/${initial._id}` : '/api/admin/products';
      const res = await fetch(url, { method: isEdit ? 'PATCH' : 'POST', body: form });
      const json = await res.json();
      if (json.success) {
        toast(isEdit ? 'Product saved.' : 'Product created.', { type: 'success' });
        router.push('/admin/products'); router.refresh();
      } else {
        toast(json.message || 'Save failed.', { type: 'error' });
      }
    } catch (err) {
      toast('Network error.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'basic', label: 'Basic info' },
    { id: 'content', label: 'Content' },
    { id: 'variants', label: hasVariants ? `Variants (${variants.length})` : 'Pricing & Stock' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.layout}>
        {/* Tab navigation */}
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button key={t.id} type="button"
              className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          <div className={styles.main}>
            {/* Basic info tab */}
            {activeTab === 'basic' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Product identity</h2>
                <AdminInput label="Product name" value={name}
                  onChange={(e) => setName(e.target.value)} required />
                <AdminInput label="Slug" value={slug}
                  onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
                  hint="Auto-generated. Used in /product/[slug] URL." />
                <div className={styles.row2}>
                  <AdminSelect label="Brand" value={brandId}
                    onChange={(e) => setBrandId(e.target.value)} required>
                    <option value="">— Select brand —</option>
                    {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </AdminSelect>
                  <AdminSelect label="Category" value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">— Select category —</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </AdminSelect>
                </div>
                <AdminSelect label="Suitability" value={suitability}
                  onChange={(e) => setSuitability(e.target.value)}>
                  {SUITABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </AdminSelect>
                <AdminInput label="Tags (comma separated)" value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  hint="Used for search and filtering." />

                {/* Images */}
                <div className={styles.imageSection}>
                  <span className={styles.imageLabel}>Product images (1:1)</span>
                  <div className={styles.imagePreviews}>
                    {imagePreviews.map((img, i) => (
                      <div key={i} className={styles.imageThumb}>
                        <img src={img.url || img.thumbnail} alt={img.alt || ''} />
                        <button type="button" className={styles.removeImg}
                          onClick={() => removeImage(i)}>×</button>
                      </div>
                    ))}
                    <label className={styles.addImageBtn}>
                      <span>+</span>
                      <input type="file" accept="image/*" multiple
                        onChange={onImageChange} className={styles.hidden} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Content tab */}
            {activeTab === 'content' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Product content</h2>
                <AdminTextarea label="Description" value={description}
                  onChange={(e) => setDescription(e.target.value)} rows={6}
                  hint="Full product description. HTML is supported." />
                <AdminTextarea label="Ingredients" value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)} rows={4} />
                <AdminTextarea label="How to use" value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)} rows={4} />
              </div>
            )}

            {/* Variants / Pricing tab */}
            {activeTab === 'variants' && (
              <div className={styles.section}>
                <div className={styles.variantsHeader}>
                  <h2 className={styles.sectionTitle}>Pricing & inventory</h2>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={hasVariants}
                      onChange={(e) => { setHasVariants(e.target.checked); setVariants([]); setVariantDimensions([]); }} />
                    <span>This product has variants (sizes, colours, etc.)</span>
                  </label>
                </div>

                {!hasVariants ? (
                  <div className={styles.singlePricing}>
                    <div className={styles.row2}>
                      <AdminInput label="Price (৳)" type="number" min="0" value={price}
                        onChange={(e) => setPrice(e.target.value)} required />
                      <AdminInput label="Compare-at price (৳)" type="number" min="0"
                        value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)}
                        hint="Shown as original/crossed-out price." />
                    </div>
                    <div className={styles.row2}>
                      <AdminInput label="Stock quantity" type="number" min="0"
                        value={stock} onChange={(e) => setStock(e.target.value)} />
                      <AdminInput label="Low stock threshold" type="number" min="0"
                        value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
                    </div>
                    <div className={styles.row2}>
                      <AdminInput label="SKU" value={sku}
                        onChange={(e) => setSku(e.target.value)} />
                      <AdminInput label="Weight (grams)" type="number" min="0"
                        value={weight} onChange={(e) => setWeight(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <VariantMatrix
                    dimensions={variantDimensions}
                    onDimensionsChange={setVariantDimensions}
                    variants={variants}
                    onVariantsChange={setVariants}
                  />
                )}
              </div>
            )}

            {/* SEO tab */}
            {activeTab === 'seo' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Search engine optimisation</h2>
                <AdminInput label="SEO title" value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  hint="Defaults to product name. Max 60 characters." />
                <AdminTextarea label="SEO description" value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)} rows={3}
                  hint="Max 160 characters." />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Publish</h2>
              <AdminSelect label="Status" value={status}
                onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </AdminSelect>
              <div className={styles.checkboxes}>
                {[
                  [isFeatured, setIsFeatured, 'Featured'],
                  [isNewArrival, setIsNewArrival, 'New arrival'],
                  [isBestSeller, setIsBestSeller, 'Best seller'],
                ].map(([val, setter, label]) => (
                  <label key={label} className={styles.checkLabel}>
                    <input type="checkbox" checked={val}
                      onChange={(e) => setter(e.target.checked)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.btnRow}>
              <AdminBtn type="submit" loading={saving}>
                {isEdit ? 'Save changes' : 'Create product'}
              </AdminBtn>
              <AdminBtn variant="ghost" href="/admin/products">Cancel</AdminBtn>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
