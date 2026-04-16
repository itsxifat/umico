import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { notFound } from 'next/navigation';
import ProductDetail from './ProductDetail';

export async function generateMetadata({ params }) {
  await dbConnect();
  const p = await Product.findOne({ slug: params.slug, status: 'active' }).select('name seoTitle seoDescription').lean();
  if (!p) return { title: 'Product Not Found — UMICO' };
  return {
    title: `${p.seoTitle || p.name} — UMICO`,
    description: p.seoDescription || '',
  };
}

export default async function ProductPage({ params }) {
  await dbConnect();
  const doc = await Product.findOne({ slug: params.slug, status: 'active' })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug')
    .lean();

  if (!doc) notFound();
  const product = JSON.parse(JSON.stringify(doc));

  // Fire and forget view count
  Product.findByIdAndUpdate(doc._id, { $inc: { viewCount: 1 } }).catch(() => {});

  return <ProductDetail product={product} />;
}
