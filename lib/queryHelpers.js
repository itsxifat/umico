import { slugify } from './validation.js';
import dbConnect from './db.js';

/**
 * Generate a unique slug. If the base slug already exists in the model,
 * appends a numeric suffix: my-slug, my-slug-2, my-slug-3, …
 *
 * @param {object} Model  Mongoose model with a `slug` field
 * @param {string} text   The source text (e.g. product name)
 * @param {string} [excludeId]  Mongo ObjectId string to exclude (for updates)
 */
export async function uniqueSlug(Model, text, excludeId = null) {
  await dbConnect();
  const base = slugify(text);
  let candidate = base;
  let n = 1;
  while (true) {
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const existing = await Model.findOne(q).lean();
    if (!existing) return candidate;
    n++;
    candidate = `${base}-${n}`;
  }
}

/**
 * Build MongoDB sort + pagination options from URL search params.
 * Returns { sort, skip, limit, page }.
 */
export function parsePagination(searchParams, defaultSortField = 'createdAt') {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const sortDir = searchParams.get('sortDir') === 'asc' ? 1 : -1;
  const sortField = searchParams.get('sortBy') || defaultSortField;
  return {
    sort: { [sortField]: sortDir },
    skip: (page - 1) * limit,
    limit,
    page,
  };
}

/**
 * Thin serializer — strips Mongoose internals, converts ObjectIds/Dates
 * to strings so the output is safe to JSON.stringify and send to clients.
 */
export function serialize(doc) {
  return JSON.parse(JSON.stringify(doc));
}
