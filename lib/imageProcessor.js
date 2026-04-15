import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import sharp from 'sharp';

/**
 * Image upload pipeline.
 *
 * - Writes incoming image buffer to /public/uploads/<folder>/
 * - Generates three additional sizes: thumbnail (200), medium (600), large (1200)
 * - All outputs are webp (smaller, widely supported).
 * - Returns public URL paths that can go straight into a Mongoose document.
 *
 * Folder whitelist is enforced to prevent path traversal.
 */

const ALLOWED_FOLDERS = new Set([
  'products',
  'brands',
  'categories',
  'banners',
  'returns',
  'avatars',
  'invoices',
  'legal',
  'misc',
]);

const MAX_FILE_BYTES = Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024);
const ALLOWED_MIME = (
  process.env.ALLOWED_IMAGE_TYPES ||
  'image/jpeg,image/png,image/webp,image/jpg'
)
  .split(',')
  .map((s) => s.trim());

function randomId() {
  return crypto.randomBytes(10).toString('hex');
}

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Save a File (from FormData) into /public/uploads/<folder>/ and
 * return { url, thumbnail, medium, large, width, height, size }.
 */
export async function saveImage(file, folder) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    const err = new Error('No file provided.');
    err.status = 400;
    throw err;
  }
  if (!ALLOWED_FOLDERS.has(folder)) {
    const err = new Error('Invalid upload folder.');
    err.status = 400;
    throw err;
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    const err = new Error('Unsupported image type.');
    err.status = 400;
    throw err;
  }
  if (file.size > MAX_FILE_BYTES) {
    const err = new Error('Image is too large.');
    err.status = 400;
    throw err;
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const base = `${timestamp()}-${randomId()}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await fs.mkdir(dir, { recursive: true });

  const originalPath = path.join(dir, `${base}.webp`);
  const thumbPath = path.join(dir, `${base}-thumb.webp`);
  const mediumPath = path.join(dir, `${base}-med.webp`);
  const largePath = path.join(dir, `${base}-lg.webp`);

  const image = sharp(buffer).rotate(); // respect EXIF orientation
  const metadata = await image.metadata();

  await Promise.all([
    image.clone().webp({ quality: 88 }).toFile(originalPath),
    image
      .clone()
      .resize({ width: 200, height: 200, fit: 'cover' })
      .webp({ quality: 82 })
      .toFile(thumbPath),
    image
      .clone()
      .resize({ width: 600, height: 600, fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(mediumPath),
    image
      .clone()
      .resize({ width: 1200, height: 1200, fit: 'cover' })
      .webp({ quality: 88 })
      .toFile(largePath),
  ]);

  const urlBase = `/uploads/${folder}/${base}`;
  return {
    url: `${urlBase}.webp`,
    thumbnail: `${urlBase}-thumb.webp`,
    medium: `${urlBase}-med.webp`,
    large: `${urlBase}-lg.webp`,
    width: metadata.width || null,
    height: metadata.height || null,
    size: file.size,
  };
}

/**
 * Delete an uploaded image and all of its derivatives (best-effort).
 * Accepts the `url` returned by saveImage().
 */
export async function deleteImage(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  const base = url.replace(/\.webp$/i, '');
  const variants = ['.webp', '-thumb.webp', '-med.webp', '-lg.webp'];
  await Promise.all(
    variants.map(async (suffix) => {
      const p = path.join(process.cwd(), 'public', base + suffix);
      try {
        await fs.unlink(p);
      } catch {
        /* ignore — file may not exist */
      }
    })
  );
}
