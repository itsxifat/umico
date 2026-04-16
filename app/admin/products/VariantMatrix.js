'use client';

import { useState, useEffect } from 'react';
import { AdminSelect } from '@/components/admin/AdminInput';

const AVAILABLE_DIMENSIONS = ['size', 'countryVariant', 'volume', 'shade', 'type'];

function cartesian(arrays) {
  if (!arrays.length) return [[]];
  return arrays.reduce(
    (acc, cur) => acc.flatMap((a) => cur.map((v) => [...a, v])),
    [[]]
  );
}

function makeKey(dimValues) {
  return Object.entries(dimValues).sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`).join('|');
}

function emptyVariant(dimensionValues) {
  return { dimensionValues, sku: '', price: '', compareAtPrice: '', stock: 0, lowStockThreshold: 5, weight: 0, status: 'active' };
}

const inputCls = 'w-full px-2 py-1.5 border border-line-strong bg-canvas text-ink text-sm focus:outline-none focus:border-ink';

export default function VariantMatrix({ dimensions, onDimensionsChange, variants, onVariantsChange }) {
  const [dimValues, setDimValues] = useState(() => {
    const map = {};
    for (const d of dimensions) map[d] = [];
    for (const v of variants) {
      for (const [k, val] of Object.entries(v.dimensionValues || {})) {
        if (!map[k]) map[k] = [];
        if (!map[k].includes(val)) map[k].push(val);
      }
    }
    return map;
  });
  const [newOption, setNewOption] = useState({});

  useEffect(() => {
    if (!dimensions.length) return;
    const sets = dimensions.map((d) => dimValues[d] || []).filter((s) => s.length > 0);
    if (sets.length !== dimensions.length) return;

    const combos = cartesian(sets);
    const newVariants = combos.map((combo) => {
      const dimObj = {};
      combo.forEach((val, i) => { dimObj[dimensions[i]] = val; });
      const key = makeKey(dimObj);
      const existing = variants.find((v) => makeKey(v.dimensionValues || {}) === key);
      return existing || emptyVariant(dimObj);
    });
    onVariantsChange(newVariants);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, dimValues]);

  const addDimension = (dim) => {
    if (dimensions.includes(dim)) return;
    onDimensionsChange([...dimensions, dim]);
    setDimValues((prev) => ({ ...prev, [dim]: [] }));
  };

  const removeDimension = (dim) => {
    onDimensionsChange(dimensions.filter((d) => d !== dim));
    setDimValues((prev) => { const next = { ...prev }; delete next[dim]; return next; });
  };

  const addOption = (dim) => {
    const val = (newOption[dim] || '').trim();
    if (!val) return;
    setDimValues((prev) => ({ ...prev, [dim]: prev[dim].includes(val) ? prev[dim] : [...prev[dim], val] }));
    setNewOption((prev) => ({ ...prev, [dim]: '' }));
  };

  const removeOption = (dim, val) => {
    setDimValues((prev) => ({ ...prev, [dim]: prev[dim].filter((v) => v !== val) }));
  };

  const updateVariant = (idx, field, value) => {
    onVariantsChange(variants.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const availableToAdd = AVAILABLE_DIMENSIONS.filter((d) => !dimensions.includes(d));

  return (
    <div className="flex flex-col gap-5">
      {/* Dimension selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted">Variant dimensions</h3>
        {availableToAdd.length > 0 && (
          <div className="w-48">
            <AdminSelect value="" onChange={(e) => { if (e.target.value) addDimension(e.target.value); }}>
              <option value="">+ Add dimension</option>
              {availableToAdd.map((d) => <option key={d} value={d}>{d}</option>)}
            </AdminSelect>
          </div>
        )}
      </div>

      {dimensions.length === 0 && (
        <p className="text-sm text-muted italic">No variant dimensions selected. Add one above.</p>
      )}

      {/* Option values per dimension */}
      {dimensions.map((dim) => (
        <div key={dim} className="border border-line p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium tracking-wide uppercase text-ink">{dim}</span>
            <button type="button" onClick={() => removeDimension(dim)} className="text-muted hover:text-error transition-colors text-lg leading-none">×</button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {(dimValues[dim] || []).map((opt) => (
              <span key={opt} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-alt border border-line text-sm text-ink">
                {opt}
                <button type="button" onClick={() => removeOption(dim, opt)} className="text-muted hover:text-error leading-none ml-1">×</button>
              </span>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Add ${dim}…`}
                value={newOption[dim] || ''}
                onChange={(e) => setNewOption((prev) => ({ ...prev, [dim]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(dim); } }}
                className="px-3 py-1 border border-line-strong bg-canvas text-sm text-ink focus:outline-none focus:border-ink w-36"
              />
              <button type="button" onClick={() => addOption(dim)}
                className="px-3 py-1 border border-line-strong text-sm text-muted-fg hover:text-ink hover:border-ink transition-colors">
                +
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Variant table */}
      {variants.length > 0 && (
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {dimensions.map((d) => (
                  <th key={d} className="text-left px-3 py-2 text-[10px] font-semibold tracking-widest uppercase text-muted border-b border-line bg-surface whitespace-nowrap">{d}</th>
                ))}
                {['SKU', 'Price (৳)', 'Compare (৳)', 'Stock', 'Status'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold tracking-widest uppercase text-muted border-b border-line bg-surface whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => (
                <tr key={idx} className="hover:bg-surface-alt">
                  {dimensions.map((d) => (
                    <td key={d} className="px-3 py-2 border-b border-line text-sm font-medium text-muted-fg">{v.dimensionValues?.[d] || ''}</td>
                  ))}
                  <td className="px-3 py-2 border-b border-line">
                    <input type="text" value={v.sku || ''} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} className={inputCls} placeholder="SKU" />
                  </td>
                  <td className="px-3 py-2 border-b border-line">
                    <input type="number" min="0" value={v.price || ''} onChange={(e) => updateVariant(idx, 'price', e.target.value)} className={inputCls} placeholder="0" />
                  </td>
                  <td className="px-3 py-2 border-b border-line">
                    <input type="number" min="0" value={v.compareAtPrice || ''} onChange={(e) => updateVariant(idx, 'compareAtPrice', e.target.value)} className={inputCls} placeholder="0" />
                  </td>
                  <td className="px-3 py-2 border-b border-line">
                    <input type="number" min="0" value={v.stock ?? 0} onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value, 10))} className={inputCls} />
                  </td>
                  <td className="px-3 py-2 border-b border-line">
                    <select value={v.status || 'active'} onChange={(e) => updateVariant(idx, 'status', e.target.value)}
                      className="px-2 py-1.5 border border-line-strong bg-canvas text-ink text-sm focus:outline-none focus:border-ink appearance-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
