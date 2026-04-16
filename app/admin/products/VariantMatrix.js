'use client';

import { useState, useEffect } from 'react';
import { AdminInput, AdminSelect } from '@/components/admin/AdminInput';
import AdminBtn from '@/components/admin/AdminBtn';
import styles from './VariantMatrix.module.css';

/**
 * VariantMatrix
 *
 * Props:
 *   dimensions: string[]                e.g. ['size', 'countryVariant']
 *   onDimensionsChange: (dims) => void
 *   variants: Variant[]                 current variant array
 *   onVariantsChange: (vs) => void
 *
 * A "variant" is:
 *   { dimensionValues: {size:'50ml', countryVariant:'Korean'}, sku, price, compareAtPrice, stock, lowStockThreshold, weight, status }
 */

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
  return {
    dimensionValues,
    sku: '',
    price: '',
    compareAtPrice: '',
    stock: 0,
    lowStockThreshold: 5,
    weight: 0,
    status: 'active',
  };
}

export default function VariantMatrix({ dimensions, onDimensionsChange, variants, onVariantsChange }) {
  // dimValues[dimName] = ['50ml', '100ml', ...]
  const [dimValues, setDimValues] = useState(() => {
    const map = {};
    for (const d of dimensions) map[d] = [];
    // Pre-populate from existing variants
    for (const v of variants) {
      for (const [k, val] of Object.entries(v.dimensionValues || {})) {
        if (!map[k]) map[k] = [];
        if (!map[k].includes(val)) map[k].push(val);
      }
    }
    return map;
  });
  const [newOption, setNewOption] = useState({}); // { [dim]: inputValue }

  // Regenerate variant list whenever dims or dimValues change
  useEffect(() => {
    if (!dimensions.length) return;
    const sets = dimensions.map((d) => dimValues[d] || []).filter((s) => s.length > 0);
    if (sets.length !== dimensions.length) return; // not all dims have values yet

    const combos = cartesian(sets);
    const newVariants = combos.map((combo) => {
      const dimObj = {};
      combo.forEach((val, i) => { dimObj[dimensions[i]] = val; });
      const key = makeKey(dimObj);
      // Keep existing variant data if it exists
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
    setDimValues((prev) => {
      const next = { ...prev };
      delete next[dim];
      return next;
    });
  };

  const addOption = (dim) => {
    const val = (newOption[dim] || '').trim();
    if (!val) return;
    setDimValues((prev) => ({
      ...prev,
      [dim]: prev[dim].includes(val) ? prev[dim] : [...prev[dim], val],
    }));
    setNewOption((prev) => ({ ...prev, [dim]: '' }));
  };

  const removeOption = (dim, val) => {
    setDimValues((prev) => ({
      ...prev,
      [dim]: prev[dim].filter((v) => v !== val),
    }));
  };

  const updateVariant = (idx, field, value) => {
    const next = variants.map((v, i) =>
      i === idx ? { ...v, [field]: value } : v
    );
    onVariantsChange(next);
  };

  const availableToAdd = AVAILABLE_DIMENSIONS.filter((d) => !dimensions.includes(d));

  return (
    <div className={styles.matrix}>
      {/* Dimension selector */}
      <div className={styles.dimHeader}>
        <h3 className={styles.dimTitle}>Variant dimensions</h3>
        {availableToAdd.length > 0 && (
          <div className={styles.addDim}>
            <AdminSelect
              value=""
              onChange={(e) => { if (e.target.value) addDimension(e.target.value); }}
            >
              <option value="">+ Add dimension</option>
              {availableToAdd.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </AdminSelect>
          </div>
        )}
      </div>

      {dimensions.length === 0 && (
        <p className={styles.noDims}>No variant dimensions selected. Add one above.</p>
      )}

      {/* Option values per dimension */}
      {dimensions.map((dim) => (
        <div key={dim} className={styles.dimRow}>
          <div className={styles.dimLabel}>
            <span>{dim}</span>
            <button type="button" className={styles.removeDim}
              onClick={() => removeDimension(dim)}>×</button>
          </div>
          <div className={styles.options}>
            {(dimValues[dim] || []).map((opt) => (
              <span key={opt} className={styles.optionTag}>
                {opt}
                <button type="button" onClick={() => removeOption(dim, opt)}>×</button>
              </span>
            ))}
            <div className={styles.addOption}>
              <input
                type="text"
                placeholder={`Add ${dim} option…`}
                value={newOption[dim] || ''}
                onChange={(e) => setNewOption((prev) => ({ ...prev, [dim]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(dim); } }}
                className={styles.optionInput}
              />
              <button type="button" className={styles.addOptionBtn}
                onClick={() => addOption(dim)}>+</button>
            </div>
          </div>
        </div>
      ))}

      {/* Variant table */}
      {variants.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.variantTable}>
            <thead>
              <tr>
                {dimensions.map((d) => <th key={d}>{d}</th>)}
                <th>SKU</th>
                <th>Price (৳)</th>
                <th>Compare (৳)</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => (
                <tr key={idx}>
                  {dimensions.map((d) => (
                    <td key={d} className={styles.dimValue}>{v.dimensionValues?.[d] || ''}</td>
                  ))}
                  <td>
                    <input type="text" value={v.sku || ''}
                      onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                      className={styles.varInput} placeholder="SKU" />
                  </td>
                  <td>
                    <input type="number" min="0" value={v.price || ''}
                      onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                      className={styles.varInput} placeholder="0" />
                  </td>
                  <td>
                    <input type="number" min="0" value={v.compareAtPrice || ''}
                      onChange={(e) => updateVariant(idx, 'compareAtPrice', e.target.value)}
                      className={styles.varInput} placeholder="0" />
                  </td>
                  <td>
                    <input type="number" min="0" value={v.stock ?? 0}
                      onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value, 10))}
                      className={styles.varInput} />
                  </td>
                  <td>
                    <select value={v.status || 'active'}
                      onChange={(e) => updateVariant(idx, 'status', e.target.value)}
                      className={styles.varSelect}>
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
